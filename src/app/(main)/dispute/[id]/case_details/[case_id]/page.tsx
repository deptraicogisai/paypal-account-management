'use client'
import api from "@/app/lib/api";
import dispute from "@/app/lib/paypal/dispute";
import ppHelper from "@/app/lib/paypal/helper";
import transaction from "@/app/lib/paypal/transaction";
import spHelper from "@/app/lib/supabase/supabaseHelper";
import { use, useEffect, useState } from "react";
import { Accordion, Alert, Button, Card, Container, ListGroup, Spinner, Table } from "react-bootstrap";

const CaseDetails = ({ params }: { params: Promise<{ id: number, case_id: string }> }) => {
    const [disputeDetail, setDisputeDetail] = useState();
    const [transactionDetail, setTransactionDetail] = useState();
    const [loading, setLoading] = useState(true);
    const { id, case_id } = use(params);
    const getDisputeDetail = async () => {
        try {
            var accountDetail = await spHelper.getAccount(id);
            api.setCredential(accountDetail.data?.client_id, accountDetail.data?.client_secret);
            var disputeDetail = await dispute.getDisputeDetail(case_id);
            setDisputeDetail(disputeDetail);
            var transactionResult = await transaction.getTransactionDetail(disputeDetail.create_time, disputeDetail.disputed_transactions[0].seller_transaction_id);
            setTransactionDetail(transactionResult?.transaction_details[0]);
            console.log(transactionResult?.transaction_details[0]);
        } catch (err) {

        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getDisputeDetail();
    }, []);

    return (
        <Container className="mt-3">
            <Alert variant="warning">
                <strong>{ppHelper.getDisputeReasonStatusDescription(disputeDetail?.reason)} - {disputeDetail?.dispute_life_cycle_stage?.toLowerCase?.()}</strong>
            </Alert>
            <Card>
                <Card.Body>
                    <Card.Title>
                        Case Status : Response Required
                    </Card.Title>
                    <Card.Text>
                        To help us resolve your case as quickly as posible we'll need you to
                        response by <strong>{ppHelper.convertToVNTime(disputeDetail?.seller_response_due_date)}</strong>
                    </Card.Text>
                    <Button variant="dark" className="me-2" style={{ borderRadius: "20px", fontSize: '12px' }}><b>Response</b></Button>
                    <Button variant="outline-secondary" style={{ borderRadius: "20px", fontSize: '12px' }}><b>Send Refund</b></Button>
                </Card.Body>
            </Card>
            <Accordion defaultActiveKey={["0", "1"]} alwaysOpen>
                <Accordion.Item eventKey="0">
                    <Accordion.Header style={{ background: "#f8f9fa" }}><strong>Case Details</strong></Accordion.Header>
                    <Accordion.Body>
                        {
                            loading ? (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                                <Spinner animation="border" />
                            </div>) : (
                                <Table>
                                    <tbody>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', width: '30%', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Case ID</td>
                                            <td style={{ textAlign: 'left', width: '70%', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>{disputeDetail?.dispute_id}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Disputed Amount</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>{disputeDetail?.dispute_amount.value}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Buyer Info</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>
                                                <div style={{ fontWeight: 500 }}>{transactionDetail?.payer_info.payer_name.alternate_full_name}</div>
                                                <div>{transactionDetail?.payer_info.email_address}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Shipping Address</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>
                                                <div dangerouslySetInnerHTML={{ __html: ppHelper.getShippingAddress(transactionDetail?.shipping_info.address) }} />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Date Reported</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>{ppHelper.convertToVNTime(disputeDetail?.create_time)}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Invoice ID</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>{transactionDetail?.transaction_info.invoice_id}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Transaction ID</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>{transactionDetail?.transaction_info.transaction_id}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Transaction Amount</td>
                                            <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>
                                                {transactionDetail?.transaction_info.transaction_amount.value} {transactionDetail?.transaction_info.transaction_amount.currency_code}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            )
                        }

                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header><strong>Item details</strong></Accordion.Header>
                    <Accordion.Body>
                        {
                            loading ? (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                                <Spinner animation="border" />
                            </div>) : (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {
                                        transactionDetail?.cart_info.item_details.map((t: any, idx: number) => {
                                            return (
                                                <Card style={{ width: '18rem' }} key={idx} bg="light">
                                                    <Card.Body>
                                                        <Card.Title style={{ fontSize: '15px' }}>{t.item_name}</Card.Title>
                                                    </Card.Body>
                                                    <ListGroup className="list-group-flush">
                                                        <ListGroup.Item variant="primary">Item Number : {t.item_code}</ListGroup.Item>
                                                        <ListGroup.Item variant="secondary">Quantity : {t.item_quantity}</ListGroup.Item>
                                                    </ListGroup>
                                                </Card>
                                            )
                                        })
                                    }
                                </div>
                            )
                        }
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Container>
    );
}

export default CaseDetails