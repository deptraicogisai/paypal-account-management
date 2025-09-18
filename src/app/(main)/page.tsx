import Image from "next/image";
import styles from "./page.module.css";
import { Button, Container, Table } from "react-bootstrap";
import PaypalAccountModal from "../modals/paypal-account-modal";

import { use, useEffect, useState } from "react";
import Chart from "react-google-charts";
import { auth, signIn } from "@/auth";
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth(); // useServerSession also works
  console.log(session);
  // if (!session) {
  //   redirect("/login");
  // }else{
  //   redirect("/account");
  // }

  return (
    <Container className="mt-5">
      <form
        action={async () => {
          "use server"
          await signIn("google", { redirectTo: "/account" })
        }}
      >
        <button type="submit">Sign in</button>
      </form> 
    </Container>
  );
}

