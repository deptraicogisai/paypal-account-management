'use client'
import { auth } from "@/auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Navbar, Container, Nav, Image } from "react-bootstrap";

const Header = () => {
    return (
        <Navbar bg="dark" data-bs-theme="dark">
            <Container>
                <Navbar.Brand>Paypal Support</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Nav className="me-3">
                    <Link href="/account" className="nav-link">Accounts</Link>
                    {/* <Link href="/transaction" className="nav-link">Transactions</Link> */}
                </Nav>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        Hello
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
