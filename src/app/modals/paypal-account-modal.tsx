"use client";
import React, { useEffect, useState } from "react";
import { Modal, Form, InputGroup, Row, Col } from "react-bootstrap";
import { PaypalAccount } from "../models/account";
import { MdOutlineEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { CiPhone } from "react-icons/ci";
import { AiOutlineGlobal } from "react-icons/ai";
import { HiMiniComputerDesktop } from "react-icons/hi2";
import { FaEye, FaEyeSlash, FaUser } from "react-icons/fa";
import { TbLockPassword } from "react-icons/tb";
import spHelper from "../lib/supabase/supabaseHelper";
import { Button } from 'antd';

interface IProps {
    account?: PaypalAccount
    show: boolean;
    onHide: () => void;
    onSuccess: (account: PaypalAccount, isEdit: boolean) => void;
}


const PaypalAccountModal = (props: IProps) => {
    const [formData, setFormData] = useState<PaypalAccount>({
        id: props.account?.id || 0,
        email: props.account?.email || "",
        password: props.account?.password || "",
        phone: props.account?.phone || "",
        domain: props.account?.domain || "",
        note: props.account?.note || "",
        question: props.account?.question || "",
        vps: props.account?.vps || "",
        vps_user: props.account?.vps_user || "",
        vps_password: props.account?.vps_password || "",
        country: props.account?.country || "",
        bank: props.account?.bank || "",
        client_id: props.account?.client_id || "",
        client_secret: props.account?.client_secret || "",
        sandbox_client_id: props.account?.sandbox_client_id || "",
        sandbox_client_secret: props.account?.sandbox_client_secret || ""
    });

    useEffect(() => {
        if (props.account) setFormData(props.account);
        else setFormData({
            id: 0,
            email: "",
            password: "",
            phone: "",
            domain: "",
            note: "",
            question: "",
            vps: "",
            vps_user: "",
            vps_password: "",
            country: "",
            bank: "",
            client_id: "",
            client_secret: "",
            sandbox_client_id: "",
            sandbox_client_secret: ""
        });
    }, [props.account]);

    // Separate handler for select element
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        // You can replace this with your actual API call
        // For now, just log the formData
        console.log("Saving account:", formData);
        var result = await spHelper.upsertAccount(formData as PaypalAccount);
        debugger;
        if (result.success) {
            props.onHide();
            props.onSuccess(result.data, formData.id != 0);
        }
    };
    return (
        <Modal show={props.show} variant='primary' onHide={props.onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add/Edit Account</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <MdOutlineEmail />
                            </InputGroup.Text>
                            <Form.Control
                                type="email"
                                name="email"
                                placeholder="Enter email"
                                onChange={handleChange}
                                value={formData.email}
                            />
                        </InputGroup>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <RiLockPasswordFill />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="password"
                                placeholder="Enter password"
                                onChange={handleChange}
                                value={formData.password}
                            />
                        </InputGroup>
                    </Row>
                    <Form.Group className="mb-3" controlId="formQuestion">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            type="text"
                            name="question"
                            placeholder="Enter security question"
                            onChange={handleChange}
                            value={formData.question}
                        />
                    </Form.Group>
                    <Row>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <CiPhone />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="phone"
                                placeholder="Enter phone"
                                onChange={handleChange}
                                value={formData.phone}
                            />
                        </InputGroup>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <AiOutlineGlobal />
                            </InputGroup.Text>
                            <Form.Select
                                aria-label="Default select example"
                                value={formData.country}
                                name="country"
                                onChange={handleSelectChange}
                            >
                                <option value="">Select Country</option>
                                <option value="US">US</option>
                                <option value="HK">HK</option>
                                <option value="VN">VN</option>
                            </Form.Select>
                        </InputGroup>
                    </Row>
                    <Row>
                        <Form.Group className="mb-3" controlId="formDomain" as={Col}>
                            <Form.Label>Domain</Form.Label>
                            <Form.Control
                                type="text"
                                name="domain"
                                placeholder="Enter domain"
                                onChange={handleChange}
                                value={formData.domain}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBank" as={Col}>
                            <Form.Label>Bank</Form.Label>
                            <Form.Control
                                type="text"
                                name="bank"
                                placeholder="Enter bank"
                                onChange={handleChange}
                                value={formData.bank}
                            />
                        </Form.Group>
                    </Row>
                    <Form.Group className="mb-3" controlId="formNote">
                        <Form.Label>Note</Form.Label>
                        <Form.Control
                            type="text"
                            name="note"
                            placeholder="Enter note"
                            onChange={handleChange}
                            value={formData.note}
                        />
                    </Form.Group>
                    <Row>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <HiMiniComputerDesktop />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="vps"
                                placeholder="Enter VPS"
                                onChange={handleChange}
                                value={formData.vps}
                            />
                        </InputGroup>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <FaUser />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="vps_user"
                                placeholder="Enter VPS user"
                                onChange={handleChange}
                                value={formData.vps_user}
                            />
                        </InputGroup>
                        <InputGroup className="mb-3" as={Col}>
                            <InputGroup.Text>
                                <TbLockPassword />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                name="vps_password"
                                placeholder="Enter VPS password"
                                onChange={handleChange}
                                value={formData.vps_password}
                            />
                        </InputGroup>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Client Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="client_id"
                                    placeholder="Enter Client Id"
                                    onChange={handleChange}
                                    value={formData.client_id}
                                />
                            </Form.Group></Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Client Secret</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="client_secret"
                                    placeholder="Enter Client Secret"
                                    onChange={handleChange}
                                    value={formData.client_secret}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Sandbox Client Id</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sandbox_client_id"
                                    placeholder="Enter Sandbox Client Id"
                                    onChange={handleChange}
                                    value={formData.sandbox_client_id}
                                />
                            </Form.Group></Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Sandbox Client Secret</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sandbox_client_secret"
                                    placeholder="Enter Sandbox Client Secret"
                                    onChange={handleChange}
                                    value={formData.sandbox_client_secret}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end">
                        <Button color="default" variant="outlined" type="primary" onClick={props.onHide}>
                            Close
                        </Button>
                        <Button type="primary" className="mx-2" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default PaypalAccountModal;