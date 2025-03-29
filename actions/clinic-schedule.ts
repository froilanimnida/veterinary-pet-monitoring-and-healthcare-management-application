import { prisma } from "@/lib/prisma";
import { type ActionResponse } from "@/types/server-action-response";
import { type clinic_hours } from "@prisma/client";

const getClinicSchedule = async (clinic_id: string): Promise<ActionResponse<{ clinic_hours: clinic_hours[] }>> => {
    try {
        const clinicHours = await prisma.clinic_hours.findMany({
            where: {
                clinic_id: Number(clinic_id),
            },
        });
        if (clinicHours.length === 0) return { success: true, data: { clinic_hours: [] } };
        return { success: true, data: { clinic_hours: clinicHours } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
    }
};

export { getClinicSchedule };
