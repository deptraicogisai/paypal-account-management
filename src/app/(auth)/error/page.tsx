'use client'
import { useSearchParams } from "next/navigation";
import { Button } from "react-bootstrap";

const AuthErrorPage = ({ searchParams }: { searchParams: { [key: string]: string } }) => {
    //const searchParams = useSearchParams();
    const error = searchParams.error;
    console.log(searchParams);

    let message = "An unknown error occurred.";
    if (error === "AccessDenied") {
        message = "You do not have permission to sign in.";
    } else if (error === "OAuthAccountNotLinked") {
        message = "This account is already linked to a different sign-in method.";
    } else if (error === "NoPermission") {
        message = "Your account is not approved to access this system.";
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f8f9fa" }}>
            <div style={{ background: "#fff", padding: "2rem 3rem", borderRadius: "12px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", textAlign: "center" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#dc3545" }}>Authentication Error</h1>
                <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>{message}</p>
                <Button variant="primary" href="/login">
                    Back to Login
                </Button>
            </div>
        </div>
    );
}

export default AuthErrorPage;