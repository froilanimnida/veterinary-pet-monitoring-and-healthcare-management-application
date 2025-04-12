"use server";

import { messages } from "@prisma/client";
import { prisma } from "@/lib";
import { ActionResponse } from "@/types/server-action-response";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserId } from "./user";
import { getAppointmentId } from "./appointment";

const sendMessage = async (text: string, appointment_uuid: string): Promise<ActionResponse<{ data: object }>> => {
    try {
        const user = await auth();
        if (!user || !user.user?.email) redirect("/auth/login");
        const user_data = await getUserId(user.user.email);
        const appointment = await getAppointmentId(appointment_uuid);
        const appointment_id = appointment.success ? appointment.data.appointment_id : undefined;
        // TODO: We need to get the receiver id from the appointment
        if (!appointment_id) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        await prisma.messages.create({
            data: {
                appointment_id: appointment_id,
                content: text,
                sender_id: Number(user_data),
            },
        });

        return {
            success: true,
            data: { data: {} },
        };
    } catch (error) {
        return {
            success: false,
            error: error as string,
        };
    }
};

const getMessages = async (appointment_uuid: string): Promise<ActionResponse<messages[]>> => {
    try {
        const user = await auth();
        if (!user || !user.user?.email) redirect("/auth/login");
        const appointment = await getAppointmentId(appointment_uuid);
        const appointment_id = appointment.success ? appointment.data.appointment_id : undefined;
        if (appointment_id) {
            return {
                success: false,
                error: "Appointment not found",
            };
        }

        const messages_data = await prisma.messages.findMany({
            where: {
                appointment_id: appointment_id,
            },
            orderBy: {
                created_at: "asc",
            },
        });

        return {
            success: true,
            data: messages_data,
        };
    } catch (error) {
        return {
            success: false,
            error: error as string,
        };
    }
};

export { sendMessage, getMessages };
