import { useState } from "react";
import { Button, Col, Modal, Row, Spinner } from "react-bootstrap";
import payout from "../lib/paypal/payout";
import { Payout } from "../models/payout";
import ppHelper from "../lib/paypal/helper";

interface IProps {
    show: boolean
    onHide: () => void
}

interface FieldErrors {
    sendTo?: string;
    amount?: string;
    paymentType?: string;
    note?: string;
}

const SendPaymentModal = (props: IProps) => {
    const [formData, setFormData] = useState({
        sendTo: "",
        amount: "",
        paymentType: "",
        note: "",
        currency: ""
    });
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [validateMsg, setValidateMsg] = useState<string | null>(null);
    const [payoutBatchId, setPayoutBatchId] = useState<string>("");
    const [payoutBatchStatus, setPayoutBatchStatus] = useState<string>();
    const [checking, setChecking] = useState<boolean>(false);

    const validateFields = () => {
        const errors: FieldErrors = {};

        // Email validation
        if (!formData.sendTo) {
            errors.sendTo = "Recipient's email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.sendTo)) {
            errors.sendTo = "Please enter a valid email address.";
        }

        // Amount validation
        if (!formData.amount) {
            errors.amount = "Amount is required.";
        } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
            errors.amount = "Please enter a valid amount greater than 0.";
        }

        // Payment type validation
        if (!formData.paymentType) {
            errors.paymentType = "Please select a payment type.";
        }

        // Note validation (optional, but required in original)
        if (!formData.note) {
            errors.note = "Note is required.";
        }

        return errors;
    };

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

    const handleSend = async () => {
        const errors = validateFields();
        setFieldErrors(errors);

        if (Object.keys(errors).length === 0) {
            setValidateMsg(null);
            try {
                var result = await payout.sendPayment(formData);
                if (result.success) {
                    setPayoutBatchId(result.data.batch_header.payout_batch_id);
                    setPayoutBatchStatus(result.data?.batch_header.batch_status);
                } else {
                    alert(`${result.message}`);
                }
            } catch (error) {
                setValidateMsg("Failed to send payment. Please try again.");
            }
        } else {
            setValidateMsg("Please fix the errors below.");
        }
    };

    const checkPayoutStatus = async () => {
        setChecking(true);
        var result = await payout.checkPayoutBatchStatus(payoutBatchId);
        if (result.success) {
            setPayoutBatchStatus(result.data?.batch_header.batch_status);
        } else {
            alert(`${result.message}`);
        }
        setChecking(false);
    }

    return (
        <Modal show={props.show}>
            <Modal.Header closeButton onHide={props.onHide}>
                <Modal.Title>Send Payment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="mb-3">
                        <label htmlFor="sendTo" className="form-label">Send Payment To</label>
                        <input
                            type="email"
                            className={`form-control${fieldErrors.sendTo ? " is-invalid" : ""}`}
                            id="sendTo"
                            placeholder="Recipient's email"
                            name="sendTo"
                            value={formData.sendTo}
                            onChange={handleChange}
                            required
                        />
                        {fieldErrors.sendTo && (
                            <div className="invalid-feedback d-block">{fieldErrors.sendTo}</div>
                        )}
                    </div>
                    <div className="mb-3">
                        <Row>
                            <Col xs={8}>
                                <label htmlFor="amount" className="form-label">Amount</label>
                                <input
                                    type="number"
                                    className={`form-control${fieldErrors.amount ? " is-invalid" : ""}`}
                                    id="amount"
                                    placeholder="Enter amount"
                                    name="amount"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                />
                                {fieldErrors.amount && (
                                    <div className="invalid-feedback d-block">{fieldErrors.amount}</div>
                                )}
                            </Col>
                            <Col xs={4}>
                                <label htmlFor="currency" className="form-label">Currency</label>
                                <select 
                                    className="form-select"
                                    id="currency"
                                    name="currency"
                                    value={formData.currency || "USD"}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="USD">USD</option>
                                    <option value="HKD">HKD</option>
                                </select>
                            </Col>
                        </Row>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Payment Type</label>
                        <div>
                            <div className="form-check form-check-inline">
                                <input
                                    className={`form-check-input${fieldErrors.paymentType ? " is-invalid" : ""}`}
                                    type="radio"
                                    name="paymentType"
                                    id="payFriend"
                                    value="NON_GOODS_OR_SERVICES"
                                    checked={formData.paymentType === "NON_GOODS_OR_SERVICES"}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-check-label" htmlFor="payFriend">
                                    Pay a friend
                                </label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input
                                    className={`form-check-input${fieldErrors.paymentType ? " is-invalid" : ""}`}
                                    type="radio"
                                    name="paymentType"
                                    id="goods"
                                    value="GOODS"
                                    checked={formData.paymentType === "GOODS"}
                                    onChange={handleChange}
                                    required
                                />
                                <label className="form-check-label" htmlFor="goods">
                                    Goods or Services
                                </label>
                            </div>
                        </div>
                        {fieldErrors.paymentType && (
                            <div className="invalid-feedback d-block">{fieldErrors.paymentType}</div>
                        )}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="note" className="form-label">Add a Note</label>
                        <textarea
                            className={`form-control${fieldErrors.note ? " is-invalid" : ""}`}
                            id="note"
                            rows={2}
                            placeholder="Add a note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            required
                        ></textarea>
                        {fieldErrors.note && (
                            <div className="invalid-feedback d-block">{fieldErrors.note}</div>
                        )}
                    </div>
                    {
                        payoutBatchId && (
                            <div>
                                Status: <span className={`batch-status-${payoutBatchStatus?.toLowerCase()}`}>{payoutBatchStatus}</span>
                                <Button variant="outline-success" onClick={checkPayoutStatus} disabled={checking} className="mx-3">
                                    {checking ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="grow"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                            <span>Checking...</span>
                                        </>
                                    ) : 'Check'}
                                </Button>
                            </div>
                        )
                    }
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={props.onHide}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSend}
                >
                    Send
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SendPaymentModal;