// Add polyfills for TextEncoder/TextDecoder for react-email/render
import { TextEncoder, TextDecoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Import jest-dom matchers
import "@testing-library/jest-dom";

// Add extended Jest matchers
import { jest, beforeEach, beforeAll } from "@jest/globals";
import { prismaMock } from "./utils/mocks"; // Adjust path if needed

jest.mock("@/lib", () => ({
    // Or jest.mock('@/lib/prisma', ...) depending on your import
    __esModule: true,
    prisma: prismaMock,
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
    usePathname: jest.fn().mockReturnValue("/"),
    useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
}));

// Mock next-auth
jest.mock("next-auth", () => ({
    getServerSession: jest.fn().mockResolvedValue({
        user: {
            id: "test-user-id",
            email: "test@example.com",
            name: "Test User",
            role: "user",
        },
    }),
}));

// Define a common mock for cn utility function
jest.mock("@/lib/utils", () => ({
    cn: (...inputs) => inputs.filter(Boolean).join(" "),
}));

// Global mocks for fetch
global.fetch = jest.fn();

// Mock DOM APIs needed by Radix UI components for all tests
beforeAll(() => {
    // Mock hasPointerCapture
    if (!HTMLElement.prototype.hasPointerCapture) {
        HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
    }

    // Mock setPointerCapture
    if (!HTMLElement.prototype.setPointerCapture) {
        HTMLElement.prototype.setPointerCapture = jest.fn();
    }

    // Mock releasePointerCapture
    if (!HTMLElement.prototype.releasePointerCapture) {
        HTMLElement.prototype.releasePointerCapture = jest.fn();
    }

    // Mock scrollIntoView
    if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = jest.fn();
    }
});

// Reset all mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});
