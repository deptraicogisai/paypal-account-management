'use client';
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Button, Image } from "react-bootstrap";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signIn("google")
        } catch (err: any) {
            debugger;
            setError("Google sign in failed.");
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: 300,
            margin: "60px auto",
            padding: 32,
            border: "1px solid #ddd",
            borderRadius: 8,
            background: "#fff"
        }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <Image src='/image/paypal.png' />
            </div>
            <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 4,
                    border: "1px solid #ccc",                    
                    background: "#fff",
                    color: "#333",
                    fontSize: "17px",
                    fontWeight: 'bold',
                    justifyContent: 'center',
                    cursor: "pointer"
                }}
            >
                <FcGoogle className="mx-2" /> Sign in with Google
            </Button>
        </div>
    );
}