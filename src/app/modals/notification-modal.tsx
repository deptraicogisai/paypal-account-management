import { Button, Modal, Image } from "react-bootstrap"

interface NotificationModalProps {
    show: boolean,
    message: string,
    onHide: () => void
}

const NotificationModal = (props: NotificationModalProps) => (
    <Modal show={props.show} onHide={props.onHide}>
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <Image src="/image/check.png" className="mb-3"></Image>
                <p style={{ fontSize: 20 }}><strong>{props.message}</strong></p>
                <p style={{ fontSize: 13, fontWeight: 500 }}>Allow some time for the buyer to response your offer</p>
            </div>
        </Modal.Body>
        <Modal.Footer style={{ display: "flex", justifyContent: "center" }}>
            <Button variant="dark" onClick={props.onHide} className="offer-button" style={{ width: 100 }}><b>Done</b></Button>
        </Modal.Footer>
    </Modal>
)

export default NotificationModal