import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import PrescriptionForm from "@/components/form/prescription-form";
import { toast } from "sonner";
import * as actions from "@/actions";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

// Add missing DOM APIs needed by Radix UI
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

    // Mock the function that Radix UI is trying to access
    if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = jest.fn();
    }
});

// Mock the cn utility from @/lib
jest.mock("@/lib", () => {
    const originalModule = jest.requireActual("@/lib");
    return {
        __esModule: true,
        ...originalModule,
        cn: (...inputs: string[]) => inputs.filter(Boolean).join(" "),
    };
});

// Mock dependencies
jest.mock("sonner", () => ({
    toast: {
        loading: jest.fn(),
        success: jest.fn(),
        error: jest.fn(),
        dismiss: jest.fn(),
    },
}));

jest.mock("@/actions", () => ({
    addPrescription: jest.fn(),
    getMedicationsList: jest.fn(),
}));

describe("PrescriptionForm", () => {
    const mockPetId = 123;
    const mockAppointmentUuid = "appointment-uuid-123";
    const mockMedications = [
        { id: 1, name: "Amoxicillin" },
        { id: 2, name: "Metacam" },
        { id: 3, name: "Frontline" },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock successful medication list fetch
        (actions.getMedicationsList as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                medication: mockMedications.map((med) => ({
                    medication_id: med.id,
                    name: med.name,
                })),
            },
        });
    });

    it("renders all form fields correctly", async () => {
        render(<PrescriptionForm petId={mockPetId} appointmentUuid={mockAppointmentUuid} />);

        // Wait for medications to load
        await waitFor(() => {
            expect(actions.getMedicationsList).toHaveBeenCalled();
        });

        // Check if all form fields are rendered
        expect(screen.getByLabelText(/Medication/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Dosage/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Frequency/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Refills/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Issue Prescription/i })).toBeInTheDocument();
    });

    it("loads and displays medications in the dropdown", async () => {
        render(<PrescriptionForm petId={mockPetId} appointmentUuid={mockAppointmentUuid} />);

        // Wait for medications to load
        await waitFor(() => {
            expect(actions.getMedicationsList).toHaveBeenCalled();
        });

        // Open the medication dropdown
        const user = userEvent.setup();
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));

        // Check if all medications are listed
        await waitFor(() => {
            mockMedications.forEach((med) => {
                expect(screen.getByRole("option", { name: med.name })).toBeInTheDocument();
            });
        });
    });

    it("shows error when medication list fails to load", async () => {
        // Mock failed medication list fetch
        (actions.getMedicationsList as jest.Mock).mockResolvedValue({
            success: false,
            error: "Failed to load medications",
        });

        // Spy on console.error
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

        render(<PrescriptionForm petId={mockPetId} appointmentUuid={mockAppointmentUuid} />);

        // Check if error was logged
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith("Error fetching medications:", expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    it("submits form with valid prescription data", async () => {
        // Mock successful prescription submission
        (actions.addPrescription as jest.Mock).mockResolvedValue(undefined);

        render(<PrescriptionForm petId={mockPetId} appointmentUuid={mockAppointmentUuid} />);
        const user = userEvent.setup();

        // Wait for medications to load
        await waitFor(() => {
            expect(actions.getMedicationsList).toHaveBeenCalled();
        });

        // Fill the form
        // Select medication
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));
        await user.click(screen.getByRole("option", { name: "Amoxicillin" }));

        // Enter dosage
        await user.type(screen.getByLabelText(/Dosage/i), "10mg twice daily");

        // Enter frequency
        await user.type(screen.getByLabelText(/Frequency/i), "Every 12 hours");

        // Start date is pre-filled with today
        // End date is pre-filled with today + 7 days

        // Set refills
        const refillsInput = screen.getByLabelText(/Refills/i);
        await user.clear(refillsInput);
        await user.type(refillsInput, "3");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Issue Prescription/i }));

        // Verify form submission
        await waitFor(() => {
            expect(actions.addPrescription).toHaveBeenCalledWith(
                expect.objectContaining({
                    pet_id: mockPetId,
                    appointment_uuid: mockAppointmentUuid,
                    medication_id: 1,
                    dosage: "10mg twice daily",
                    frequency: "Every 12 hours",
                    start_date: expect.any(Date),
                    end_date: expect.any(Date),
                    refills_remaining: 3,
                }),
            );

            expect(toast.loading).toHaveBeenCalledWith("Issuing prescription...");
            expect(toast.success).toHaveBeenCalledWith("Prescription issued successfully");
        });
    });

    it("shows error toast when prescription submission fails", async () => {
        // Mock failed prescription submission
        (actions.addPrescription as jest.Mock).mockResolvedValue({
            success: false,
            error: "Failed to issue prescription",
        });

        render(<PrescriptionForm petId={mockPetId} appointmentUuid={mockAppointmentUuid} />);
        const user = userEvent.setup();

        // Wait for medications to load
        await waitFor(() => {
            expect(actions.getMedicationsList).toHaveBeenCalled();
        });

        // Fill the form with minimal required data
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));
        await user.click(screen.getByRole("option", { name: "Metacam" }));

        await user.type(screen.getByLabelText(/Dosage/i), "5ml");
        await user.type(screen.getByLabelText(/Frequency/i), "Once daily");

        // Submit the form
        await user.click(screen.getByRole("button", { name: /Issue Prescription/i }));

        // Verify error handling
        await waitFor(() => {
            expect(actions.addPrescription).toHaveBeenCalled();
            expect(toast.loading).toHaveBeenCalledWith("Issuing prescription...");
            expect(toast.error).toHaveBeenCalledWith("Failed to issue prescription");
        });
    });

    it("disables the form during submission", async () => {
        // Mock slow prescription submission
        (actions.addPrescription as jest.Mock).mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(undefined), 100)),
        );

        render(<PrescriptionForm petId={mockPetId} appointmentUuid={mockAppointmentUuid} />);
        const user = userEvent.setup();

        // Wait for medications to load
        await waitFor(() => {
            expect(actions.getMedicationsList).toHaveBeenCalled();
        });

        // Fill the form with minimal required data
        await user.click(screen.getByRole("combobox", { name: /Medication/i }));
        await user.click(screen.getByRole("option", { name: "Frontline" }));

        await user.type(screen.getByLabelText(/Dosage/i), "1 pipette");
        await user.type(screen.getByLabelText(/Frequency/i), "Monthly");

        // Submit the form
        const submitButton = screen.getByRole("button", { name: /Issue Prescription/i });
        await user.click(submitButton);

        // Verify button is disabled during submission
        await waitFor(() => {
            const button = screen.getByRole("button", { name: /Issuing\.\.\./i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute("disabled");
        });

        // Wait for submission to complete
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Prescription issued successfully");
        });
    });
});
