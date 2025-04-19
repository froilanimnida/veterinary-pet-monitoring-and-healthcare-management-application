import { createVaccination, getPetVaccinations, getVaccination } from "../../actions/vaccination";
import { prismaMock, mockSession } from "../utils/mocks";
import { getServerSession } from "next-auth";
import * as petsActions from "../../actions/pets";
import { breed_type, pet_sex_type, species_type, type pets, type vaccinations } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Mock dependencies
jest.mock("next-auth");
jest.mock("../../actions/pets", () => ({
    getPet: jest.fn(),
}));

const VALID_VACCINATION_DATA: vaccinations = {
    administered_by: null,
    vaccination_id: 1,
    appointment_id: null,
    created_at: new Date(),
    pet_id: 1,
    vaccination_uuid: "test-vaccination-uuid",
    vaccine_name: "Rabies",
    administered_date: new Date("2025-01-15"),
    next_due_date: new Date("2026-01-15"),
    batch_number: "RAB-123456",
};

const VALID_PET_DATA: pets = {
    pet_id: 1,
    pet_uuid: "test-pet-uuid",
    name: "Fluffy",
    breed: breed_type.labrador_retriever,
    created_at: new Date(),
    updated_at: new Date(),
    date_of_birth: new Date("2020-01-01"),
    weight_kg: Decimal(25.5),
    deleted: false,
    user_id: 1,
    deleted_at: null,
    private: false,
    profile_picture_url: null,
    sex: pet_sex_type.female,
    species: species_type.dog,
};

describe("Vaccination Actions", () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Mock the session for each test
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    describe("createVaccination", () => {
        const mockVaccinationData = {
            pet_uuid: "test-pet-uuid",
            vaccine_name: "Rabies",
            administered_date: new Date("2025-01-15"),
            next_due_date: new Date("2026-01-15"),
            batch_number: "RAB-123456",
        };

        it("should create a new vaccination record successfully", async () => {
            // Mock finding the pet
            prismaMock.pets.findFirst.mockResolvedValueOnce(VALID_PET_DATA);

            // Mock creating the vaccination
            prismaMock.vaccinations.create.mockResolvedValueOnce(VALID_VACCINATION_DATA);

            // Call the action
            const result = await createVaccination(mockVaccinationData);

            // Verify result
            expect(result).toEqual({
                success: true,
                data: { vaccination_uuid: "test-vaccination-uuid" },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.pets.findFirst).toHaveBeenCalledWith({
                where: { pet_uuid: mockVaccinationData.pet_uuid },
            });

            expect(prismaMock.vaccinations.create).toHaveBeenCalledWith({
                data: {
                    vaccine_name: mockVaccinationData.vaccine_name,
                    administered_date: mockVaccinationData.administered_date,
                    next_due_date: mockVaccinationData.next_due_date,
                    batch_number: mockVaccinationData.batch_number,
                    pet_id: 1,
                },
            });
        });

        it("should handle validation errors", async () => {
            // Call the action with invalid data
            const invalidVaccinationData = {
                pet_uuid: "test-pet-uuid",
                vaccine_name: "", // Invalid: empty vaccine name
                administered_date: new Date("2025-01-15"),
                next_due_date: new Date("2020-01-15"), // Invalid: earlier than administered date
                batch_number: "RAB-123456",
            };

            const result = await createVaccination(invalidVaccinationData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Please check the form inputs",
            });

            // Verify Prisma was not called
            expect(prismaMock.vaccinations.create).not.toHaveBeenCalled();
        });

        it("should handle pet not found error", async () => {
            // Mock the pet not being found
            prismaMock.pets.findFirst.mockResolvedValueOnce(null);

            // Call the action
            const result = await createVaccination(mockVaccinationData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });

            // Verify create wasn't called
            expect(prismaMock.vaccinations.create).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock finding the pet
            prismaMock.pets.findFirst.mockResolvedValueOnce(VALID_PET_DATA);

            // Mock database error
            prismaMock.vaccinations.create.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await createVaccination(mockVaccinationData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("getVaccination", () => {
        const mockVaccinationUuid = "test-vaccination-uuid";

        it("should get a vaccination record successfully", async () => {
            // Mock finding the vaccination
            prismaMock.vaccinations.findFirst.mockResolvedValueOnce(VALID_VACCINATION_DATA);

            // Call the action
            const result = await getVaccination(mockVaccinationUuid);

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: {
                    vaccination: {
                        vaccination_id: 1,
                        vaccination_uuid: mockVaccinationUuid,
                        pet_id: 1,
                        vaccine_name: "Rabies",
                        administered_date: new Date("2025-01-15"),
                        next_due_date: new Date("2026-01-15"),
                        batch_number: "RAB-123456",
                        vet_id: null,
                        created_at: expect.any(Date),
                        updated_at: expect.any(Date),
                    },
                },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.vaccinations.findFirst).toHaveBeenCalledWith({
                where: { vaccination_uuid: mockVaccinationUuid },
            });
        });

        it("should handle vaccination not found error", async () => {
            // Mock the vaccination not being found
            prismaMock.vaccinations.findFirst.mockResolvedValueOnce(null);

            // Call the action
            const result = await getVaccination(mockVaccinationUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Vaccination not found",
            });
        });

        it("should handle database errors", async () => {
            // Mock database error
            prismaMock.vaccinations.findFirst.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await getVaccination(mockVaccinationUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("getPetVaccinations", () => {
        const mockPetUuid = "test-pet-uuid";

        it("should get all vaccinations for a pet successfully", async () => {
            // Mock getPet function
            const mockPet: {
                success: boolean;
                data: {
                    pet: pets;
                };
            } = {
                success: true,
                data: {
                    pet: {
                        pet_id: 1,
                        pet_uuid: mockPetUuid,
                        name: "Fluffy",
                        breed: breed_type.labrador_retriever,
                        species: species_type.dog,
                        sex: pet_sex_type.female,
                        date_of_birth: new Date("2020-01-01"),
                        weight_kg: Decimal(25.5),
                        created_at: new Date(),
                        updated_at: new Date(),
                        deleted: false,
                        deleted_at: null,
                        private: false,
                        user_id: 1,
                        profile_picture_url: null,
                    },
                },
            };

            jest.spyOn(petsActions, "getPet").mockResolvedValueOnce(mockPet);

            // Mock finding the vaccinations
            const mockVaccinations = [
                { ...VALID_PET_DATA, pet_id: 2 },
                {
                    vaccination_id: 1,
                    vaccination_uuid: "vaccination-1",
                    pet_id: 1,
                    vaccine_name: "Rabies",
                    administered_date: new Date("2025-01-15"),
                    next_due_date: new Date("2026-01-15"),
                    batch_number: "RAB-123456",
                    vet_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                {
                    vaccination_id: 2,
                    vaccination_uuid: "vaccination-2",
                    pet_id: 1,
                    vaccine_name: "Distemper",
                    administered_date: new Date("2025-02-20"),
                    next_due_date: new Date("2026-02-20"),
                    batch_number: "DST-789012",
                    vet_id: null,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
            ];

            prismaMock.vaccinations.findMany.mockResolvedValueOnce(mockVaccinations);

            // Call the action
            const result = await getPetVaccinations(mockPetUuid);

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: { vaccinations: mockVaccinations },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.vaccinations.findMany).toHaveBeenCalledWith({
                where: { pet_id: 1 },
            });
        });

        it("should handle pet not found error", async () => {
            // Mock pet not found response
            jest.spyOn(petsActions, "getPet").mockResolvedValueOnce({
                success: false,
                error: "Pet not found",
            });

            // Call the action
            const result = await getPetVaccinations(mockPetUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });

            // Verify findMany wasn't called
            expect(prismaMock.vaccinations.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock getPet function
            const mockPet = {
                success: true,
                data: {
                    pet: {
                        pet_id: 1,
                        pet_uuid: mockPetUuid,
                        name: "Fluffy",
                        breed: "LABRADOR_RETRIEVER",
                        species: "DOG",
                        sex: "MALE",
                        date_of_birth: new Date("2020-01-01"),
                        weight_kg: "25.50",
                    },
                },
            };

            jest.spyOn(petsActions, "getPet").mockResolvedValueOnce(mockPet);

            // Mock database error
            prismaMock.vaccinations.findMany.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await getPetVaccinations(mockPetUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });
});
