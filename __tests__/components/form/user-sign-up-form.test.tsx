import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import UserSignUpForm from "@/components/form/user-sign-up-form";
import * as actions from "@/actions";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { toast } from "sonner";

// Mock dependencies
jest.mock("sonner", () => ({
    toast: {
        promise: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/actions", () => ({
    createAccount: jest.fn(),
}));

jest.mock("@/lib", () => ({
    toTitleCase: (text: string) => text, // Simple mock that returns the input unchanged
}));

describe("UserSignUpForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all form fields correctly", () => {
        render(<UserSignUpForm />);

        // Check if all form fields are rendered
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirm your password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Create account/i })).toBeInTheDocument();
    });

    it("displays validation errors for empty form submission", async () => {
        const user = userEvent.setup();
        render(<UserSignUpForm />);

        // Submit the empty form
        await user.click(screen.getByRole("button", { name: /Create account/i }));

        // Check if validation errors are displayed
        await waitFor(() => {
            expect(screen.getAllByText(/\brequired\b/i).length).toBeGreaterThan(0);
        });
    });

    it("displays validation error for invalid email", async () => {
        const user = userEvent.setup();
        render(<UserSignUpForm />);

        // Fill in an invalid email
        await user.type(screen.getByLabelText(/Email/i), "invalid-email");
        await user.tab(); // Move focus to trigger validation

        // Check if email validation error is displayed
        await waitFor(() => {
            expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
        });
    });

    it("displays validation error for password mismatch", async () => {
        const user = userEvent.setup();
        render(<UserSignUpForm />);

        // Fill in mismatched passwords
        await user.type(screen.getByLabelText(/^Password$/i), "Password123!");
        await user.type(screen.getByLabelText(/Confirm your password/i), "Password456!");
        await user.tab(); // Move focus to trigger validation

        // Check if password mismatch error is displayed
        await waitFor(() => {
            expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
        });
    });

    it("displays validation error for short password", async () => {
        const user = userEvent.setup();
        render(<UserSignUpForm />);

        // Fill in a short password
        await user.type(screen.getByLabelText(/^Password$/i), "short");
        await user.tab(); // Move focus to trigger validation

        // Check if password length error is displayed
        await waitFor(() => {
            expect(screen.getByText(/Password must be/i)).toBeInTheDocument();
        });
    });
    // Update the expectation in your test
    it("calls createAccount action with valid form data", async () => {
        const user = userEvent.setup();
        render(<UserSignUpForm />);

        // Mock the createAccount to resolve successfully
        (actions.createAccount as jest.Mock).mockResolvedValue({ success: true });

        // Fill in all form fields with valid data
        await user.type(screen.getByLabelText(/First Name/i), "John");
        await user.type(screen.getByLabelText(/Last Name/i), "Doe");
        await user.type(screen.getByLabelText(/Email/i), "john.doe@example.com");
        await user.type(screen.getByLabelText(/Phone Number/i), "1234567890");
        await user.type(screen.getByLabelText(/^Password$/i), "Password123!");
        await user.type(screen.getByLabelText(/Confirm your password/i), "Password123!");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Create account/i }));

        // Check if createAccount was called with the correct data
        await waitFor(() => {
            // First, check that the action was called with correct data
            expect(actions.createAccount).toHaveBeenCalledWith({
                first_name: "John",
                last_name: "Doe",
                email: "john.doe@example.com",
                phone_number: "1234567890",
                password: "Password123!",
                confirm_password: "Password123!",
            });

            // Then, check that toast.promise was called (without checking exact parameters)
            expect(toast.promise).toHaveBeenCalled();
        });
    });
});
