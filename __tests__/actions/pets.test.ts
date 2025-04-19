import { addPet, getPet, getPets, getPetId, updatePet } from "../../actions/pets";
import { prismaMock, mockSession } from "../utils/mocks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { breed_type, pet_sex_type, species_type } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

// Mock dependencies
jest.mock("next-auth");
jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe("Pets Actions", () => {
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Mock the session for each test
        (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    });

    describe("addPet", () => {
        const mockPetData = {
            name: "Fluffy",
            breed: breed_type.labrador_retriever,
            species: species_type.dog,
            sex: pet_sex_type.male,
            date_of_birth: new Date("2020-01-01"),
            weight_kg: 25.5,
        };

        const mockPetWithHealthcareData = {
            ...mockPetData,
            healthcare: {
                vaccinations: [
                    {
                        vaccine_name: "Rabies",
                        administered_date: new Date("2022-01-15"),
                        next_due_date: new Date("2023-01-15"),
                        batch_number: "RAB-123456",
                    },
                ],
                procedures: [
                    {
                        procedure_type: "DENTAL_CLEANING",
                        procedure_date: new Date("2022-03-20"),
                        next_due_date: new Date("2023-03-20"),
                        product_used: "Dental Pro Plus",
                        dosage: "10ml",
                        notes: "Regular cleaning",
                    },
                ],
            },
        };

        it("should add a new pet without healthcare data", async () => {
            // Mock the Prisma create response
            prismaMock.pets.create.mockResolvedValueOnce({
                pet_id: 1,
                pet_uuid: "test-uuid",
                user_id: 1,
                ...mockPetData,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                deleted: false,
                private: false,
                profile_picture_url: null,
                breed: breed_type.abyssinian,
                date_of_birth: new Date("2020-01-01"),
                weight_kg: Decimal(25),
                name: "Fluffy",
                species: species_type.dog,
                sex: pet_sex_type.female,
            });

            // Call the action
            const result = await addPet(mockPetData);

            // Verify the result is undefined (success case)
            expect(result).toBeUndefined();

            // Verify Prisma was called correctly
            expect(prismaMock.pets.create).toHaveBeenCalledWith({
                data: {
                    name: mockPetData.name,
                    breed: mockPetData.breed,
                    species: mockPetData.species,
                    sex: mockPetData.sex,
                    date_of_birth: mockPetData.date_of_birth,
                    weight_kg: mockPetData.weight_kg,
                    user_id: Number(mockSession.user.id),
                },
            });

            // Verify path revalidation
            expect(revalidatePath).toHaveBeenCalledWith("/user/pets");
        });

        it("should add a pet with healthcare data", async () => {
            // Mock the Prisma create response for pets
            prismaMock.pets.create.mockResolvedValueOnce({
                pet_id: 1,
                pet_uuid: "test-uuid",
                user_id: 1,
                ...mockPetData,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
                deleted: false,
                private: false,
                profile_picture_url: null,
                breed: breed_type.abyssinian,
                date_of_birth: new Date("2020-01-01"),
                weight_kg: Decimal(25),
                name: "Fluffy",
                sex: pet_sex_type.female,
                species: species_type.dog,
            });

            // Mock the Prisma createMany response for vaccinations
            prismaMock.vaccinations.createMany.mockResolvedValueOnce({ count: 1 });

            // Mock the Prisma createMany response for healthcare procedures
            prismaMock.healthcare_procedures.createMany.mockResolvedValueOnce({ count: 1 });

            // Call the action
            const result = await addPet(mockPetWithHealthcareData);

            // Verify the result is undefined (success case)
            expect(result).toBeUndefined();

            // Verify Prisma was called correctly for the pet
            expect(prismaMock.pets.create).toHaveBeenCalledWith({
                data: {
                    name: mockPetData.name,
                    breed: mockPetData.breed,
                    species: mockPetData.species,
                    sex: mockPetData.sex,
                    date_of_birth: mockPetData.date_of_birth,
                    weight_kg: mockPetData.weight_kg,
                    user_id: Number(mockSession.user.id),
                },
            });

            // Verify Prisma was called correctly for vaccinations
            expect(prismaMock.vaccinations.createMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        pet_id: 1,
                        vaccine_name: "Rabies", // toTitleCase would be applied here
                        administered_date: mockPetWithHealthcareData.healthcare.vaccinations[0].administered_date,
                        next_due_date: mockPetWithHealthcareData.healthcare.vaccinations[0].next_due_date,
                        batch_number: mockPetWithHealthcareData.healthcare.vaccinations[0].batch_number,
                    }),
                ]),
            });

            // Verify Prisma was called correctly for healthcare procedures
            expect(prismaMock.healthcare_procedures.createMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        pet_id: 1,
                        procedure_type: mockPetWithHealthcareData.healthcare.procedures[0].procedure_type,
                        procedure_date: mockPetWithHealthcareData.healthcare.procedures[0].procedure_date,
                        next_due_date: mockPetWithHealthcareData.healthcare.procedures[0].next_due_date,
                        product_used: mockPetWithHealthcareData.healthcare.procedures[0].product_used,
                        dosage: mockPetWithHealthcareData.healthcare.procedures[0].dosage,
                        notes: mockPetWithHealthcareData.healthcare.procedures[0].notes,
                    }),
                ]),
            });

            // Verify path revalidation
            expect(revalidatePath).toHaveBeenCalledWith("/user/pets");
        });

        it("should handle validation errors", async () => {
            // Call the action with invalid data
            const invalidPetData = {
                name: "", // Invalid: empty name
                breed: "INVALID_BREED", // Invalid breed
                species: species_type.dog,
                sex: pet_sex_type.male,
                date_of_birth: new Date(),
                weight_kg: 25.5,
            };

            const result = await addPet(invalidPetData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Please check the form inputs",
            });

            // Verify Prisma was not called
            expect(prismaMock.pets.create).not.toHaveBeenCalled();
        });

        it("should handle missing session", async () => {
            // Mock missing session
            (getServerSession as jest.Mock).mockResolvedValueOnce(null);

            // Call the action
            await addPet(mockPetData);

            // Verify redirect was called
            expect(redirect).toHaveBeenCalledWith("/signin");

            // Verify Prisma was not called
            expect(prismaMock.pets.create).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock the Prisma create rejection
            prismaMock.pets.create.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await addPet(mockPetData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("getPet", () => {
        const mockPetId = 1;
        const mockPetUuid = "test-uuid";
        const mockPetResponse = {
            pet_id: mockPetId,
            pet_uuid: mockPetUuid,
            name: "Fluffy",
            breed: breed_type.labrador_retriever,
            species: species_type.dog,
            sex: pet_sex_type.male,
            date_of_birth: new Date("2020-01-01"),
            weight_kg: 25.5,
            user_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            vaccinations: [],
            medical_records: [],
            healthcare_procedures: [],
            appointments: [],
            prescriptions: [],
            health_monitoring: [],
        };

        it("should get a pet by ID", async () => {
            // Mock the Prisma findUnique response
            prismaMock.pets.findUnique.mockResolvedValueOnce(mockPetResponse);

            // Call the action
            const result = await getPet(mockPetId);

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: {
                    pet: {
                        ...mockPetResponse,
                        weight_kg: "25.50", // formatDecimal applied
                        health_monitoring: [],
                    },
                },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.pets.findUnique).toHaveBeenCalledWith({
                where: { pet_id: mockPetId },
                include: expect.any(Object),
            });
        });

        it("should get a pet by UUID", async () => {
            // Mock the Prisma findUnique response
            prismaMock.pets.findUnique.mockResolvedValueOnce(mockPetResponse);

            // Call the action
            const result = await getPet(mockPetUuid);

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: {
                    pet: {
                        ...mockPetResponse,
                        weight_kg: "25.50", // formatDecimal applied
                        health_monitoring: [],
                    },
                },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.pets.findUnique).toHaveBeenCalledWith({
                where: { pet_uuid: mockPetUuid },
                include: expect.any(Object),
            });
        });

        it("should handle pet not found", async () => {
            // Mock the Prisma findUnique response (pet not found)
            prismaMock.pets.findUnique.mockResolvedValueOnce(null);

            // Call the action
            const result = await getPet(mockPetId);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });
        });

        it("should handle database errors", async () => {
            // Mock the Prisma findUnique rejection
            prismaMock.pets.findUnique.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await getPet(mockPetId);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("updatePet", () => {
        const mockPetUuid = "test-uuid";
        const mockUpdateData = {
            pet_uuid: mockPetUuid,
            name: "Fluffy Updated",
            weight_kg: 27.3,
        };

        it("should update a pet successfully", async () => {
            // Mock the Prisma update response
            prismaMock.pets.update.mockResolvedValueOnce({
                pet_id: 1,
                pet_uuid: mockPetUuid,
                name: "Fluffy Updated",
                breed: breed_type.labrador_retriever,
                species: species_type.dog,
                sex: pet_sex_type.male,
                date_of_birth: new Date("2020-01-01"),
                weight_kg: Decimal(27.3),
                deleted_at: null,
                deleted: false,
                private: false,
                profile_picture_url: null,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            });

            // Call the action
            const result = await updatePet(mockUpdateData);

            // Verify the result is undefined (success case)
            expect(result).toBeUndefined();

            // Verify Prisma was called correctly
            expect(prismaMock.pets.update).toHaveBeenCalledWith({
                where: { pet_uuid: mockPetUuid },
                data: {
                    name: mockUpdateData.name,
                    weight_kg: mockUpdateData.weight_kg,
                },
            });

            // Verify path revalidation
            expect(revalidatePath).toHaveBeenCalledWith(`/user/pets/${mockPetUuid}`);
        });

        it("should handle validation errors", async () => {
            // Call the action with invalid data
            const invalidUpdateData = {
                pet_uuid: mockPetUuid,
                name: "", // Invalid: empty name
                weight_kg: -1, // Invalid weight
            };

            const result = await updatePet(invalidUpdateData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Please check the form inputs",
            });

            // Verify Prisma was not called
            expect(prismaMock.pets.update).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock the Prisma update rejection
            prismaMock.pets.update.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await updatePet(mockUpdateData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });

        it("should handle pet not found", async () => {
            // Mock the Prisma update response (pet not found)
            prismaMock.pets.update.mockResolvedValueOnce({ pet_id: 999999 });

            // Call the action
            const result = await updatePet(mockUpdateData);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Failed to update pet",
            });
        });
    });

    describe("getPets", () => {
        const mockPetsResponse = [
            {
                pet_id: 1,
                pet_uuid: "test-uuid-1",
                name: "Fluffy",
                breed: breed_type.labrador_retriever,
                species: species_type.dog,
                sex: pet_sex_type.male,
                date_of_birth: new Date("2020-01-01"),
                weight_kg: 25.5,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
            {
                pet_id: 2,
                pet_uuid: "test-uuid-2",
                name: "Whiskers",
                breed: "PERSIAN",
                species: "CAT",
                sex: "FEMALE",
                date_of_birth: new Date("2021-03-15"),
                weight_kg: 4.2,
                user_id: 1,
                created_at: new Date(),
                updated_at: new Date(),
            },
        ];

        it("should get all pets for the current user", async () => {
            // Mock the Prisma findMany response
            prismaMock.pets.findMany.mockResolvedValueOnce(mockPetsResponse);

            // Call the action
            const result = await getPets();

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: {
                    pets: mockPetsResponse.map((pet) => ({
                        ...pet,
                        weight_kg: expect.any(String), // formatDecimal applied
                    })),
                },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.pets.findMany).toHaveBeenCalledWith({
                where: { user_id: Number(mockSession.user.id) },
                orderBy: { date_of_birth: "desc" },
            });
        });

        it("should handle no pets found", async () => {
            // Mock the Prisma findMany response (no pets found)
            prismaMock.pets.findMany.mockResolvedValueOnce([]);

            // Call the action
            const result = await getPets();

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: { pets: [] },
            });
        });

        it("should handle missing session", async () => {
            // Mock missing session
            (getServerSession as jest.Mock).mockResolvedValueOnce(null);

            // Call the action
            await getPets();

            // Verify redirect was called
            expect(redirect).toHaveBeenCalledWith("/signin");

            // Verify Prisma was not called
            expect(prismaMock.pets.findMany).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            // Mock the Prisma findMany rejection
            prismaMock.pets.findMany.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await getPets();

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("getPetId", () => {
        const mockPetUuid = "test-uuid";
        const mockPetId = 1;

        it("should get a pet ID from UUID", async () => {
            // Mock the Prisma findUnique response
            prismaMock.pets.findUnique.mockResolvedValueOnce({
                pet_id: mockPetId,
            });

            // Call the action
            const result = await getPetId(mockPetUuid);

            // Verify the result
            expect(result).toEqual({
                success: true,
                data: { pet_id: mockPetId },
            });

            // Verify Prisma was called correctly
            expect(prismaMock.pets.findUnique).toHaveBeenCalledWith({
                where: { pet_uuid: mockPetUuid },
                select: { pet_id: true },
            });
        });

        it("should handle pet not found", async () => {
            // Mock the Prisma findUnique response (pet not found)
            prismaMock.pets.findUnique.mockResolvedValueOnce(null);

            // Call the action
            const result = await getPetId(mockPetUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Pet not found",
            });
        });

        it("should handle database errors", async () => {
            // Mock the Prisma findUnique rejection
            prismaMock.pets.findUnique.mockRejectedValueOnce(new Error("Database error"));

            // Call the action
            const result = await getPetId(mockPetUuid);

            // Verify the error response
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });
});
