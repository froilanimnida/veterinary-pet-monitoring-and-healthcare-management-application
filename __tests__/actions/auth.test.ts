// Import the specific functions to test directly
import {
    isEmailTaken,
    createAccount,
    verifyEmail,
    verifyOTPToken,
    loginAccount,
    nextAuthLogin,
    createClinicAccount,
    regenerateOTPToken,
} from "@/actions/auth";
import { prismaMock } from "../utils/mocks";
import * as hashUtils from "@/lib"; // Keep this alias if used in assertions
import jwt from "jsonwebtoken";
import { role_type } from "@prisma/client";

const VALID_DATA = {
    user_id: 1,
    user_uuid: "test-uuid",
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    disabled: false,
    email: "test@example.com",
    email_verified: false,
    email_verification_expires_at: null,
    email_verification_token: null,
    first_name: "John",
    last_name: "Doe",
    password_hash: "hashed_password",
    last_login: null,
    phone_number: "1234567890",
    otp_expires_at: null,
    otp_token: null,
    password_reset_expires_at: null,
    password_reset_token: null,
    role: role_type.user,
};

// Mock external dependencies
jest.mock("next-auth/react", () => ({
    signOut: jest.fn().mockResolvedValue(undefined),
}));

// Mock dependencies from within the project (lib, other actions)
jest.mock("@/actions", () => ({
    __esModule: true,
    createNewPreferenceDefault: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(true),
}));

// THIS IS THE KEY CHANGE - Use jest.doMock to ensure this mock is applied before the auth.ts file imports it
// We also need to make sure we mock the REAL import path used in auth.ts
jest.mock("@/lib", () => {
    const originalModule = jest.requireActual("@/lib");
    return {
        __esModule: true,
        ...originalModule,
        // Replace prisma with our mock
        prisma: prismaMock,
        // Mock other utility functions used by auth.ts
        hashPassword: jest.fn().mockResolvedValue("hashed_password_123"),
        verifyPassword: jest.fn().mockResolvedValue(true),
        generateOtp: jest.fn().mockReturnValue("123456"),
        generateVerificationToken: jest.fn().mockReturnValue("test-verification-token"),
        toTitleCase: jest.fn((text) => (text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "")),
    };
});

jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

describe("Authentication Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.EMAIL_VERIFICATION_SECRET = "test-secret";
        process.env.FRONTEND_URL = "http://localhost:3000";
        // Reset JWT mock implementation if needed per test
        (jwt.verify as jest.Mock).mockClear();
    });

    describe("isEmailTaken", () => {
        it("should return true if email is taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(VALID_DATA);
            // Call the imported function directly
            const result = await isEmailTaken("test@example.com");
            expect(result).toBe(true);
            expect(prismaMock.users.findFirst).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
        });

        it("should return false if email is not taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            // Call the imported function directly
            const result = await isEmailTaken("available@example.com");
            expect(result).toBe(false);
        });
    });

    describe("createAccount", () => {
        const mockUserData = {
            first_name: "john",
            last_name: "doe",
            email: "john.doe@example.com",
            password: "Password123!",
            phone_number: "1234567890",
        };

        it("should create a new user account successfully", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            prismaMock.users.create.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 1, // Ensure user_id is present for createNewPreferenceDefault call
                user_uuid: "new-user-uuid",
            });

            // Dynamically require the mocked actions module to access the mocks
            const mockedActions = jest.requireMock("@/actions");

            // Call the imported function directly
            const result = await createAccount({ confirm_password: mockUserData.password, ...mockUserData });

            expect(result).toEqual({
                success: true,
                data: { user_uuid: "new-user-uuid" },
            });

            expect(hashUtils.hashPassword).toHaveBeenCalledWith(mockUserData.password);
            expect(hashUtils.generateVerificationToken).toHaveBeenCalledWith(mockUserData.email);
            expect(prismaMock.users.create).toHaveBeenCalled();
            // Access the mock function correctly
            expect(mockedActions.createNewPreferenceDefault).toHaveBeenCalledWith(1);
            expect(mockedActions.sendEmail).toHaveBeenCalled();
        });

        it("should handle email already taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 2,
                email: mockUserData.email,
                user_uuid: "existing-user-uuid",
                first_name: "Existing",
                last_name: "User",
                phone_number: "0987654321",
            });

            // Call the imported function directly
            const result = await createAccount({ confirm_password: mockUserData.password, ...mockUserData });

            expect(result).toEqual({
                success: false,
                error: "email_or_phone_number_already_exists",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const invalidUserData = {
                ...mockUserData,
                email: "not-an-email",
            };
            // Call the imported function directly
            const result = await createAccount({
                confirm_password: invalidUserData.password,
                ...invalidUserData,
            });
            expect(result).toEqual({
                success: false,
                error: "Invalid input",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
        });

        it("should handle database errors", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            prismaMock.users.create.mockRejectedValueOnce(new Error("Database error"));
            // Call the imported function directly
            const result = await createAccount({
                confirm_password: mockUserData.password,
                ...mockUserData,
            });
            expect(result).toEqual({
                success: false,
                error: "Database error",
            });
        });
    });

    describe("verifyEmail", () => {
        const testToken = "valid-verification-token";

        it("should verify email successfully", async () => {
            (jwt.verify as jest.Mock).mockReturnValueOnce({ email: "user@example.com" });
            prismaMock.users.updateMany.mockResolvedValueOnce({ count: 1 });
            // Call the imported function directly
            const result = await verifyEmail(testToken);
            expect(result).toEqual({
                success: true,
                data: { verified: true },
            });
            expect(jwt.verify).toHaveBeenCalledWith(testToken, "test-secret");
            expect(prismaMock.users.updateMany).toHaveBeenCalledWith({
                where: { email: "user@example.com" },
                data: {
                    email_verified: true,
                    email_verification_token: null,
                    email_verification_expires_at: null,
                },
            });
        });

        it("should handle user not found", async () => {
            (jwt.verify as jest.Mock).mockReturnValueOnce({ email: "nonexistent@example.com" });
            prismaMock.users.updateMany.mockResolvedValueOnce({ count: 0 });
            // Call the imported function directly
            const result = await verifyEmail(testToken);
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });

        it("should handle invalid token", async () => {
            (jwt.verify as jest.Mock).mockImplementationOnce(() => {
                throw new Error("Invalid token");
            });
            // Call the imported function directly
            const result = await verifyEmail("invalid-token");
            expect(result).toEqual({
                success: false,
                error: "Invalid token",
            });
            expect(prismaMock.users.updateMany).not.toHaveBeenCalled();
        });
    });

    describe("verifyOTPToken", () => {
        const testEmail = "user@example.com";
        const validOtp = "123456";

        it("should verify valid OTP token successfully", async () => {
            const now = new Date();
            const future = new Date(now.getTime() + 10 * 60 * 1000);
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: validOtp,
                otp_expires_at: future,
            });
            prismaMock.users.update.mockResolvedValueOnce({ ...VALID_DATA, otp_token: null, otp_expires_at: null });
            // Call the imported function directly
            const result = await verifyOTPToken(testEmail, validOtp);
            expect(result).toEqual({
                success: true,
                data: {
                    correct: true,
                    role: "user",
                },
            });
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { user_id: 1 },
                data: {
                    otp_token: null,
                    otp_expires_at: null,
                },
            });
        });

        it("should reject expired OTP token", async () => {
            const now = new Date();
            const past = new Date(now.getTime() - 10 * 60 * 1000);
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: validOtp,
                otp_expires_at: past,
            });
            // Call the imported function directly
            const result = await verifyOTPToken(testEmail, validOtp);
            expect(result).toEqual({
                success: true, // The action itself succeeds, but indicates incorrect OTP
                data: {
                    correct: false,
                },
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should reject incorrect OTP token", async () => {
            const now = new Date();
            const future = new Date(now.getTime() + 10 * 60 * 1000);
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: validOtp,
                otp_expires_at: future,
            });
            // Call the imported function directly
            const result = await verifyOTPToken(testEmail, "wrong-otp");
            expect(result).toEqual({
                success: true, // The action itself succeeds, but indicates incorrect OTP
                data: {
                    correct: false,
                },
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            // Call the imported function directly
            const result = await verifyOTPToken("nonexistent@example.com", validOtp);
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });

        it("should handle missing OTP", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                otp_token: null,
                otp_expires_at: null,
            });
            // Call the imported function directly
            const result = await verifyOTPToken(testEmail, validOtp);
            expect(result).toEqual({
                success: false,
                error: "OTP token not found or expired",
            });
        });
    });

    describe("loginAccount", () => {
        const loginData = {
            email: "user@example.com",
            password: "Password123!",
        };

        it("should initiate login process successfully", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                email_verified: true,
            });
            prismaMock.users.update.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 1,
                email: loginData.email,
                first_name: "John",
                last_name: "Doe",
                otp_token: "123456",
                otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);

            const mockedActions = jest.requireMock("@/actions");
            // Call the imported function directly
            const result = await loginAccount(loginData);

            expect(result).toEqual({
                success: true,
                data: { data: {} }, // Original function returns empty data object on success
            });
            expect(hashUtils.generateOtp).toHaveBeenCalled();
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { email: loginData.email },
                data: {
                    otp_expires_at: expect.any(Date),
                    otp_token: "123456",
                },
            });
            expect(mockedActions.sendEmail).toHaveBeenCalled();
        });

        it("should reject invalid password", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(false);
            const mockedActions = jest.requireMock("@/actions");
            // Call the imported function directly
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "Invalid password",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(mockedActions.sendEmail).not.toHaveBeenCalled();
        });

        it("should reject unverified email", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                email_verified: false,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            const mockedActions = jest.requireMock("@/actions");
            // Call the imported function directly
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "Email not verified",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(mockedActions.sendEmail).not.toHaveBeenCalled();
        });

        it("should reject disabled account", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                disabled: true,
                email_verified: true,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            // Call the imported function directly
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "User account is disabled",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            // Call the imported function directly
            const result = await loginAccount(loginData);
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
        });
    });

    describe("nextAuthLogin", () => {
        const loginData = {
            email: "user@example.com",
            password: "Password123!",
        };

        it("should validate user credentials successfully", async () => {
            const mockUser = {
                ...VALID_DATA,
                email: loginData.email,
                email_verified: true,
            };
            prismaMock.users.findFirst.mockResolvedValueOnce(mockUser);
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            // Call the imported function directly
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: true,
                data: { user: mockUser },
            });
        });

        it("should reject invalid password", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(false);
            // Call the imported function directly
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: false,
                error: "Invalid password",
            });
        });

        it("should reject unverified email", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                email_verified: false,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            // Call the imported function directly
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: false,
                error: "Email not verified",
            });
        });

        it("should reject disabled account", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                email: loginData.email,
                disabled: true,
                email_verified: true,
            });
            (hashUtils.verifyPassword as jest.Mock).mockResolvedValueOnce(true);
            // Call the imported function directly
            const result = await nextAuthLogin(loginData.email, loginData.password);
            expect(result).toEqual({
                success: false,
                error: "User account is disabled",
            });
        });
    });

    describe("createClinicAccount", () => {
        const mockClinicData = {
            first_name: "john",
            last_name: "doe",
            email: "clinic@example.com",
            password: "Password123!",
            confirm_password: "Password123!",
            phone_number: "1234567890",
            name: "pet clinic",
            address: "123 Main St",
            city: "Anytown",
            state: "ST",
            postal_code: "12345",
            emergency_services: true,
            operating_hours: [
                { day_of_week: 0, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 1, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 2, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 3, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 4, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 5, opens_at: "08:00", closes_at: "17:00", is_closed: false },
                { day_of_week: 6, opens_at: "08:00", closes_at: "17:00", is_closed: false },
            ],
        };

        it("should create a new clinic account successfully", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            prismaMock.users.create.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 1,
                user_uuid: "new-clinic-uuid",
                email: mockClinicData.email,
                first_name: mockClinicData.first_name,
                last_name: mockClinicData.last_name,
                phone_number: mockClinicData.phone_number,
                role: role_type.client,
            });
            prismaMock.clinics.create.mockResolvedValueOnce({
                clinic_id: 1,
                name: mockClinicData.name,
                address: mockClinicData.address,
                city: mockClinicData.city,
                state: mockClinicData.state,
                postal_code: mockClinicData.postal_code,
                phone_number: mockClinicData.phone_number,
                emergency_services: mockClinicData.emergency_services,
                user_id: 1,
                created_at: new Date(),
                clinic_uuid: "new-clinic-uuid", // Use the same UUID for consistency if needed
                google_maps_url: "https://maps.google.com",
                latitude: 12.345678,
                longitude: 98.765432,
                website: "",
            });

            const mockedActions = jest.requireMock("@/actions");
            // Call the imported function directly
            const result = await createClinicAccount(mockClinicData);

            expect(result).toEqual({
                success: true,
                data: { user_uuid: "new-clinic-uuid" },
            });
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.first_name);
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.last_name);
            expect(hashUtils.toTitleCase).toHaveBeenCalledWith(mockClinicData.name);
            expect(prismaMock.clinics.create).toHaveBeenCalled();
            expect(mockedActions.sendEmail).toHaveBeenCalled();
            expect(mockedActions.createNewPreferenceDefault).toHaveBeenCalledWith(1);
        });

        it("should handle email already taken", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce({
                ...VALID_DATA,
                user_id: 2,
                email: mockClinicData.email,
            });
            // Call the imported function directly
            const result = await createClinicAccount(mockClinicData);
            expect(result).toEqual({
                success: false,
                error: "email_or_phone_number_already_exists",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
            expect(prismaMock.clinics.create).not.toHaveBeenCalled();
        });

        it("should handle validation errors", async () => {
            const invalidClinicData = {
                ...mockClinicData,
                email: "not-an-email",
            };
            // Call the imported function directly
            const result = await createClinicAccount(invalidClinicData);
            expect(result).toEqual({
                success: false,
                error: "Invalid input",
            });
            expect(prismaMock.users.create).not.toHaveBeenCalled();
            expect(prismaMock.clinics.create).not.toHaveBeenCalled();
        });
    });

    describe("regenerateOTPToken", () => {
        const testEmail = "user@example.com";

        it("should regenerate OTP successfully", async () => {
            const mockUser = {
                ...VALID_DATA,
                user_id: 1,
                email: testEmail,
                first_name: "John",
                last_name: "Doe",
            };
            prismaMock.users.findFirst.mockResolvedValueOnce(mockUser);
            prismaMock.users.update.mockResolvedValueOnce({
                ...mockUser,
                otp_token: "123456",
                otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
            });

            const mockedActions = jest.requireMock("@/actions");
            // Call the imported function directly
            const result = await regenerateOTPToken(testEmail);

            expect(result).toEqual({
                success: true,
                data: { user: mockUser }, // Check if the structure matches the actual return type
            });
            expect(hashUtils.generateOtp).toHaveBeenCalledWith(testEmail);
            expect(prismaMock.users.update).toHaveBeenCalledWith({
                where: { email: testEmail },
                data: {
                    otp_expires_at: expect.any(Date),
                    otp_token: "123456",
                },
            });
            expect(mockedActions.sendEmail).toHaveBeenCalled();
        });

        it("should handle user not found", async () => {
            prismaMock.users.findFirst.mockResolvedValueOnce(null);
            const mockedActions = jest.requireMock("@/actions");
            // Call the imported function directly
            const result = await regenerateOTPToken("nonexistent@example.com");
            expect(result).toEqual({
                success: false,
                error: "User not found",
            });
            expect(prismaMock.users.update).not.toHaveBeenCalled();
            expect(mockedActions.sendEmail).not.toHaveBeenCalled();
        });
    });
});
