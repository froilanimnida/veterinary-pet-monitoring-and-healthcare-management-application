import type { medications, prescriptions } from "@prisma/client";

interface PrescriptionWithMedication extends prescriptions {
    medications: medications | null;
}

export { type PrescriptionWithMedication };
