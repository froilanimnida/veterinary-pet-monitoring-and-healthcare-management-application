import { addPrescription, viewPrescription } from "../../actions/prescription";
import { prismaMock, mockVetSession } from "../utils/mocks";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Mock dependencies
jest.mock("next-auth");
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));
jest.mock("@/actions", () => ({
    getPetId: jest.fn().mockResolvedValue({
        success: true,
        data: {
            pet_id: 1,
        },
    }),
}));

describe("Prescription Actions", () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Mock the session as veterinarian for prescription creation tests
        (getServerSession as jest.Mock).mockResolvedValue(mockVetSession);

        // Reset console.error mock to avoid test noise
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    describe("addPrescription", () => {
        const mockPrescriptionData = {
            pet_uuid: "test-pet-uuid",
            pet_id: 1,
            dosage: "10mg daily",
            frequency: "ONCE_DAILY",
            start_date: new Date("2025-04-14"),
            end_date: new Date("2025-05-14"),
            refills_remaining: 3,
            medication_ids: [1, 2],
        };

        it("should create a new prescription successfully", async () => {
            // Mock prescription creation
            prismaMock.prescriptions.create.mockResolvedValueOnce({
                prescription_id: 1,
                prescription_uuid: "test-prescription-uuid",
                pet_id: 1,
                vet_id: 1,
                dosage: mockPrescriptionData.dosage,
                frequency: mockPrescriptionData.frequency,
                start_date: mockPrescriptionData.start_date,
                end_date: mockPrescriptionData.end_date,
                refills_remaining: mockPrescriptionData.refills_remaining,
                created_at: new Date(),
                medication_id: 1,
            });

            // Call the action
            const result = await addPrescription(mockPrescriptionData);

            // Since the function returns void on success, result should be undefined
            expect(result).toBeUndefined();

            // Verify Prisma was called correctly
            expect(prismaMock.prescriptions.create).toHaveBeenCalledWith({
                data: {
                    dosage: mockPrescriptionData.dosage,
                    frequency: mockPrescriptionData.frequency,
                    start_date: mockPrescriptionData.start_date,
                    end_date: mockPrescriptionData.end_date,
                    refills_remaining: mockPrescriptionData.refills_remaining,
                    pet_id: 1, // From the mocked getPetId
                    vet_id: mockVetSession.user.id,
                },
            });

            // Verify path revalidation
            expect(revalidatePath).toHaveBeenCalledWith("/vet/");
        });

        it("should handle validation errors", async () => {
            // Create invalid prescription data (empty dosage)
            const invalidPrescriptionData = {
                ...mockPrescriptionData,
                dosage: "", // Invalid: empty dosage
            };

            // Call the action with invalid data
            const result = await addPrescription(invalidPrescriptionData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Invalid prescription data",
            });

            // Verify Prisma was not called
            expect(prismaMock.prescriptions.create).not.toHaveBeenCalled();
        });

        it("should handle invalid pet UUID", async () => {
            // Override the getPetId mock for this specific test
            jest.requireMock("@/actions").getPetId.mockResolvedValueOnce({
                success: false,
                error: "Pet not found",
            });

            // Call the action
            const result = await addPrescription(mockPrescriptionData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Invalid pet UUID",
            });

            // Verify Prisma was not called
            expect(prismaMock.prescriptions.create).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock database error
            prismaMock.prescriptions.create.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await addPrescription(mockPrescriptionData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Failed to add prescription",
            });

            // Verify console error was called
            expect(console.error).toHaveBeenCalled();
        });

        it("should handle missing session", async () => {
            // Mock missing session
            (getServerSession as jest.Mock).mockResolvedValueOnce(null);

            // Call the action
            await addPrescription(mockPrescriptionData);

            // Verify redirect was called
            expect(redirect).toHaveBeenCalledWith("/signin");

            // Verify Prisma was not called
            expect(prismaMock.prescriptions.create).not.toHaveBeenCalled();
        });
    });

    describe("viewPrescription", () => {
        const mockPrescriptionUuid = "test-prescription-uuid";

        it("should get a prescription by UUID successfully", async () => {
            // Mock finding the prescription
            const mockPrescription = {
                prescription_id: 1,
                prescription_uuid: mockPrescriptionUuid,
                pet_id: 1,
                vet_id: 1,
                dosage: "10mg daily",
                frequency: "ONCE_DAILY",
                start_date: new Date("2025-04-14"),
                end_date: new Date("2025-05-14"),
                refills_remaining: 3,
                created_at: new Date(),
                updated_at: new Date(),
                medication_id: 1,
            };

            prismaMock.prescriptions.findUnique.mockResolvedValueOnce(mockPrescription);

            // Call the action
            const result = await viewPrescription(mockPrescriptionUuid);

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: { prescription: mockPrescription },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.prescriptions.findUnique).toHaveBeenCalledWith({
                where: { prescription_uuid: mockPrescriptionUuid },
            });
        });

        it("should handle prescription not found", async () => {
            // Mock prescription not found
            prismaMock.prescriptions.findUnique.mockResolvedValueOnce(null);

            // Call the action
            const result = await viewPrescription(mockPrescriptionUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Prescription not found",
            });
        });

        it("should handle database errors", async () => {
            // Mock database error
            prismaMock.prescriptions.findUnique.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await viewPrescription(mockPrescriptionUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Failed to view prescription",
            });

            // Verify console error was called
            expect(console.error).toHaveBeenCalled();
        });
    });
});
