"use client";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Button,
} from "@/components/ui";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema, SignUpType } from "@/schemas";
import { createAccount } from "@/actions";
import { toast } from "sonner";
import type { TextFormField } from "@/types/forms/text-form-field";

function UserSignUpForm() {
    const signUpFormField: TextFormField[] = [
        {
            label: "First Name",
            placeholder: "First Name",
            name: "first_name",
            description: "Your first name",
            required: true,
            autoComplete: "given-name",
            type: "text",
        },
        {
            label: "Last Name",
            placeholder: "Last Name",
            name: "last_name",
            description: "Your Last name",
            required: true,
            autoComplete: "family-name",
            type: "text",
        },
        {
            label: "Email",
            placeholder: "Email",
            name: "email",
            description: "Your valid email address",
            required: true,
            autoComplete: "email",
            type: "email",
        },
        {
            label: "Phone Number",
            placeholder: "Phone Number",
            name: "phone_number",
            description: "Your phone number",
            required: true,
            autoComplete: "tel",
            type: "tel",
        },
        {
            label: "Password",
            placeholder: "Password",
            name: "password",
            description: "Your password",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
        {
            label: "Confirm your password",
            placeholder: "Confirm Password",
            name: "confirm_password",
            description: "Retype your password",
            required: true,
            autoComplete: "new-password",
            type: "password",
        },
    ];
    const signUpForm = useForm({
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            confirm_password: "",
            phone_number: "",
        },
        resolver: zodResolver(SignUpSchema),
        shouldFocusError: true,
        progressive: true,
        mode: "onChange",
    });

    const onSubmit = async (values: SignUpType) => {
        toast.promise(createAccount(values), {
            success: () => {
                signUpForm.reset();
                return "Account created successfully!";
            },
            loading: "Creating account...",
            error: (error) => {
                if (error === "failed_to_create_user") {
                    return "Failed to create user";
                }
                if (error === "user_already_exists") {
                    return "User already exists";
                }
                return "Failed to create user";
            },
        });
    };
    return (
        <Form {...signUpForm}>
            <form onSubmit={signUpForm.handleSubmit(onSubmit)} className="space-y-8">
                {signUpFormField.map((signUpFormField) => (
                    <FormField
                        key={signUpFormField.name}
                        control={signUpForm.control}
                        name={
                            signUpFormField.name as
                                | "first_name"
                                | "last_name"
                                | "email"
                                | "password"
                                | "confirm_password"
                                | "phone_number"
                        }
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel htmlFor={field.name}>{signUpFormField.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        id={field.name}
                                        required={signUpFormField.required}
                                        type={signUpFormField.type}
                                        autoComplete={signUpFormField.autoComplete}
                                        placeholder={signUpFormField.placeholder}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>{signUpFormField.description}</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <Button className="w-full">Create account</Button>
            </form>
        </Form>
    );
}

export default UserSignUpForm;
