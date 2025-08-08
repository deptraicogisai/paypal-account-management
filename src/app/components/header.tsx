'use client'
import { auth } from "@/auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { Navbar, Container, Nav, Image, Dropdown, NavDropdown } from "react-bootstrap";
import SendPaymentModal from "../modals/send-payment-modal";

const Header = () => {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";
    return (
        <>
            <Navbar bg="dark" data-bs-theme="dark">
                <Container>
                    <Navbar.Brand>Paypal Support</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Nav className="me-auto">
                        <Nav.Link as={Link} href="/account">
                            Account
                        </Nav.Link>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <Nav>
                            <NavDropdown
                                id="nav-dropdown-dark-example"
                                title={session?.user?.name}
                                menuVariant="dark"
                                drop="down-centered"
                            >
                                <NavDropdown.Item onClick={() => signOut()}>Sign Out</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
};

export default Header;
