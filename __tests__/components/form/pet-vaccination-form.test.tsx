import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PetVaccinationForm from "@/components/form/pet-vaccination-form";
import { toast } from "sonner";
import * as actions from "@/actions";
// Add this import for DOM testing matchers
import "@testing-library/jest-dom";

// Add missing DOM APIs needed by Radix UI (if used in this component)
beforeAll(() => {
    if (!HTMLElement.prototype.hasPointerCapture) {
        HTMLElement.prototype.hasPointerCapture = jest.fn(() => false);
    }

    if (!HTMLElement.prototype.setPointerCapture) {
        HTMLElement.prototype.setPointerCapture = jest.fn();
    }

    if (!HTMLElement.prototype.releasePointerCapture) {
        HTMLElement.prototype.releasePointerCapture = jest.fn();
    }

    if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = jest.fn();
    }
});

// Mock dependencies
jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/actions", () => ({
    createVaccination: jest.fn(),
}));

jest.mock("@/lib", () => {
    const originalModule = jest.requireActual("@/lib");
    return {
        __esModule: true,
        ...originalModule,
        generateVerificationToken: jest.fn().mockReturnValue("test-verification-token"),
        toTitleCase: jest.fn((text) => (text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "")),
        cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
    };
});

describe("PetVaccinationForm", () => {
    const mockPetUuid = "test-pet-uuid-123";
    const mockPetId = 456;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders all form fields correctly", async () => {
        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);

        // Check if all form fields are rendered
        expect(screen.getByLabelText(/Vaccine Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Batch Number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Date Administered/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Next Due Date/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Add Vaccination/i })).toBeInTheDocument();
    });

    it("submits form with valid vaccination data", async () => {
        // Mock successful vaccination creation
        (actions.createVaccination as jest.Mock).mockResolvedValue({
            success: true,
            data: { vaccination: { id: 123 } },
        });

        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);
        const user = userEvent.setup();

        // Fill the form with valid data
        await user.type(screen.getByLabelText(/Vaccine Name/i), "Rabies Vaccine");
        await user.type(screen.getByLabelText(/Batch Number/i), "RAB-2025-04321");

        // Date Administered is pre-filled with today's date

        // Set Next Due Date
        const nextDueDateBtn = screen.getByRole("button", { name: /Select due date/i });
        await user.click(nextDueDateBtn);

        // Select a future date (assuming the calendar shows future dates)
        // First find a date that's enabled (would be in next month typically)
        const nextMonth = screen.getByRole("button", { name: /next month/i });
        await user.click(nextMonth);

        // Click on the 15th of next month
        const futureDateElements = screen.getAllByRole("button", {
            name: (text: string) => /^\d+$/.test(text) && parseInt(text) === 15,
        });
        // Choose the one that's not disabled
        for (const dateElem of futureDateElements) {
            if (!dateElem.hasAttribute("disabled")) {
                await user.click(dateElem);
                break;
            }
        }

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));

        // Verify form submission
        await waitFor(() => {
            expect(actions.createVaccination).toHaveBeenCalledWith(
                expect.objectContaining({
                    pet_uuid: mockPetUuid,
                    pet_id: mockPetId,
                    vaccine_name: "Rabies Vaccine",
                    batch_number: "RAB-2025-04321",
                    administered_date: expect.any(Date),
                    next_due_date: expect.any(Date),
                }),
            );

            expect(toast.success).toHaveBeenCalledWith("Vaccination record added successfully");
        });
    });

    it("submits form without optional fields", async () => {
        // Mock successful vaccination creation
        (actions.createVaccination as jest.Mock).mockResolvedValue({
            success: true,
            data: { vaccination: { id: 124 } },
        });

        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);
        const user = userEvent.setup();

        // Fill only required fields
        await user.type(screen.getByLabelText(/Vaccine Name/i), "Distemper Vaccine");

        // Submit the form without batch number or next due date
        await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));

        // Verify form submission with only required fields
        await waitFor(() => {
            expect(actions.createVaccination).toHaveBeenCalledWith(
                expect.objectContaining({
                    pet_uuid: mockPetUuid,
                    pet_id: mockPetId,
                    vaccine_name: "Distemper Vaccine",
                    administered_date: expect.any(Date),
                }),
            );

            expect(toast.success).toHaveBeenCalledWith("Vaccination record added successfully");
        });
    });

    it("shows error toast when vaccination creation fails", async () => {
        // Mock failed vaccination creation
        (actions.createVaccination as jest.Mock).mockResolvedValue({
            success: false,
            error: "Failed to add vaccination record",
        });

        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);
        const user = userEvent.setup();

        // Fill required fields
        await user.type(screen.getByLabelText(/Vaccine Name/i), "Bordetella Vaccine");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));

        // Verify error handling
        await waitFor(() => {
            expect(actions.createVaccination).toHaveBeenCalled();
            expect(toast.error).toHaveBeenCalledWith("Failed to add vaccination record");
        });
    });

    it("handles unexpected errors during submission", async () => {
        // Mock an exception during vaccination creation
        const errorMessage = "Network error occurred";
        (actions.createVaccination as jest.Mock).mockRejectedValue(new Error(errorMessage));

        // Spy on console.error
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);
        const user = userEvent.setup();

        // Fill required fields
        await user.type(screen.getByLabelText(/Vaccine Name/i), "Leptospirosis Vaccine");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));

        // Verify error handling
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Error adding vaccination record:", expect.any(Error));
            expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
        });

        consoleSpy.mockRestore();
    });

    it("disables form inputs during submission", async () => {
        // Mock slow vaccination creation
        (actions.createVaccination as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100)),
        );

        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);
        const user = userEvent.setup();

        // Fill required fields
        await user.type(screen.getByLabelText(/Vaccine Name/i), "Parvo Vaccine");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));

        // Verify inputs and button are disabled during submission
        await waitFor(() => {
            expect(screen.getByLabelText(/Vaccine Name/i)).toBeDisabled();
            expect(screen.getByLabelText(/Batch Number/i)).toBeDisabled();
            expect(screen.getByRole("button", { name: /Saving/i })).toBeDisabled();
        });
    });

    it("resets form after successful submission", async () => {
        // Mock successful vaccination creation
        (actions.createVaccination as jest.Mock).mockResolvedValue({
            success: true,
            data: { vaccination: { id: 125 } },
        });

        render(<PetVaccinationForm petUuid={mockPetUuid} petId={mockPetId} />);
        const user = userEvent.setup();

        // Fill the form
        await user.type(screen.getByLabelText(/Vaccine Name/i), "FVRCP Vaccine");
        await user.type(screen.getByLabelText(/Batch Number/i), "FVRCP-2025-12345");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Add Vaccination/i }));

        // Verify form is reset after successful submission
        await waitFor(() => {
            expect(screen.getByLabelText(/Vaccine Name/i)).toHaveValue("");
            expect(screen.getByLabelText(/Batch Number/i)).toHaveValue("");
        });
    });
});
