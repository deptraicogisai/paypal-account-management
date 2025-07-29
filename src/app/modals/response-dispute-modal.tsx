import { Accordion, Badge, Button, FloatingLabel, Form, Modal } from "react-bootstrap"
import dispute from "../lib/paypal/dispute";
import { useState } from "react";

interface ResponseDisputeModalProps {
    dispute_id: string;
    show: boolean,
    onHide: () => void
}

const responseDispute = {
    message: "",
    partialReundAmount: 0,
    invoceNumber: "",
    returnShippingAddress: "",
}


const ResponseDisputeModal = (props: ResponseDisputeModalProps) => {
    const [responseDispute, setReponseDispute] = useState<any>(
        {
            message: "",
            amount: 0,
            invoice_number: "",
            returnShippingAddress: "",
        }
    );

    const acceptClaim = async () => {
        try {
            console.log(responseDispute);
            var result = await dispute.acceptClaim(props.dispute_id, responseDispute.message);
            debugger;
        } catch (error) {

        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setReponseDispute(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Modal show={props.show} size="lg">
            <Modal.Header closeButton onHide={props.onHide}>
            </Modal.Header>
            <Modal.Body>
                <Badge bg="dark" className="mb-3">CLOSE THE CASE</Badge>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Full Refund</Accordion.Header>
                        <Accordion.Body>
                            This amount will be refunded to buyer and the case will be closed. The item will be retained by the buyer.
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Add a message"
                                className="mb-3"
                            >
                                <Form.Control as="textarea" placeholder="Add a message" style={{ height: "100px" }} className="mt-3" onChange={handleChange} name="message" />
                            </FloatingLabel>
                            <Button className="reponse-disute-button" variant="dark" onClick={acceptClaim}>Send Refund</Button>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <Badge bg="dark" className="my-3">SEND AN OFFER</Badge>
                <Accordion>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Partial refund</Accordion.Header>
                        <Accordion.Body>
                            If the buyer accepts your offer, the refund will be processed and this case will be closed. The item will be retained by the buyer.
                            <p className="my-3">Amount requested by the buyer:<b className="mx-3">$345.00 USD</b></p>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Enter amount"
                                className="mb-3"
                            >
                                <Form.Control
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="Enter amount"
                                    className="mt-3"
                                    style={{ width: "200px" }}
                                    onChange={handleChange}
                                    name="amount"
                                />
                            </FloatingLabel>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Enter invoice number (optional)"
                                className="mb-3"
                            >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter invoice number (optional)"
                                    className="mt-3"
                                    onChange={handleChange}
                                    name="invoice_number"
                                />
                            </FloatingLabel>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Add a message"
                                className="mb-3"
                            >
                                <Form.Control as="textarea" placeholder="Add a message" style={{ height: "100px" }} className="mt-3" onChange={handleChange} name="message" />
                            </FloatingLabel>
                            <Button className="reponse-disute-button" variant="dark">Send Offer</Button>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Full refund with return of item</Accordion.Header>
                        <Accordion.Body>
                            You’ll receive the tracking info from your buyer for the item that is being returned. The refund will be processed after you confirm delivery of the item.
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Return shipping address"
                                className="mb-3"
                            >
                                <Form.Control type="text" placeholder="Return shipping address" className="mt-3" name="returnShippingAddress" />
                            </FloatingLabel>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Enter invoice number (optional)"
                                className="mb-3"
                            >
                                <Form.Control
                                    type="text"
                                    placeholder="Enter invoice number (optional)"
                                    className="mt-3"
                                    onChange={handleChange}
                                    name="invoice_number"
                                />
                            </FloatingLabel>
                            <FloatingLabel
                                controlId="floatingInput"
                                label="Add a message"
                                className="mb-3"
                            >
                                <Form.Control as="textarea" placeholder="Add a message" style={{ height: "100px" }} className="mt-3" onChange={handleChange} name="message" />
                            </FloatingLabel>
                            <Button className="reponse-disute-button" variant="dark">Send Offer</Button>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <Badge bg="dark" className="my-3">SUBMIT AN ENVIDENCE</Badge>
            </Modal.Body>
        </Modal>
    )
}

export default ResponseDisputeModal;