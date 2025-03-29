"use server";
import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/schemas/auth-definitions";
import type { z } from "zod";
import { role_type } from "@prisma/client";
import { signOut } from "next-auth/react";
import { NewClinicAccountSchema } from "@/schemas/clinic-signup-definition";
import { hashPassword, verifyPassword } from "@/lib/functions/security/password-check";
import type { ActionResponse } from "@/types/server-action-response";

const createAccount = async (values: z.infer<typeof SignUpSchema>): Promise<ActionResponse<{ user_uuid: string }>> => {
    try {
        const formData = SignUpSchema.safeParse(values);
        if (!formData.success) {
            return { success: false, error: "Invalid input" };
        }
        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: values.email }, { phone_number: values.phone_number }],
            },
        });
        if (user !== null) return { success: false, error: "email_or_phone_number_already_exists" };
        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(formData.data.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.user,
            },
        });
        if (result.user_id === null) return { success: false, error: "Failed to create account" };
        return { success: true, data: { user_uuid: result.user_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const logout = async () => await signOut({ callbackUrl: "/auth/login" });

const createClinicAccount = async (
    values: z.infer<typeof NewClinicAccountSchema>,
): Promise<ActionResponse<{ user_uuid: string }>> => {
    try {
        const formData = NewClinicAccountSchema.safeParse(values);
        if (!formData.success) return { success: false, error: "Invalid input" };
        const user = await prisma.users.findFirst({
            where: {
                OR: [{ email: values.email }, { phone_number: values.phone_number }],
            },
        });
        if (user !== null) return { success: false, error: "email_or_phone_number_already_exists" };
        const result = await prisma.users.create({
            data: {
                email: formData.data.email,
                password_hash: await hashPassword(values.password),
                first_name: formData.data.first_name,
                last_name: formData.data.last_name,
                phone_number: formData.data.phone_number,
                role: role_type.client,
            },
        });
        if (result.user_id === null) return { success: false, error: "Failed to create account" };

        const clinicResult = await prisma.clinics.create({
            data: {
                name: formData.data.name,
                address: formData.data.address,
                city: formData.data.city,
                state: formData.data.state,
                postal_code: formData.data.postal_code,
                phone_number: formData.data.phone_number,
                emergency_services: formData.data.emergency_services,
                user_id: result.user_id,
            },
        });
        if (clinicResult.clinic_id === null) {
            return { success: false, error: "Failed to create clinic account" };
        }
        return { success: true, data: { user_uuid: result.user_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

const loginAccount = async (email: string, password: string): Promise<ActionResponse<{ user_uuid: string }>> => {
    try {
        const user = await prisma.users.findFirst({
            where: {
                email: email,
            },
        });
        if (user === null) return { success: false, error: "User not found" };
        if (!(await verifyPassword(password, user.password_hash))) return { success: false, error: "Invalid password" };
        return { success: true, data: { user_uuid: user.user_uuid } };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "An unexpected error occurred",
        };
    }
};

// export const createVeterinarianAccount
// export const verifyEmail

export { loginAccount, createAccount, createClinicAccount, logout };
