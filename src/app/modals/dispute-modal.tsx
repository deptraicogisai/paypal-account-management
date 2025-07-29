import { debug } from "console";
import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Chart from "react-google-charts";

interface DisputeProps {
    show: boolean,
    disputes: [],
    onHide: () => void
}

const DisputeModal = (props: DisputeProps) => {
    const [show3D, setShow3D] = useState(false);
    const [checked, setChecked] = useState(false);
    // Create a dictionary (object) that counts the number of disputes by status
    const statusMap = props.disputes?.reduce((acc, dispute) => {
        const status = dispute.dispute_state == "RESOLVED" ? dispute.outcome : "Other";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    debugger;
    // Convert statusMap to an array of arrays suitable for Google Charts
    // Order the statuses as "WON", "LOST", then "Other" (any other status)
    const order = ["WON", "LOST", "Other"];
    const orderedEntries = statusMap
        ? order
            .map(key => [key, statusMap[key]])
            .filter(([, count]) => count !== undefined)
            .concat(
                Object.entries(statusMap)
                    .filter(([key]) => !order.includes(key))
            )
        : [];

    // Create a new list with [key = key (value), value]
    const displayList = orderedEntries.map(([key, value]) => [`${key} (${value})`, value]);

    const data = [
        ["Status", "Count"],
        ...displayList
    ];
    debugger;
    const options = {
        is3D: checked,
        pieStartAngle: -50,
        sliceVisibilityThreshold: 0.02, // Hides slices smaller than 2%
        legend: {
            position: "top",
            alignment: "center",
            textStyle: {
                color: "#233238",
                fontSize: 15,
            },
        },
        colors: ["#3366CC", "#DC3912", "#109618"],
    };

    return (
        <div>
            <Modal show={props.show} centered size="lg">
                <Modal.Header closeButton onHide={props.onHide}>
                    <Modal.Title>Dispute Overview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Form>
                            <Form.Check // prettier-ignore
                                type="switch"
                                id="custom-switch"
                                label="View 3D"
                                onChange={(e) => setChecked(e.currentTarget.checked)}
                            />
                        </Form>
                    </div>
                    <Chart
                        chartType="PieChart"
                        width="100%"
                        height="500px"
                        data={data}
                        options={options}
                    />
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default DisputeModal