import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import ResponsiveContainer from "@/components/shared/layout/responsive-container";
import UserLoginForm from "@/components/form/user-login-form";

const LoginPage = () => {
  return (
    <ResponsiveContainer className="flex justify-center items-center">
      <>
        <section className="flex justify-center items-center max-w-1/2 mx-auto"></section>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Login to continue</CardDescription>
          </CardHeader>
          <UserLoginForm />
          <CardFooter className="flex flex-col gap-4">
            <Link href={"/auth/sign-up"}>Sign up instead</Link>
          </CardFooter>
        </Card>
      </>
    </ResponsiveContainer>
  );
};

export default LoginPage;
