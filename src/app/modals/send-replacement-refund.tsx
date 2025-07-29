import { useState } from "react";
import { Button, FloatingLabel, Modal, Image, Form } from "react-bootstrap";
import { FieldErrors } from "../models/fieldError";
import dispute from "../lib/paypal/dispute";

interface SendReplacementRefundProps {
    dispute_id: string,
    show: boolean,
    address: string,
    onHide: () => void,
    onHideAndShowNotification: (message: string) => void,
    refundAmount: number
}

const SendReplacementRefundModal = (props: SendReplacementRefundProps) => {
    const [formData, setFormData] = useState({
        amount: "",
        message: ""
    });

    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const validateFields = () => {
        const errors: FieldErrors = {};

        // Amount validation
        if (!formData.amount) {
            errors.amount = "You must enter a refund amount.";
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            errors.amount = "Please enter a valid amount greater than 0.";
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) > props.refundAmount) {
            errors.amount = "You must enter an amount less than the transaction amount.";
        }

        if (!formData.message) {
            errors.message = "You must add a message to continue.";
        }

        return errors;
    };

    const offerReplacmentRefund = async () => {
        try {
            var errors = validateFields();
            setFieldErrors(errors);
            if (Object.keys(errors).length === 0) {
                var result = await dispute.offerReplacementWithRefund(props.dispute_id, formData);
                if (result.success) {
                    props.onHide();
                    props.onHideAndShowNotification("The send a replacement with refund offer has been sent");
                } else {
                    alert(result.message);
                }
            }
        } catch (error) {
            alert(error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setFieldErrors(prev => ({
            ...prev,
            [name]: undefined,
        }));
    };

    return (
        <Modal show={props.show} centered onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Send a replacement with refund</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                You're offering a replacement item along with a refund. If the buyer accepts your offer, you can send the replacement item and the refund will be processed.
                <p className="my-3">Amount requested by the buyer:<b className="mx-3">${props.refundAmount} USD</b></p>
                <p>
                    <b>Buyer's shipping address</b>
                </p>
                <p>
                    {props.address}
                </p>
                <FloatingLabel
                    controlId="floatingInput"
                    label="Enter amount"
                    className="mb-3"
                >
                    <Form.Control
                        type="number"
                        inputMode="decimal"
                        placeholder="Enter amount"
                        className={`mt-3 form-control${fieldErrors.amount ? " is-invalid" : ""}`}
                        style={{ width: "200px" }}
                        onChange={handleChange}
                        name="amount"
                    />
                    {fieldErrors.amount && (
                        <div className="invalid-feedback d-block"><Image src="/image/warning.png" height={20} width={20}></Image>
                            <span className="mx-2">{fieldErrors.amount}</span>
                        </div>
                    )}
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
                    <Form.Control as="textarea" placeholder="Add a message" style={{ height: "100px" }}
                        className={`mt-3 form-control${fieldErrors.message ? " is-invalid" : ""}`} onChange={handleChange} name="message" />
                    {fieldErrors.message && (
                        <div className="invalid-feedback d-block"><Image src="/image/warning.png" height={20} width={20}></Image>
                            <span className="mx-2">{fieldErrors.message}</span>
                        </div>
                    )}
                </FloatingLabel>
                <Button className="reponse-disute-button" variant="dark" onClick={offerReplacmentRefund}>Send Offer</Button>
            </Modal.Body>
        </Modal>
    )
}

export default SendReplacementRefundModal;