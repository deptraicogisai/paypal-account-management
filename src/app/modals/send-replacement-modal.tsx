import { useState } from "react";
import { Button, FloatingLabel, Modal, Image, Form } from "react-bootstrap";
import { FieldErrors } from "../models/fieldError";
import dispute from "../lib/paypal/dispute";

interface SendReplacementProps {
    dispute_id: string,
    show: boolean,
    address: string,
    onHide: () => void,
    onHideAndShowNotification: (message: string) => void
}

const SendReplacementWithoutReturnModal = (props: SendReplacementProps) => {
    const [message, setMessage] = useState<string>("");
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const validateFields = () => {
        const errors: FieldErrors = {};
        if (!message) {
            errors.message = "You must add a message to continue.";
        }

        return errors;
    };

    const sendReplacment = async () => {
        try {
            var errors = validateFields();
            setFieldErrors(errors);
            if (Object.keys(errors).length === 0) {
                var result = await dispute.offerReplacementWithoutRefund(props.dispute_id, message);
                if (result.success) {
                    props.onHide();
                    props.onHideAndShowNotification("The replacement without a return offer has been sent");
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
        <Modal show={props.show} onHide={props.onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Send a replacement</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ fontSize: '14px' }}>
                <p>You're offering a replacement of the item without a return of the original item. If the buyer accepts your offer, you can initiate the replacement.
                </p>
                <p>
                    <b>Buyer's shipping address</b>
                </p>
                <p>
                    {props.address}
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
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" className="reponse-disute-button" onClick={sendReplacment}><b>Send Offer</b></Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SendReplacementWithoutReturnModal;