"use client";
import { Button, Col, Container, Form, InputGroup, Row, Spinner, Table, Image, Dropdown } from "react-bootstrap";
import PaypalAccountModal from "../../modals/paypal-account-modal";
import { useEffect, useState } from "react";
import { PaypalAccount, PaypalResult } from "../../models/account";
import spHelper from "../../lib/supabase/supabaseHelper";
import Paging from "../../components/paging";
import ComfirmModal from "../../modals/confirm";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlineGlobal } from "react-icons/ai";
import { CiBank } from "react-icons/ci";
import DisputeModal from "../../modals/dispute-modal";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
export default function Account() {
    const [show, setShow] = useState(false);
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

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const page_size = Number(process.env.NEXT_PUBLIC_PAGE_SIZE || 5);
            const data = await spHelper.fetchPagedData(currentPage, page_size, searchCriteria);
            console.log(data);
            setData(data);
        } catch (error) {
            setData(undefined);
        } finally {
            setLoading(false);
        }
    }

    const confirmRemove = (account: PaypalAccount) => {
        setAccount(account);
        setShowConfirm(true);
    }

    const removeAccount = async () => {
        if (!account) return;
        const removeResult = await spHelper.removeAccount(account.id);
        if (removeResult.success) {
            setShowConfirm(false);
            setCurrentPage(1);
            fetchData();
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

    const handleAccountAdded = (account: any) => {
        setAccount(account)
        fetchData();
    }

    const handleSearch = () => {
        setCurrentPage(1);
        fetchData();
    }

    const handleReset = () => {

    }

    const onHideModal = () => {
        setShowDisputeModal(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setsearchCriteria(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const showDisputeOverview = (item) => {
        setAccount(item);
        setShowDisputeModal(true);
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
                    <Spinner animation="border" />
                </div>) : (<>
                    <div className="d-flex justify-content-end">
                        <Button className="my-3" onClick={addAccount}>Add Account</Button>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Domain</th>
                                <th>Note</th>
                                <th>Balance</th>
                                <th>Dispute</th>
                                <th className="text-center">Action</th>
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
                                                {
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
                                                }
                                            </td>
                                            <td className="text-center">
                                                {
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
                                                <Button className="mx-3" variant="outline-primary" onClick={() => viewAccount(item)}>View</Button>
                                                <Button variant="outline-danger" onClick={() => confirmRemove(item)}>Remove</Button>
                                                <div className="mt-2">
                                                    <Button
                                                        variant="outline-success"
                                                        onClick={() => window.open(`/transaction/${item.id}`, '_blank')}
                                                    >
                                                        View List Transactions
                                                    </Button>
                                                </div>
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
                            <Paging currentPage={currentPage} totalPages={data?.total_pages ?? 0} onPageChange={handlePageChange}></Paging>
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
        </Container>
    );
}
