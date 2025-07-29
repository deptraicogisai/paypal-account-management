'use client'
import Paging from "@/app/components/paging";
import api from "@/app/lib/api";
import dispute from "@/app/lib/paypal/dispute";
import ppHelper from "@/app/lib/paypal/helper";
import spHelper from "@/app/lib/supabase/supabaseHelper";
import { PaypalAccount } from "@/app/models/account";
import { env } from "process";
import { use, useEffect, useState } from "react";
import { Badge, Button, Col, Container, Dropdown, Form, InputGroup, Row, Spinner, Table } from "react-bootstrap";
import { CiSettings } from "react-icons/ci";

const DisputePage = ({ params }: { params: Promise<{ id: number }> }) => {
    const [data, setData] = useState<DisputeData>();
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [account, setAccount] = useState<any>();
    const [disputeStatus, setDisputeStatus] = useState("");
    const [showLoadMore, setShowLoadMore] = useState(false);
    const { id } = use(params); // unwrap the promise properly
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [dataPaging, setDataPaging] = useState<DisputeData>();
    const [filterData, setFilerData] = useState<DisputeData>();
    const [totalResul, setTotalResult] = useState(0);
    const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);

    const fetchDispute = async () => {
        try {
            var accountDetail = await spHelper.getAccount(id);
            setAccount(accountDetail);
            if (isSandbox == 0) {
                api.setCredential(accountDetail.data?.client_id, accountDetail.data?.client_secret);
            }
            else {
                api.setCredential(accountDetail.data?.sandbox_client_id, accountDetail.data?.sandbox_client_secret);
            }

            var data = await dispute.getListDisputes();
            // Split data items with paging
            const pageSize = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
            const pagedItems = data.items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
            setDataPaging(pagedItems);
            setData(data);
            const total = Math.ceil(data.items.length / pageSize);
            setTotalPage(total);
            setTotalResult(data.items.length);
            console.log(data);
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDispute();
    }, [])
    // Inline style for the search form border highlight
    const searchFormStyle: React.CSSProperties = {
        border: "1px solid gray",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "24px",
        background: "#f8f9fa"
    };

    const loadMore = async (href: string) => {
        try {
            setLoadingMore(true);
            var next_page_url = href.replace('https://api-m.paypal.com/v1', '');
            var data = await dispute.getListDisputes(next_page_url);
            // var disputeDetail = await dispute.getDisputeDetail('PP-R-FMY-581585362');
            // console.log(disputeDetail);
            console.log(data);
            setData(prev => ({
                ...prev,
                items: [...prev.items, ...data.items],
                links: data.links, // override links with new page's links
            }));
        } catch (error) {

        } finally {
            setLoadingMore(false);
        }
    }

    const handleSearch = async () => {
        let dispute_url;
        try {
            // setLoading(true);
            // setData(undefined);
            // if (disputeStatus != "") {
            //     dispute_url = `/customer/disputes?dispute_state=${disputeStatus}&page_size=5`;
            // }

            // var data = await dispute.getListDisputes(dispute_url);
            // setData(data);            
            const pageSize = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
            if (disputeStatus != "") {
                debugger;
                var filteredData = data.items.filter(item => item.dispute_state === disputeStatus);
                const pagedItems = filteredData.slice(0, pageSize);
                const totalPage = Math.ceil(filteredData.length / pageSize);
                setFilerData(filteredData);
                setDataPaging(pagedItems);
                setCurrentPage(1);
                setTotalPage(totalPage);
                setTotalResult(filteredData.length);
            } else {
                // Split data items with paging
                const pagedItems = data.items.slice(0, pageSize);
                setDataPaging(pagedItems);
                setData(data);
                const totalPage = Math.ceil(data.items.length / pageSize);
                setTotalPage(totalPage);
                setTotalResult(data.items.length);
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const pageSize = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
        var currentData = disputeStatus != "" ? filterData : data?.items;
        const pagedItems = currentData?.slice((page - 1) * pageSize, page * pageSize);
        setDataPaging(pagedItems);
    }

    const handleReset = () => {

    }

    return (
        <Container className="mt-5">
            <div style={searchFormStyle}>
                <Form onSubmit={handleSearch}>
                    <Row className="align-items-end">
                        <Col md={3} sm={6} xs={12}>
                            <Form.Label>Dispute Status</Form.Label>
                            <InputGroup className="mb-2">
                                <Form.Select
                                    name="dispute_status"
                                    onChange={e => setDisputeStatus(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                // value={searchCriteria.dispute_status}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="REQUIRED_ACTION">Needs your attention</option>
                                    <option value="RESOLVED">Closed</option>
                                </Form.Select>
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
                    <div className="my-3 d-flex justify-content-end">
                        <b>{totalResul} results</b>
                    </div>
                    <Table striped bordered hover>
                        <thead>
                            <tr className="text-center">
                                <th>Case ID</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Last updated</th>
                                <th>Due date</th>
                                {/* <th className="text-center">
                                    <CiSettings />
                                </th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                ((dataPaging?.length ?? 0) > 0) ? (dataPaging?.map((item: any) => {
                                    return (
                                        <tr key={item.dispute_id} >
                                            <td>
                                                <a
                                                    href={`/dispute/${id}/case_details/${item.dispute_id}`}
                                                    target="_blank"
                                                    className="dispute_link"
                                                >
                                                    {item.dispute_id}
                                                </a>
                                                {
                                                    item?.seller_response_due_date && ppHelper.hightlightDueDate(ppHelper.convertToVNTime(item?.seller_response_due_date)) && <Badge bg="danger" className="mx-2" pill><b>Response</b></Badge>
                                                }
                                            </td>
                                            <td>{ppHelper.getDisputeReasonStatusDescription(item.reason)}</td>
                                            <td>{item.status == 'RESOLVED' ? (<span className={`lb-${item.outcome.toLowerCase()}`}>{item.outcome}</span>) : ppHelper.getDisputeReasonStatusDescription(item.status)}</td>
                                            <td>{item.dispute_amount.value} {item.dispute_amount.currency_code}</td>
                                            <td>{ppHelper.convertToVNTime(item.update_time)}</td>
                                            <td>{ppHelper.convertToVNTime(item?.seller_response_due_date ? item?.seller_response_due_date : item?.buyer_response_due_date)}</td>
                                            {/* <td className="text-center">
                                                <Dropdown>
                                                    <Dropdown.Toggle variant="outline-primary" id="dropdown-basic" size="sm">
                                                        Action
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu>
                                                        {
                                                            (item.status == 'WAITING_FOR_SELLER_RESPONSE') && <Dropdown.Item href="#/action-1">Response</Dropdown.Item>
                                                        }
                                                        <Dropdown.Item href="#/action-3">Transaction Details</Dropdown.Item>
                                                        <Dropdown.Item href={`/dispute/${id}/case_details/${item.dispute_id}`} target="_blank">Case Details</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td> */}
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

                </>)
            }
            {/* {
                
                ((data?.links && data.links[2]?.rel == 'next') && (
                    <div className="d-flex justify-content-center my-3">
                        {loadingMore ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Loading...
                            </>
                        ) : (
                            <Button variant="outline-primary" onClick={() => loadMore(data?.links[2].href)}>Load More</Button>
                        )}
                    </div>
                ))} */}

            {
                (dataPaging?.length > 0) ? (
                    <Paging currentPage={currentPage} totalPages={totalPage} onPageChange={handlePageChange}></Paging>
                ) : (
                    <></>
                )
            }
        </Container>
    )
}

export default DisputePage