"use client";
import { Button, Col, Container, Form, InputGroup, Row, Spinner, Table, Image, Dropdown } from "react-bootstrap";
import PaypalAccountModal from "../../modals/paypal-account-modal";
import { useEffect, useRef, useState } from "react";
import { PaypalAccount, PaypalResult } from "../../models/account";
import spHelper from "../../lib/supabase/supabaseHelper";
import Paging from "../../components/paging";
import ComfirmModal from "../../modals/confirm";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlineGlobal } from "react-icons/ai";
import { CiBank } from "react-icons/ci";
import DisputeModal from "../../modals/dispute-modal";
import SendPaymentModal from "@/app/modals/send-payment-modal";
import api from "@/app/lib/api";
import { Popconfirm, Result, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);

export default function Account() {
    const [show, setShow] = useState(false);
    const [allAccounts, setAllAccounts] = useState<PaypalAccount[]>([]);
    const [data, setData] = useState<PaypalResult>();
    const [account, setAccount] = useState<PaypalAccount>();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [searchCriteria, setsearchCriteria] = useState({
        email: "",
        domain: "",
        bank: ""
    });
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [sendPaymentShow, setSendPaymentShow] = useState<boolean>(false);
    const [loadingAccounts, setLoadingAccounts] = useState<Set<number>>(new Set());
    const skipNextFetch = useRef(false);
    const pageSize = Number(process.env.NEXT_PUBLIC_PAGE_SIZE || 5);

    // Filter and paginate accounts
    const filterAccounts = (accounts: PaypalAccount[], criteria: typeof searchCriteria): PaypalAccount[] => {
        return accounts.filter((acc: PaypalAccount) =>
            (!criteria.email || acc.email?.toLowerCase().includes(criteria.email.toLowerCase())) &&
            (!criteria.domain || acc.domain?.toLowerCase().includes(criteria.domain.toLowerCase())) &&
            (!criteria.bank || acc.bank?.toLowerCase().includes(criteria.bank.toLowerCase()))
        );
    };
    const paginateAccounts = (accounts: PaypalAccount[], page: number, pageSize: number): PaypalAccount[] => {
        const start = (page - 1) * pageSize;
        return accounts.slice(start, start + pageSize);
    };
    const updatePagedData = (
        accounts: PaypalAccount[] = allAccounts,
        criteria: typeof searchCriteria = searchCriteria,
        page: number = currentPage
    ) => {
        const filtered = filterAccounts(accounts, criteria);
        setData({
            items: paginateAccounts(filtered, page, pageSize),
            total_items: filtered.length,
        });
    };

    useEffect(() => {
        // Fetch all accounts once
        const fetchAll = async () => {
            setLoading(true);
            try {
                const all = await spHelper.fetchAllAccounts();
                setAllAccounts(all.items);
                updatePagedData(all.items, searchCriteria, 1);
                // Fetch details in background
                all.items.forEach(item => {
                    setLoadingAccounts(prev => new Set(prev).add(item.id));
                    spHelper.fetchTransactionAndBalance(item).then(accountWithDetails => {
                        setAllAccounts(prev =>
                            prev.map(i => i.id === accountWithDetails.id ? accountWithDetails : i)
                        );
                        setLoadingAccounts(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(item.id);
                            return newSet;
                        });
                    }).catch(() => {
                        setLoadingAccounts(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(item.id);
                            return newSet;
                        });
                    });
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        updatePagedData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allAccounts, searchCriteria, currentPage]);

    const setCredential = async (id: number) => {
        var accountDetail = await spHelper.getAccount(id);

        if (isSandbox == 0) {
            api.setCredential(accountDetail.data?.client_id, accountDetail.data?.client_secret);
        }
        else {
            api.setCredential(accountDetail.data?.sandbox_client_id, accountDetail.data?.sandbox_client_secret);
        }
    }

    const confirmRemove = (account: PaypalAccount) => {
        setAccount(account);
        setShowConfirm(true);
    }

    const removeAccount = async (account: any) => {
        if (!account) return;
        const removeResult = await spHelper.removeAccount(account.id);
        if (removeResult.success) {
            // Remove the account from allAccounts and update paged data
            setAllAccounts(prev => prev.filter((item: PaypalAccount) => item.id !== account.id));
            setShowConfirm(false);
            setCurrentPage(1);
        }
    }

    // Modified addAccount to reset account before showing modal
    const addAccount = () => {
        setAccount(undefined);
        setShow(true);
    }

    const viewAccount = (item: PaypalAccount) => {
        console.log(item);
        setAccount(item);
        setShow(true);
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);

        // fetchTransactions depends on currentPage, but setState is async.
        // So, use a useEffect to fetch when currentPage changes.
        // Just update the page here.
    }

    const handleAccountAdded = async (account: any, isEdit: boolean) => {
        setAccount(account);

        // Add account to the list immediately
        if (isEdit) {
            const idx = allAccounts.findIndex((item: any) => item.id === account.id);
            if (idx !== undefined && idx !== -1) {
                allAccounts[idx] = account;
            }
        } else {
            if (allAccounts) {
                allAccounts.unshift(account);
                setCurrentPage(1);
            }
        }
        // Set data to display (update paged data)
        updatePagedData(allAccounts, searchCriteria, 1);

        skipNextFetch.current = true; // just set page, do not call fetchData here

        // Load transaction and balance data in background
        setLoadingAccounts(prev => new Set(prev).add(account.id));

        try {
            await spHelper.fetchTransactionAndBalance(account);

            const idx = allAccounts.findIndex((item: any) => item.id === account.id);
            if (idx !== undefined && idx !== -1) {
                allAccounts[idx] = account;
            }
            // Update paged data again after loading transaction and balance
            updatePagedData(allAccounts, searchCriteria, 1);
        } catch (error) {
            console.error('Error loading transaction and balance data:', error);
        } finally {
            setLoadingAccounts(prev => {
                const newSet = new Set(prev);
                newSet.delete(account.id);
                return newSet;
            });
        }
    }

    const handleSearch = (e?: any) => {
        if (e) e.preventDefault();
        setCurrentPage(1);
        updatePagedData(allAccounts, searchCriteria, 1);
    };
    const handleReset = () => {
        setsearchCriteria({ bank: "", domain: "", email: "" });
        setCurrentPage(1);
        updatePagedData(allAccounts, { bank: "", domain: "", email: "" }, 1);
    };

    const onHideModal = () => {
        setShowDisputeModal(false);
        setSendPaymentShow(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setsearchCriteria(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const showDisputeOverview = (item: any) => {
        setAccount(item);
        setShowDisputeModal(true);
    }

    const sendPayment = async (item: any) => {
        var accountDetail = await spHelper.getAccount(item.id);
        if (isSandbox == 0) {
            api.setCredential(accountDetail.data?.client_id, accountDetail.data?.client_secret);
        }
        else {
            api.setCredential(accountDetail.data?.sandbox_client_id, accountDetail.data?.sandbox_client_secret);
        }
        setSendPaymentShow(true);
    }

    // Inline style for the search form border highlight
    const searchFormStyle: React.CSSProperties = {
        border: "1px solid gray",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
        background: "#f8f9fa"
    };

    return (
        <Container className="mt-5">
            <div style={searchFormStyle}>
                <Form onSubmit={handleSearch}>
                    <Row className="align-items-end">
                        <Col md={3} sm={6} xs={12}>
                            <Form.Label>Email</Form.Label>
                            <InputGroup className="mb-2">
                                <InputGroup.Text id="basic-addon1">
                                    <MdOutlineEmail />
                                </InputGroup.Text>
                                <Form.Control
                                    name="email"
                                    onChange={handleChange}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                    value={searchCriteria.email}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3} sm={6} xs={12}>
                            <Form.Label>Domain</Form.Label>
                            <InputGroup className="mb-2">
                                <InputGroup.Text>
                                    <AiOutlineGlobal />
                                </InputGroup.Text>
                                <Form.Control
                                    name="domain"
                                    onChange={handleChange}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                    value={searchCriteria.domain}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={3} sm={6} xs={12}>
                            <Form.Label>Bank</Form.Label>
                            <InputGroup className="mb-2">
                                <InputGroup.Text id="basic-addon1">
                                    <CiBank />
                                </InputGroup.Text>
                                <Form.Control
                                    name="bank"
                                    onChange={handleChange}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                    value={searchCriteria.bank}
                                />
                            </InputGroup>
                        </Col>
                        <Col md={2} sm={6} xs={12} className="mb-2 d-flex gap-2">
                            <Button onClick={handleSearch} variant="primary">
                                Search
                            </Button>
                            <Button type="button" variant="secondary" onClick={handleReset}>
                                Reset
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
            {
                loading ? (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                    {/* <Spinner animation="grow" variant="primary" /> */}
                    <Spin fullscreen={true} tip="Loading..."></Spin>
                </div>) : (<>
                    <div className="d-flex justify-content-end">
                        <Button className="my-3" onClick={addAccount}>Add Account</Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th style={{ width: "18%" }}>Email</th>
                                <th style={{ width: "14%" }}>Domain</th>
                                <th style={{ width: "18%" }}>Note</th>
                                <th style={{ width: "20%" }}>Balance</th>
                                <th style={{ width: "12%" }}>Dispute</th>
                                <th className="text-center" style={{ width: "12%" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (data?.total_items ?? 0) > 0 ? (data?.items.map((item: PaypalAccount) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>{item.email}</td>
                                            <td>{item.domain}</td>
                                            <td>{item.note}</td>
                                            <td>
                                                {loadingAccounts.has(item.id) ? (
                                                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 100 }}>
                                                        <Spinner animation="border" size="sm" variant="primary" />
                                                        <span className="ms-2" style={{ fontSize: 13 }}>Loading balance...</span>
                                                    </div>
                                                ) : (
                                                    item.balances?.map((t, idx) => {
                                                        return (
                                                            <div className="mb-3" key={idx}>
                                                                <Row>
                                                                    <Col xs={2}>
                                                                        {(() => {
                                                                            switch (t.currency) {
                                                                                case 'USD':
                                                                                    return <Image src="/image/usa_flag.png" rounded width={25} />;
                                                                                case 'VND':
                                                                                    return <Image src="/image/vietnam_flag.png" rounded width={25} />;
                                                                                case 'HKD':
                                                                                    return <Image src="/image/hongkong_flag.png" rounded width={25} />;
                                                                            }
                                                                        })()}
                                                                    </Col>
                                                                    <Col>
                                                                        <Row>
                                                                            <Col><b>Total:</b></Col>
                                                                            <Col>
                                                                                <span>
                                                                                    ${Number(t.total_balance.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                </span>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col><b>Available:</b></Col>
                                                                            <Col>
                                                                                <span>
                                                                                    ${Number(t.available_balance.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                </span>
                                                                            </Col>
                                                                        </Row>
                                                                        <Row>
                                                                            <Col><b>Withheld:</b></Col>
                                                                            <Col>
                                                                                <span>
                                                                                    ${Number(t.withheld_balance.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                                </span>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
                                                            </div>
                                                        )
                                                    })
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {
                                                    loadingAccounts.has(item.id) ? (
                                                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 100 }}>
                                                            <Spinner animation="border" size="sm" variant="primary" />
                                                            <span className="ms-2" style={{ fontSize: 13 }}>Loading disputes...</span>
                                                        </div>
                                                    ) :
                                                        (item.disputes != undefined) ? (
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" size="sm" style={{ width: '100%' }}>
                                                                    {item.disputes?.filter((d: any) => d.dispute_state === 'REQUIRED_ACTION').length ?? 0}
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={() => showDisputeOverview(item)}>Overview</Dropdown.Item>
                                                                    <Dropdown.Item href={`/dispute/${item.id}`} target="_blank">View List</Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>) : (<></>)
                                                }
                                            </td>
                                            <td className="text-center">
                                                <Row>
                                                    <Col xs={2} md={2} lg={5}>
                                                        <div className="action-button-container d-flex flex-column align-items-center">
                                                            <a
                                                                href="#"
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    viewAccount(item)
                                                                }}
                                                                className="w-100 d-flex flex-column align-items-center"
                                                            >
                                                                <div className="action-button d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                                                                    <Image src="/image/view.png" rounded style={{ width: '25px', height: '25px', objectFit: 'contain' }} />
                                                                </div>
                                                                <div className="w-100 d-flex justify-content-center">
                                                                    <span className="text-center">View</span>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </Col>
                                                    <Col xs={2} md={2} lg={5}>
                                                        <div className="action-button-container d-flex flex-column align-items-center">
                                                            <Popconfirm
                                                                title="Delete confirmation"
                                                                description="Are you sure to delete this account?"
                                                                okText="Yes"
                                                                onConfirm={() => removeAccount(item)}
                                                                cancelText="No"
                                                                showArrow = {false}
                                                            >
                                                                <a
                                                                    href="#"
                                                                    onClick={e => {
                                                                        e.preventDefault();
                                                                        // confirmRemove(item);
                                                                    }}
                                                                    className="w-100 d-flex flex-column align-items-center"
                                                                >
                                                                    <div className="action-button d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                                                                        <Image src="/image/remove.png" rounded style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                                                    </div>
                                                                    <div className="w-100 d-flex justify-content-center">
                                                                        <span className="text-center">Remove</span>
                                                                    </div>
                                                                </a>
                                                            </Popconfirm>
                                                        </div>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col xs={2} md={2} lg={5}>
                                                        <div className="action-button-container d-flex flex-column align-items-center">
                                                            <a
                                                                href="#"
                                                                onClick={e => {
                                                                    e.preventDefault();
                                                                    window.open(`/transaction/${item.id}`, '_blank');
                                                                }}
                                                                className="w-100 d-flex flex-column align-items-center"
                                                            >
                                                                <div className="action-button d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                                                                    <Image src="/image/transaction.png" rounded style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                                                </div>
                                                                <div className="w-100 d-flex justify-content-center">
                                                                    <span className="text-center">Transactions</span>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </Col>
                                                    <Col xs={2} md={2} lg={5}>
                                                        <div className="action-button-container d-flex flex-column align-items-center">
                                                            <a href="#" className="w-100 d-flex flex-column align-items-center" onClick={() => sendPayment(item)}>
                                                                <div className="action-button d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', overflow: 'hidden' }}>
                                                                    <Image src="/image/send-payment.png" rounded style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                                                </div>
                                                                <span className="w-100 d-flex justify-content-center">Send Payments</span>
                                                            </a>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </td>
                                        </tr>
                                    )
                                })) : (
                                    <tr>
                                        <td colSpan={7} className="text-center">
                                            No accounts found.
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </Table>
                    {
                        (data?.total_items ?? 0) > 0 ? (
                            <Paging currentPage={currentPage} totalPages={Math.ceil(data?.total_items / 5)} onPageChange={handlePageChange}></Paging>
                        ) : (
                            <></>
                        )
                    }
                </>)
            }
            <PaypalAccountModal show={show} onHide={() => setShow(false)} account={account} onSuccess={handleAccountAdded} />
            <ComfirmModal show={showConfirm} onRemove={removeAccount} onHide={() => setShowConfirm(false)} ></ComfirmModal>
            {
                showDisputeModal ? (<DisputeModal show={showDisputeModal} disputes={account?.disputes} onHide={onHideModal}></DisputeModal>) : <></>

            }
            {
                sendPaymentShow ? <SendPaymentModal show={sendPaymentShow} onHide={onHideModal}></SendPaymentModal> : (<></>)
            }
        </Container>
    );
}
