"use client";
import React from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewClinicAccountSchema } from "@/schemas/clinic-signup-definition";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { createClinicAccount } from "@/actions/auth";
import { OperatingHoursField } from "./operating-hours-field";
import type { TextFormField } from "@/types/forms/text-form-field";

const ClinicSignUp = () => {
    const clinicSignUpFields: TextFormField[] = [
        {
            label: "Clinic Name",
            placeholder: "Clinic Name",
            name: "name",
            description: "The name of your clinic.",
            required: true,
            autoComplete: "organization",
            type: "text",
        },
        {
            label: "Address",
            placeholder: "Address",
            name: "address",
            description: "The address of your clinic.",
            required: true,
            autoComplete: "street-address",
            type: "text",
        },
        {
            label: "City",
            placeholder: "City",
            name: "city",
            description: "The city where your clinic is located.",
            required: true,
            autoComplete: "address-level2",
            type: "text",
        },
        {
            label: "State",
            placeholder: "State",
            name: "state",
            description: "The state where your clinic is located.",
            required: true,
            autoComplete: "address-level1",
            type: "text",
        },
        {
            label: "Postal Code",
            placeholder: "Postal Code",
            name: "postal_code",
            description: "The postal code of your clinic.",
            required: true,
            autoComplete: "postal-code",
            type: "text",
        },
        {
            label: "Phone Number",
            placeholder: "Phone Number",
            name: "phone_number",
            description: "The phone number of your clinic.",
            required: true,
            autoComplete: "tel",
            type: "tel",
        },
        {
            label: "First Name",
            placeholder: "First Name",
            name: "first_name",
            description: "The first name of the clinic owner.",
            required: true,
            autoComplete: "given-name",
            type: "text",
        },
        {
            label: "Last Name",
            placeholder: "Last Name",
            name: "last_name",
            description: "The last name of the clinic owner.",
            required: true,
            autoComplete: "family-name",
            type: "text",
        },
        {
            label: "Email",
            placeholder: "Email",
            name: "email",
            description: "The email of the clinic owner.",
            required: true,
            autoComplete: "email",
            type: "email",
        },
        {
            label: "Password",
            placeholder: "Password",
            name: "password",
            description: "The password of the clinic owner.",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
        {
            label: "Confirm Password",
            placeholder: "Confirm Password",
            name: "confirm_password",
            description: "Confirm the password of the clinic owner.",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
    ];
    const clinicSignUpForm = useForm({
        defaultValues: {
            name: "",
            address: "",
            city: "",
            state: "",
            postal_code: "",
            phone_number: "",
            emergency_services: false,
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirm_password: "",
            operating_hours: Array(7)
                .fill(0)
                .map((_, i) => ({
                    day_of_week: i,
                    opens_at: "09:00",
                    closes_at: "17:00",
                    is_closed: i === 0 || i === 6,
                })),
        },
        resolver: zodResolver(NewClinicAccountSchema),
        progressive: true,
        shouldFocusError: true,
        mode: "onBlur",
    });
    const onSubmit = (values: z.infer<typeof NewClinicAccountSchema>) => {
        toast.promise(createClinicAccount(values), {
            loading: "Creating account...",
            success: "Successfully created account",
            error: (error) => {
                const errorMessage = error instanceof Error ? error.message : String(error);

                if (errorMessage.includes("email_or_phone_number_already_exists")) {
                    return "Email or phone number already exists";
                }
                return errorMessage;
            },
        });
    };
    return (
        <Form {...clinicSignUpForm}>
            <form onSubmit={clinicSignUpForm.handleSubmit(onSubmit)} className="space-y-8">
                {clinicSignUpFields.map((clinicSignUpField) => (
                    <FormField
                        key={clinicSignUpField.name}
                        control={clinicSignUpForm.control}
                        name={
                            clinicSignUpField.name as
                                | "name"
                                | "address"
                                | "city"
                                | "state"
                                | "postal_code"
                                | "phone_number"
                                | "first_name"
                                | "last_name"
                                | "email"
                                | "password"
                                | "confirm_password"
                        }
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>{clinicSignUpField.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        required={clinicSignUpField.required}
                                        type={clinicSignUpField.type}
                                        autoComplete={clinicSignUpField.autoComplete}
                                        placeholder={clinicSignUpField.placeholder}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>{clinicSignUpField.description}</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <FormField
                    name="emergency_services"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Emergency Services</FormLabel>
                            <FormControl>
                                <Checkbox required {...field} />
                            </FormControl>
                            <FormDescription>Do you provide emergency services?</FormDescription>
                            <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
                <OperatingHoursField />
                <Button type="submit">Sign Up</Button>
            </form>
        </Form>
    );
};

export default ClinicSignUp;
