// nextauth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { role_type } from "@prisma/client";

interface IUser extends DefaultUser {
    /**
     * Role of user
     */
    role?: role_type;
    id: string;
}
declare module "next-auth" {
    interface User extends IUser {}
    interface Session {
        user?: User;
    }
}
declare module "next-auth/jwt" {
    interface JWT extends IUser {}
}
