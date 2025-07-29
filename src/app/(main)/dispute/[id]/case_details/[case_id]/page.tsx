'use client'
import Conversation from "@/app/components/conversation";
import api from "@/app/lib/api";
import dispute from "@/app/lib/paypal/dispute";
import ppHelper from "@/app/lib/paypal/helper";
import transaction from "@/app/lib/paypal/transaction";
import spHelper from "@/app/lib/supabase/supabaseHelper";
import NotificationModal from "@/app/modals/notification-modal";
import ResponseDisputeModal from "@/app/modals/response-dispute-modal";
import SendPartialRefundModal from "@/app/modals/send-partial-refund-modal";
import SendRefund from "@/app/modals/send-refund-modal";
import SendReplacementWithoutReturnModal from "@/app/modals/send-replacement-modal";
import SendReplacementRefundModal from "@/app/modals/send-replacement-refund";
import { use, useEffect, useState } from "react";
import { Accordion, Alert, Button, Card, Col, Container, FloatingLabel, Form, ListGroup, Row, Spinner, Table, Image, Badge } from "react-bootstrap";

const CaseDetails = ({ params }: { params: Promise<{ id: number, case_id: string }> }) => {
    const [disputeDetail, setDisputeDetail] = useState();
    const [transactionDetail, setTransactionDetail] = useState();
    const [loading, setLoading] = useState(true);
    const { id, case_id } = use(params);
    const isSandbox = Number(process.env.NEXT_PUBLIC_SANDBOX);
    const [showReponseDisputeModal, setshowReponseDisputeModal] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [sending, setSending] = useState<boolean>(false);
    const [showSendRefundModal, setShowSendRefundModal] = useState<boolean>(false);
    const [showSendPartialRefundModal, setShowSendPartialRefundModal] = useState<boolean>(false);
    const [showSendReplacementWithoutRefundModal, setShowSendReplacementWithoutRefundModal] = useState<boolean>(false);
    const [showSendReplacementRefundModal, setshowSendReplacementRefundModal] = useState<boolean>(false);
    const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>("");

    const getDisputeDetail = async () => {
        try {
            setLoading(true);
            var accountDetail = await spHelper.getAccount(id);
            if (isSandbox == 0) {
                api.setCredential(accountDetail.data?.client_id, accountDetail.data?.client_secret);
            }
            else {
                api.setCredential(accountDetail.data?.sandbox_client_id, accountDetail.data?.sandbox_client_secret);
            }
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

    const onHide = () => {
        setshowReponseDisputeModal(false);
        setShowSendRefundModal(false);
        setShowNotificationModal(false);
        setShowSendPartialRefundModal(false);
        setShowSendReplacementWithoutRefundModal(false);
        setshowSendReplacementRefundModal(false);
    }

    const onHideAndShowModal = (message: string) => {
        setNotificationMessage(message);
        setShowNotificationModal(true);
    }

    const sendMessage = async () => {
        setSending(true);
        var result = await dispute.sendMessage(disputeDetail?.dispute_id, message);
        if (result.success) {
            getDisputeDetail();
        } else {
            alert(result.message);
        }
        setSending(false);
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
                        We recommend you to work with customer to resolve this issue amicably by <strong>{ppHelper.convertToVNTime(disputeDetail?.seller_response_due_date ? disputeDetail?.seller_response_due_date : disputeDetail?.buyer_response_due_date)}</strong>.
                        A delay in your response could make the buyer escalate the issue to PayPal.
                    </Card.Text>
                    <Button variant="outline-secondary" className="offer-button" onClick={() => setShowSendRefundModal(true)}><b>Send Refund</b></Button>
                    {
                        ppHelper.getMakeOffer(disputeDetail?.allowed_response_options.accept_claim?.accept_claim_types).allowPartialRefund ?
                            <>
                                <Button variant="outline-secondary" className="offer-button" onClick={() => setShowSendReplacementWithoutRefundModal(true)}>
                                <b>Partial refund</b> <Badge bg="primary" pill>Offer</Badge>
                                </Button>
                            </> : <></>
                    }
                    {
                        ppHelper.getMakeOffer(disputeDetail?.allowed_response_options.make_offer?.offer_types).allowReplacementWithoutRefund ?
                            <>
                                <Button variant="outline-secondary" className="offer-button" onClick={() => setShowSendReplacementWithoutRefundModal(true)}>
                                    <b>Send a replacement</b> <Badge bg="primary" pill>Offer</Badge>
                                </Button>
                            </> : <></>
                    }
                    {
                        ppHelper.getMakeOffer(disputeDetail?.allowed_response_options.make_offer?.offer_types).allowRefundWithReplacement ?
                            <>
                                <Button variant="outline-secondary" className="offer-button" onClick={() => setshowSendReplacementRefundModal(true)}>
                                    <b>Send a replacement with refund</b> <Badge bg="primary" pill>Offer</Badge>
                                </Button>
                            </> : <></>
                    }

                    {
                        ppHelper.getMakeOffer(disputeDetail?.allowed_response_options.make_offer?.offer_types).allowRefundWithReturn ?
                            <>
                                <Button variant="outline-secondary" className="offer-button">
                                    <b>Refund with return item</b> <Badge bg="primary" pill>Offer</Badge>
                                </Button>
                            </> : <></>
                    }
                </Card.Body>
            </Card>
            <Accordion defaultActiveKey={["0", "1", "2", "3"]} alwaysOpen>
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
                                                <div dangerouslySetInnerHTML={{ __html: ppHelper.getShippingAddress(transactionDetail?.shipping_info.address, true) }} />
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
                {
                    disputeDetail?.evidences?.length > 0 ? (
                        <Accordion.Item eventKey="1">
                            <Accordion.Header><strong>Additional Info</strong></Accordion.Header>
                            <Accordion.Body>
                                {
                                    loading ? (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                                        <Spinner animation="border" />
                                    </div>) : (
                                        <Table>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '300px', fontWeight: 'bold', textAlign: 'right', verticalAlign: 'middle', padding: '8px', marginRight: '16px', borderRight: '8px solid transparent' }}>Note from {transactionDetail?.payer_info.payer_name.alternate_full_name}</td>
                                                    <td style={{ textAlign: 'left', verticalAlign: 'middle', padding: '8px', marginLeft: '16px' }}>{disputeDetail?.evidences[0].notes}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    )
                                }
                            </Accordion.Body>
                        </Accordion.Item>
                    ) : (<></>)
                }
                {
                    disputeDetail?.messages?.length > 0 ? (
                        <Accordion.Item eventKey="2">
                            <Accordion.Header><strong>Your conversation with {transactionDetail?.payer_info.payer_name.alternate_full_name}</strong></Accordion.Header>
                            <Accordion.Body>
                                {
                                    loading ? (<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                                        <Spinner animation="border" />
                                    </div>) : (
                                        <>
                                            {
                                                (Array.isArray(disputeDetail?.messages) && disputeDetail?.messages.length > 0) ? (
                                                    <>
                                                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                            {Array.isArray(disputeDetail?.messages) && disputeDetail.messages.map((t: any, idx: number) => (
                                                                <div key={idx}>
                                                                    <Conversation
                                                                        posted_by={t.posted_by}
                                                                        time_posted={t.time_posted}
                                                                        content={t.content}
                                                                        documents={t.documents} buyer_name={transactionDetail?.payer_info.payer_name.alternate_full_name}                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Row>
                                                            <Col>
                                                                <FloatingLabel
                                                                    controlId="floatingInput"
                                                                    label="Send a message to buyer"
                                                                    className="mb-3"
                                                                >
                                                                    <Form.Control
                                                                        as="textarea"
                                                                        placeholder="Send a message to buyer"
                                                                        style={{ height: "100px" }}
                                                                        className="mt-3"
                                                                        onChange={(e) => setMessage(e.target.value)}
                                                                        name="message"
                                                                    />
                                                                </FloatingLabel>
                                                            </Col>
                                                            <Col>
                                                                <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                                                                    <Button variant="dark" onClick={sendMessage} disabled={sending} className="mb-3">
                                                                        {sending ? (
                                                                            <>
                                                                                <Spinner
                                                                                    as="span"
                                                                                    animation="grow"
                                                                                    size="sm"
                                                                                    role="status"
                                                                                    aria-hidden="true"
                                                                                />
                                                                                <span>Sending...</span>
                                                                            </>
                                                                        ) : 'Send'}
                                                                    </Button>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </>
                                                ) : <></>}
                                        </>
                                    )
                                }
                            </Accordion.Body>
                        </Accordion.Item>
                    ) : (<></>)
                }
                <Accordion.Item eventKey="3">
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
            {
                showSendRefundModal ? <SendRefund dispute_id={disputeDetail?.dispute_id} show={showSendRefundModal} onHide={onHide} refundAmount={disputeDetail?.refund_details?.allowed_refund_amount.value}></SendRefund> : <></>
            }
            {
                showSendPartialRefundModal ? <SendPartialRefundModal dispute_id={disputeDetail?.dispute_id} show={showSendPartialRefundModal} onHide={onHide} onHideAndShowNotification={onHideAndShowModal} refundAmount={disputeDetail?.refund_details?.allowed_refund_amount.value}></SendPartialRefundModal> : <></>
            }
            {
                showNotificationModal ? <NotificationModal show={showNotificationModal} message={notificationMessage} onHide={onHide}></NotificationModal> : <></>
            }
            {
                showSendReplacementWithoutRefundModal ? <SendReplacementWithoutReturnModal dispute_id={disputeDetail?.dispute_id} show={showSendReplacementWithoutRefundModal} onHide={onHide} onHideAndShowNotification={onHideAndShowModal} address={ppHelper.getShippingAddress(transactionDetail?.shipping_info.address, false)}></SendReplacementWithoutReturnModal> : <></>
            }
            {
                showSendReplacementRefundModal ? <SendReplacementRefundModal dispute_id={disputeDetail?.dispute_id} show={showSendReplacementRefundModal} onHide={onHide} onHideAndShowNotification={onHideAndShowModal} address={ppHelper.getShippingAddress(transactionDetail?.shipping_info.address, false)} refundAmount={disputeDetail?.refund_details?.allowed_refund_amount.value}></SendReplacementRefundModal> : <></>
            }
        </Container >
    );
}

export default CaseDetails