import {
    getUserAppointments,
    createUserAppointment,
    getClinicAppointments,
    getVeterinarianAppointments,
    cancelAppointment,
    confirmAppointment,
    rescheduleAppointment,
    getExistingAppointments,
} from "@/actions/appointment"; // Use alias
import { prismaMock, mockSession, mockVetSession } from "../utils/mocks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    appointment_status,
    appointment_type,
    veterinary_specialization,
    Prisma,
    role_type,
    pet_sex_type,
    species_type,
    breed_type,
} from "@prisma/client"; // Import Prisma namespace and enums

// Define types for mocks based on Prisma generated types
type MockAppointmentPayload = Prisma.appointmentsGetPayload<{
    include: { pets: { include: { users: true } }; veterinarians: { include: { users: true } }; clinics: true };
}>;
type MockPetPayload = Prisma.petsGetPayload<{ include: { users: true } }>;
type MockVetPayload = Prisma.veterinariansGetPayload<{ include: { users: true } }>;
type MockClinicPayload = Prisma.clinicsGetPayload<undefined>; // Adjust include as needed
type MockUserPayload = Prisma.usersGetPayload<undefined>; // Adjust include as needed

// Mock dependencies
jest.mock("next-auth");
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));
jest.mock("../../actions/calendar-sync", () => ({
    addToGoogleCalendar: jest.fn(),
    updateGoogleCalendarEvent: jest.fn(),
    deleteGoogleCalendarEvent: jest.fn(),
}));
jest.mock("../../actions/notification", () => ({
    createNotification: jest.fn(),
}));

// Base mock user
const baseMockUser: MockUserPayload = {
    email_verified: false,
    otp_expires_at: null,
    otp_token: null,
    user_id: Number(mockSession.user.id),
    user_uuid: "test-user-uuid",
    first_name: "John",
    last_name: "Doe",
    email: "user@example.com",
    password_hash: "hashed_password",
    role: role_type.user,
    phone_number: "1234567890",
    created_at: new Date(),
    updated_at: new Date(),
    last_login: null,
    deleted_at: null,
    disabled: false,
    email_verification_token: null,
    email_verification_expires_at: null,
    password_reset_token: null,
    password_reset_expires_at: null,
};

// Base mock pet
const baseMockPet: MockPetPayload = {
    deleted_at: null,
    private: false,
    profile_picture_url: null,
    pet_id: 1,
    pet_uuid: "test-pet-uuid",
    name: "Fluffy",
    user_id: Number(mockSession.user.id),
    species: species_type.dog, // Use enum
    breed: breed_type.labrador_retriever,
    date_of_birth: new Date("2020-01-01"),
    sex: pet_sex_type.male, // Use enum
    weight_kg: new Prisma.Decimal("25.50"), // Use Prisma.Decimal
    created_at: new Date(),
    updated_at: new Date(),
    deleted: false,
    users: baseMockUser,
};

// Base mock vet user
const baseMockVetUser: MockUserPayload = {
    ...baseMockUser,
    user_id: 3,
    user_uuid: "test-vet-user-uuid",
    first_name: "Dr",
    last_name: "Smith",
    email: "dr.smith@example.com",
    role: role_type.veterinarian,
};

// Base mock vet
const baseMockVet: MockVetPayload = {
    vet_id: 1,
    vet_uuid: "test-vet-uuid",
    user_id: 3,
    license_number: "VET123",
    specialization: veterinary_specialization.general_practitioner, // Correct enum
    created_at: new Date(),
    users: baseMockVetUser,
};

// Base mock clinic
const baseMockClinic: MockClinicPayload = {
    clinic_id: 1,
    clinic_uuid: "test-clinic-uuid",
    name: "Test Clinic",
    address: "123 Main St",
    city: "Test City",
    state: "TS",
    postal_code: "12345",
    phone_number: "123-456-7890",
    emergency_services: false,
    user_id: 4, // Clinic owner/admin user ID
    created_at: new Date(),
    latitude: 12.345,
    longitude: 12.345,
    google_maps_url: null,
    website: null,
};

// Mock actions AFTER base mocks are defined
jest.mock("@/actions", () => ({
    // Use alias
    getPet: jest.fn().mockResolvedValue({
        success: true,
        data: {
            pet: {
                // Return a structure matching getPet's expected output
                ...baseMockPet,
                weight_kg: baseMockPet.weight_kg.toString(), // Convert Decimal back to string if needed by the action
                users: undefined, // Exclude nested user if getPet doesn't return it
            },
        },
    }),
    getClinic: jest.fn().mockResolvedValue({
        success: true,
        data: {
            clinic: baseMockClinic, // Return a structure matching getClinic's expected output
        },
    }),
    sendEmail: jest.fn().mockResolvedValue(true),
}));

// Helper function to create a valid mock appointment structure
const createMockAppointment = (overrides: Partial<MockAppointmentPayload> = {}): MockAppointmentPayload => ({
    appointment_id: 1,
    appointment_uuid: "test-uuid-1",
    pet_id: 1,
    vet_id: 1,
    clinic_id: 1,
    appointment_date: new Date("2025-05-01T10:00:00"),
    notes: "Regular checkup",
    created_at: new Date(),
    appointment_type: appointment_type.wellness_exam, // Correct enum
    duration_minutes: 30,
    status: appointment_status.confirmed, // Use enum
    metadata: {}, // Add metadata field
    pets: baseMockPet,
    veterinarians: baseMockVet,
    clinics: baseMockClinic,
    ...overrides,
});

describe("Appointment Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
        // Reset mocks for actions that might change between tests
        jest.requireMock("@/actions").getPet.mockResolvedValue({
            success: true,
            data: {
                pet: { ...baseMockPet, weight_kg: baseMockPet.weight_kg.toString(), users: undefined },
            },
        });
        prismaMock.veterinarians.findUnique.mockResolvedValue(baseMockVet);
        prismaMock.clinics.findUnique.mockResolvedValue(baseMockClinic);
    });

    describe("getUserAppointments", () => {
        it("should get all appointments for the current user", async () => {
            // Define the expected structure based on the actual `select` in getUserAppointments
            type SelectedAppointment = {
                appointment_id: number;
                appointment_uuid: string;
                appointment_date: Date;
                appointment_type: appointment_type;
                notes: string | null;
                status: appointment_status;
                pets: { name: string } | null;
                veterinarians: { users: { first_name: string; last_name: string } | null } | null;
                clinics: { name: string } | null;
            };

            const mockAppointmentsData: SelectedAppointment[] = [
                {
                    appointment_id: 1,
                    appointment_uuid: "test-uuid-1",
                    appointment_date: new Date("2025-05-01T10:00:00"),
                    appointment_type: appointment_type.wellness_exam,
                    notes: "Regular checkup",
                    status: appointment_status.confirmed,
                    pets: { name: "Fluffy" },
                    veterinarians: { users: { first_name: "Dr", last_name: "Smith" } },
                    clinics: { name: "Test Clinic" },
                },
                {
                    appointment_id: 2,
                    appointment_uuid: "test-uuid-2",
                    appointment_date: new Date("2025-05-15T14:30:00"),
                    appointment_type: appointment_type.vaccination,
                    notes: "Annual vaccines",
                    status: appointment_status.requested,
                    pets: { name: "Max" },
                    veterinarians: { users: { first_name: "Dr", last_name: "Johnson" } },
                    clinics: { name: "Pet Care Clinic" },
                },
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointmentsData);

            const result = await getUserAppointments();

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointmentsData },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: {
                    pets: {
                        user_id: Number(mockSession.user.id),
                        deleted: false,
                    },
                },
                select: {
                    appointment_id: true,
                    appointment_uuid: true,
                    appointment_date: true,
                    appointment_type: true,
                    notes: true,
                    status: true,
                    pets: { select: { name: true } },
                    veterinarians: { select: { users: { select: { first_name: true, last_name: true } } } },
                    clinics: { select: { name: true } },
                },
            });
        });

        // ... existing tests for redirect and database error ...
        it("should redirect when user is not authenticated", async () => {
            (getServerSession as jest.Mock).mockResolvedValueOnce(null);

            await getUserAppointments();

            expect(redirect).toHaveBeenCalledWith("/signin");
            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            prismaMock.appointments.findMany.mockRejectedValueOnce(new Error("Database error"));

            const result = await getUserAppointments();

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("createUserAppointment", () => {
        const mockAppointmentData = {
            pet_uuid: "test-pet-uuid",
            vet_id: "test-vet-uuid", // Function expects UUID string
            clinic_id: "test-clinic-uuid", // Function expects UUID string
            appointment_date: new Date("2025-05-01T10:00:00"),
            appointment_time: "10:00", // Ensure format matches function expectation
            appointment_type: appointment_type.wellness_exam, // Correct enum
            notes: "Regular checkup",
            duration_minutes: 30,
        };

        it("should create a new appointment successfully", async () => {
            prismaMock.appointments.findMany.mockResolvedValue([]); // Both vet and user checks

            const createdAppointment = createMockAppointment({
                appointment_uuid: "new-appointment-uuid",
                pet_id: baseMockPet.pet_id,
                vet_id: baseMockVet.vet_id,
                clinic_id: baseMockClinic.clinic_id,
                appointment_date: mockAppointmentData.appointment_date,
                appointment_type: mockAppointmentData.appointment_type,
                notes: mockAppointmentData.notes,
                status: appointment_status.requested,
                duration_minutes: mockAppointmentData.duration_minutes,
            });
            prismaMock.appointments.create.mockResolvedValueOnce(createdAppointment);

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: true,
                data: { appointment_uuid: "new-appointment-uuid" },
            });

            expect(prismaMock.appointments.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    pet_id: baseMockPet.pet_id,
                    vet_id: baseMockVet.vet_id,
                    clinic_id: baseMockClinic.clinic_id,
                    appointment_date: expect.any(Date),
                    appointment_type: mockAppointmentData.appointment_type,
                    notes: mockAppointmentData.notes,
                    status: appointment_status.requested,
                    duration_minutes: mockAppointmentData.duration_minutes,
                    metadata: expect.any(Object),
                }),
            });

            expect(jest.requireMock("@/actions").sendEmail).toHaveBeenCalled();
            expect(jest.requireMock("../../actions/notification").createNotification).toHaveBeenCalled();
        });

        it("should detect veterinarian scheduling conflicts", async () => {
            const conflictingAppointment = createMockAppointment({
                appointment_id: 3,
                appointment_uuid: "existing-vet-appointment",
                vet_id: baseMockVet.vet_id,
                appointment_date: mockAppointmentData.appointment_date,
                status: appointment_status.confirmed,
            });
            prismaMock.appointments.findMany.mockResolvedValueOnce([conflictingAppointment]);

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "The veterinarian already has an appointment at this time.",
            });

            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });

        it("should detect user scheduling conflicts", async () => {
            prismaMock.appointments.findMany.mockResolvedValueOnce([]); // Vet check passes

            const conflictingAppointment = createMockAppointment({
                appointment_id: 4,
                appointment_uuid: "existing-user-appointment",
                pet_id: baseMockPet.pet_id,
                vet_id: 2, // Different vet
                appointment_date: mockAppointmentData.appointment_date,
                status: appointment_status.confirmed,
            });
            prismaMock.appointments.findMany.mockResolvedValueOnce([conflictingAppointment]); // User check finds conflict

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "You already have another appointment scheduled at this time.",
            });

            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });

        it("should handle pet not found errors", async () => {
            jest.requireMock("@/actions").getPet.mockResolvedValueOnce({
                success: false,
                error: "Pet not found",
            });

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });

            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });

        it("should handle veterinarian not found errors", async () => {
            prismaMock.veterinarians.findUnique.mockResolvedValueOnce(null);

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "Veterinarian not found",
            });
            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });

        it("should handle clinic not found errors", async () => {
            prismaMock.clinics.findUnique.mockResolvedValueOnce(null);

            const result = await createUserAppointment(mockAppointmentData);

            expect(result).toEqual({
                success: false,
                error: "Clinic not found",
            });
            expect(prismaMock.appointments.create).not.toHaveBeenCalled();
        });
    });

    describe("getClinicAppointments", () => {
        beforeEach(() => {
            (getServerSession as jest.Mock).mockResolvedValue(mockVetSession); // Assume clinic admin/vet session
            prismaMock.clinics.findFirst.mockResolvedValue({
                ...baseMockClinic,
                user_id: Number(mockVetSession.user.id), // Link clinic to session user
            });
        });

        it("should get all appointments for the current clinic", async () => {
            const mockAppointments = [
                createMockAppointment({ clinic_id: baseMockClinic.clinic_id }),
                createMockAppointment({
                    appointment_id: 2,
                    appointment_uuid: "test-uuid-2",
                    clinic_id: baseMockClinic.clinic_id,
                }),
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getClinicAppointments();

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: {
                    clinic_id: baseMockClinic.clinic_id,
                },
                include: {
                    pets: { include: { users: true } },
                    veterinarians: { include: { users: true } },
                    // No clinics needed here
                },
            });
        });

        it("should handle clinic not found for the current user", async () => {
            prismaMock.clinics.findFirst.mockResolvedValueOnce(null);

            const result = await getClinicAppointments();

            expect(result).toEqual({
                success: false,
                error: "Clinic not found for the current user.",
            });

            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors when finding clinic", async () => {
            prismaMock.clinics.findFirst.mockRejectedValueOnce(new Error("DB error finding clinic"));

            const result = await getClinicAppointments();

            expect(result).toEqual({
                success: false,
                error: "DB error finding clinic",
            });
            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });
    });

    describe("getVeterinarianAppointments", () => {
        beforeEach(() => {
            (getServerSession as jest.Mock).mockResolvedValue(mockVetSession);
            prismaMock.veterinarians.findFirst.mockResolvedValue({
                ...baseMockVet,
                user_id: Number(mockVetSession.user.id), // Link vet to session user
            });
        });

        it("should get all appointments for the current veterinarian", async () => {
            const mockAppointments = [
                createMockAppointment({ vet_id: baseMockVet.vet_id }),
                createMockAppointment({
                    appointment_id: 2,
                    appointment_uuid: "test-uuid-2",
                    vet_id: baseMockVet.vet_id,
                }),
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getVeterinarianAppointments();

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: { vet_id: baseMockVet.vet_id },
                include: {
                    pets: { include: { users: true } },
                    clinics: true,
                    // No veterinarians needed here
                },
            });
        });

        it("should handle veterinarian profile not found for the current user", async () => {
            prismaMock.veterinarians.findFirst.mockResolvedValueOnce(null);

            const result = await getVeterinarianAppointments();

            expect(result).toEqual({
                success: false,
                error: "Veterinarian profile not found for the current user.",
            });

            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors when finding vet", async () => {
            prismaMock.veterinarians.findFirst.mockRejectedValueOnce(new Error("DB error finding vet"));

            const result = await getVeterinarianAppointments();

            expect(result).toEqual({
                success: false,
                error: "DB error finding vet",
            });
            expect(prismaMock.appointments.findMany).not.toHaveBeenCalled();
        });
    });

    describe("cancelAppointment", () => {
        const appointmentUuid = "test-appointment-uuid";

        it("should cancel an appointment successfully", async () => {
            const updatedAppointment = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.cancelled,
            });
            prismaMock.appointments.update.mockResolvedValueOnce(updatedAppointment);

            const result = await cancelAppointment(appointmentUuid);

            expect(result).toEqual({
                success: true,
                data: { appointment_uuid: appointmentUuid },
            });

            expect(prismaMock.appointments.update).toHaveBeenCalledWith({
                where: { appointment_uuid: appointmentUuid },
                data: { status: appointment_status.cancelled },
                include: {
                    pets: { include: { users: true } },
                    veterinarians: { include: { users: true } },
                    clinics: true,
                },
            });

            expect(jest.requireMock("@/actions").sendEmail).toHaveBeenCalledTimes(2);
            expect(jest.requireMock("../../actions/notification").createNotification).toHaveBeenCalledTimes(1);
            expect(jest.requireMock("../../actions/calendar-sync").deleteGoogleCalendarEvent).toHaveBeenCalledWith(
                appointmentUuid,
            );
        });

        it("should handle appointment not found during update", async () => {
            prismaMock.appointments.update.mockRejectedValueOnce(
                new Prisma.PrismaClientKnownRequestError("Record to update not found.", {
                    code: "P2025",
                    clientVersion: "x.y.z",
                }),
            );

            const result = await cancelAppointment(appointmentUuid);

            expect(result).toEqual({
                success: false,
                error: "Appointment not found.",
            });
        });

        it("should handle errors during notification/email sending", async () => {
            const updatedAppointment = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.cancelled,
            });
            prismaMock.appointments.update.mockResolvedValueOnce(updatedAppointment);
            jest.requireMock("@/actions").sendEmail.mockRejectedValueOnce(new Error("Email failed"));

            const result = await cancelAppointment(appointmentUuid);

            expect(result).toEqual({
                success: false,
                error: "Failed to send cancellation notifications.",
            });
        });
    });

    describe("confirmAppointment", () => {
        const appointmentUuid = "test-appointment-uuid";

        it("should confirm an appointment successfully", async () => {
            const updatedAppointment = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.confirmed,
            });
            prismaMock.appointments.update.mockResolvedValueOnce(updatedAppointment);

            const result = await confirmAppointment(appointmentUuid);

            expect(result).toEqual({
                success: true,
                data: { appointment_uuid: appointmentUuid },
            });

            expect(prismaMock.appointments.update).toHaveBeenCalledWith({
                where: { appointment_uuid: appointmentUuid },
                data: { status: appointment_status.confirmed },
                include: {
                    pets: { include: { users: true } },
                    veterinarians: { include: { users: true } },
                    clinics: true,
                },
            });

            expect(jest.requireMock("@/actions").sendEmail).toHaveBeenCalledTimes(1);
            expect(jest.requireMock("../../actions/notification").createNotification).toHaveBeenCalledTimes(1);
            expect(jest.requireMock("../../actions/calendar-sync").addToGoogleCalendar).toHaveBeenCalled();
        });

        it("should handle appointment not found during update", async () => {
            prismaMock.appointments.update.mockRejectedValueOnce(
                new Prisma.PrismaClientKnownRequestError("Record to update not found.", {
                    code: "P2025",
                    clientVersion: "x.y.z",
                }),
            );

            const result = await confirmAppointment(appointmentUuid);

            expect(result).toEqual({
                success: false,
                error: "Appointment not found.",
            });
        });

        it("should handle missing pet data for notification", async () => {
            // Simulate update returning data without pet relation
            const appointmentMissingPet = {
                ...createMockAppointment({
                    appointment_uuid: appointmentUuid,
                    status: appointment_status.confirmed,
                }),
                pets: null, // Explicitly set pets to null
            };
            prismaMock.appointments.update.mockResolvedValueOnce(appointmentMissingPet);

            const result = await confirmAppointment(appointmentUuid);

            expect(result).toEqual({
                success: false,
                error: "Failed to send confirmation: Pet data missing.",
            });
        });
    });

    describe("rescheduleAppointment", () => {
        const appointmentUuid = "test-appointment-uuid";
        const newDate = new Date("2025-06-01T14:00:00");
        const newNotes = "Rescheduled appointment";

        it("should reschedule an appointment successfully", async () => {
            const currentAppointment = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.confirmed,
                pets: { ...baseMockPet, user_id: Number(mockSession.user.id) }, // Ensure pet belongs to session user
            });
            prismaMock.appointments.findUnique.mockResolvedValueOnce(currentAppointment);

            prismaMock.appointments.findMany.mockResolvedValue([]); // No conflicts

            const updatedAppointment = {
                ...currentAppointment,
                appointment_date: newDate,
                notes: newNotes,
                // status might reset or stay confirmed depending on logic
            };
            prismaMock.appointments.update.mockResolvedValueOnce(updatedAppointment);

            const result = await rescheduleAppointment(appointmentUuid, newDate, newNotes);

            expect(result).toBeUndefined(); // Function returns void on success

            expect(prismaMock.appointments.update).toHaveBeenCalledWith({
                where: { appointment_uuid: appointmentUuid },
                data: {
                    appointment_date: newDate,
                    notes: newNotes,
                    // status: appointment_status.requested, // Check if status should reset
                },
                include: {
                    pets: { include: { users: true } },
                    veterinarians: { include: { users: true } },
                    clinics: true,
                },
            });

            expect(revalidatePath).toHaveBeenCalled();
            expect(jest.requireMock("@/actions").sendEmail).toHaveBeenCalledTimes(2);
            expect(jest.requireMock("../../actions/notification").createNotification).toHaveBeenCalledTimes(1);
            expect(jest.requireMock("../../actions/calendar-sync").updateGoogleCalendarEvent).toHaveBeenCalled();
        });

        it("should handle scheduling conflicts", async () => {
            const currentAppointment = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.confirmed,
                pets: { ...baseMockPet, user_id: Number(mockSession.user.id) },
            });
            prismaMock.appointments.findUnique.mockResolvedValueOnce(currentAppointment);

            const conflictingAppointment = createMockAppointment({
                appointment_id: 2,
                appointment_uuid: "another-appointment",
                vet_id: currentAppointment.vet_id ?? undefined, // Use vet_id from current appointment
                appointment_date: newDate,
                status: appointment_status.confirmed,
            });
            prismaMock.appointments.findMany.mockResolvedValueOnce([conflictingAppointment]); // Vet conflict

            const result = await rescheduleAppointment(appointmentUuid, newDate, newNotes);

            expect(result).toEqual({
                success: false,
                error: "The veterinarian already has an appointment at this time.",
            });

            expect(prismaMock.appointments.update).not.toHaveBeenCalled();
        });

        it("should not allow rescheduling completed appointments", async () => {
            const completedAppointment = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.completed,
                pets: { ...baseMockPet, user_id: Number(mockSession.user.id) },
            });
            prismaMock.appointments.findUnique.mockResolvedValueOnce(completedAppointment);

            const result = await rescheduleAppointment(appointmentUuid, newDate, newNotes);

            expect(result).toEqual({
                success: false,
                error: "Cannot reschedule a completed or cancelled appointment.",
            });

            expect(prismaMock.appointments.update).not.toHaveBeenCalled();
        });

        it("should handle appointment not found", async () => {
            prismaMock.appointments.findUnique.mockResolvedValueOnce(null);

            const result = await rescheduleAppointment(appointmentUuid, newDate, newNotes);

            expect(result).toEqual({
                success: false,
                error: "Appointment not found.",
            });
            expect(prismaMock.appointments.update).not.toHaveBeenCalled();
        });

        it("should prevent rescheduling if user does not own the pet", async () => {
            const appointmentOtherUser = createMockAppointment({
                appointment_uuid: appointmentUuid,
                status: appointment_status.confirmed,
                pets: { ...baseMockPet, user_id: 999 }, // Pet belongs to another user
            });
            prismaMock.appointments.findUnique.mockResolvedValueOnce(appointmentOtherUser);

            const result = await rescheduleAppointment(appointmentUuid, newDate, newNotes);

            expect(result).toEqual({
                success: false,
                error: "You are not authorized to reschedule this appointment.",
            });
            expect(prismaMock.appointments.update).not.toHaveBeenCalled();
        });
    });

    describe("getExistingAppointments", () => {
        it("should get existing appointments for a veterinarian on a specific date", async () => {
            const date = new Date("2025-05-01");
            const vetId = baseMockVet.vet_id; // Use vet ID (number)

            // Define the specific type returned by the select
            type ExistingAppointmentSelect = {
                appointment_date: Date;
                duration_minutes: number;
                appointment_uuid: string;
                status: appointment_status;
            };

            const mockAppointments: ExistingAppointmentSelect[] = [
                {
                    appointment_date: new Date("2025-05-01T10:00:00"),
                    duration_minutes: 30,
                    appointment_uuid: "test-uuid-1",
                    status: appointment_status.confirmed,
                },
                {
                    appointment_date: new Date("2025-05-01T14:30:00"),
                    duration_minutes: 45,
                    appointment_uuid: "test-uuid-2",
                    status: appointment_status.requested,
                },
            ];

            prismaMock.appointments.findMany.mockResolvedValueOnce(mockAppointments);

            const result = await getExistingAppointments(date, vetId);

            expect(result).toEqual({
                success: true,
                data: { appointments: mockAppointments },
            });

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            expect(prismaMock.appointments.findMany).toHaveBeenCalledWith({
                where: {
                    vet_id: vetId,
                    appointment_date: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                    status: { notIn: [appointment_status.cancelled, appointment_status.no_show] }, // Correct enum
                },
                select: {
                    appointment_date: true,
                    duration_minutes: true,
                    appointment_uuid: true,
                    status: true,
                },
            });
        });

        it("should handle database errors", async () => {
            const date = new Date("2025-05-01");
            const vetId = baseMockVet.vet_id;

            prismaMock.appointments.findMany.mockRejectedValueOnce(new Error("Database error"));

            const result = await getExistingAppointments(date, vetId);

            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });
});
