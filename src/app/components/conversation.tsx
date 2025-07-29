import { Badge } from "react-bootstrap";
import ppHelper from "../lib/paypal/helper";

interface ConversationProps {
    posted_by: string,
    time_posted: string,
    content: string,
    documents: any,
    buyer_name: string
}
const Conversation = (props: ConversationProps) => {
    return (
        <div className="conversation">
            <Badge bg={props.posted_by == 'BUYER' ? "secondary" : "primary"} pill>{props.posted_by == 'BUYER' ? props.buyer_name : "SELLER"}</Badge><span className="time">({ppHelper.convertToVNTime(props.time_posted)})</span>
            <p className="chat">{props.content}</p>
        </div>
    )
}

export default Conversation;