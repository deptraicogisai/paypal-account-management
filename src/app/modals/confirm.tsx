import { useState } from "react";
import { Button, Modal } from "react-bootstrap"
import { PaypalAccount } from "../models/account";

interface ConfirmProps {
    show: boolean,
    onHide: () => void,
    onRemove: () => void
}

const ComfirmModal = (props: ConfirmProps) => {
    return (
        <Modal className="theme-dark" show={props.show} centered>
            <Modal.Header closeButton onHide={props.onHide}>
                <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Do you want to remove this account ?
            </Modal.Body>

            <Modal.Footer>
                <Button variant="dark" onClick={props.onHide}>Close</Button>
                <Button variant="success" onClick={props.onRemove}>OK</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ComfirmModal;