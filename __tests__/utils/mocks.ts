import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset } from "jest-mock-extended";

// Create a mock PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Mock the prisma module
jest.mock("../../lib/prisma", () => ({
    prisma: prismaMock,
}));

// Mock the auth session
export const mockSession = {
    user: {
        id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        role: "USER",
    },
};

export const mockVetSession = {
    user: {
        id: "test-vet-id",
        email: "vet@example.com",
        name: "Test Vet",
        role: "VETERINARIAN",
    },
};

export const mockAdminSession = {
    user: {
        id: "test-admin-id",
        email: "admin@example.com",
        name: "Test Admin",
        role: "ADMIN",
    },
};

// Mock the next-auth getServerSession function
jest.mock("next-auth", () => ({
    getServerSession: jest.fn(),
}));

// Mock R2 service
export const r2ServiceMock = {
    uploadFile: jest.fn(),
    getFileUrl: jest.fn(),
    deleteFile: jest.fn(),
};

jest.mock("../../lib/r2-service", () => ({
    uploadFile: r2ServiceMock.uploadFile,
    getFileUrl: r2ServiceMock.getFileUrl,
    deleteFile: r2ServiceMock.deleteFile,
}));

// Mock notification service
export const notificationServiceMock = {
    sendNotification: jest.fn(),
    scheduleNotification: jest.fn(),
};

jest.mock("../../lib/notification-service", () => ({
    sendNotification: notificationServiceMock.sendNotification,
    scheduleNotification: notificationServiceMock.scheduleNotification,
}));

// Mock email service
export const emailServiceMock = {
    sendEmail: jest.fn(),
};

jest.mock("../../lib/email-service", () => ({
    sendEmail: emailServiceMock.sendEmail,
}));

// Reset mocks between tests
beforeEach(() => {
    mockReset(prismaMock);
    jest.clearAllMocks();
});
