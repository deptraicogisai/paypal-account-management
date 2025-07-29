import { Button, FloatingLabel, Form, Modal, Image, Badge } from "react-bootstrap"
import dispute from "../lib/paypal/dispute";
import { useState } from "react";
import { FieldErrors } from "../models/fieldError";

interface SendRefundProps {
    dispute_id: string,
    show: boolean,
    onHide: () => void,
    refundAmount: number
}

const SendRefund = (props: SendRefundProps) => {

    const [message, setMessage] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const validateFields = () => {
        const errors: FieldErrors = {};
        if (!message) {
            errors.message = "You must add a message to continue.";
        }

        return errors;
    };

    const acceptClaim = async () => {
        try {
            var errors = validateFields();
            setFieldErrors(errors);
            if (Object.keys(errors).length === 0) {
                var result = await dispute.acceptClaim(props.dispute_id, message);
                if (result.success) {
                    alert("Send refund completed!");
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
        setMessage(value);
        setFieldErrors(prev => ({
            ...prev,
            [name]: undefined,
        }));
    };

    return (
        <Modal show={props.show} centered>
            <Modal.Header closeButton onHide={props.onHide}>
                <Modal.Title>Send a refund</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p style={{ fontSize: '14px' }}>
                    <p>This amount will be refunded to buyer and the case will be closed. The item will be retained by the buyer.</p>
                    <p>Total refund : <strong>${props.refundAmount} USD</strong></p>
                    <p>This is the amount that will be deducted from your PayPal account.</p>
                </p>
                <FloatingLabel
                    controlId="floatingInput"
                    label="Add a message"
                    className="mb-3"
                >
                    <Form.Control as="textarea" placeholder="Add a message" style={{ height: "100px" }} className={`mt-3 form-control${fieldErrors.message ? " is-invalid" : ""}`} onChange={handleChange} name="message" />
                    {fieldErrors.message && (
                        <div className="invalid-feedback d-block"><Image src="/image/warning.png" height={20} width={20}></Image>
                            <span className="mx-2">{fieldErrors.message}</span>
                        </div>
                    )}
                </FloatingLabel>
                <Button className="reponse-disute-button" variant="dark" onClick={acceptClaim}>Send Refund</Button>
            </Modal.Body>
        </Modal>
    )
}

export default SendRefund;