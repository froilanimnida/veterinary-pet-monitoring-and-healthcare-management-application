import { prescriptions, vaccinations } from "@prisma/client";

/**
 * Type definition for upcoming vaccinations with pet details
 */
export type UpcomingVaccination = vaccinations & {
    pets: {
        name: string;
        species: string;
    } | null;
};

/**
 * Type definition for upcoming prescriptions with pet and medication details
 */
export type UpcomingPrescription = prescriptions & {
    pets: {
        name: string;
        species: string;
        profile_picture_url: string | null;
    } | null;
    medications: {
        name: string;
        description: string;
    } | null;
};

/**
 * Type for response from getUpcomingVaccinations
 */
export type UpcomingVaccinationsResponse = {
    vaccinations: UpcomingVaccination[] | [];
};

/**
 * Type for response from getUpcomingPrescriptions
 */
export type UpcomingPrescriptionsResponse = {
    prescriptions: UpcomingPrescription[] | [];
};

/**
 * Type for response from getDashboardHealthcare
 */
export type DashboardHealthcareResponse = {
    vaccinations: UpcomingVaccination[];
    prescriptions: UpcomingPrescription[];
};
