"use client";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
function LogoutButton() {
    return (
        <Button onClick={() => signOut({ callbackUrl: "/signin" })} variant={"ghost"} size={"sm"}>
            <LogOut />
            Log out
        </Button>
    );
}

export default LogoutButton;
