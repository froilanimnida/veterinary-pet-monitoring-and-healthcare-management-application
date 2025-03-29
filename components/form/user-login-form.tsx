"use client";
import { useState } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas/auth-definitions";
import { z } from "zod";
import toast from "react-hot-toast";
import { TextFormField } from "@/types/forms/text-form-field";
import { useRouter } from "next/navigation";

const UserLoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const loginFormFields: TextFormField[] = [
        {
            label: "Email",
            placeholder: "someone@example.com",
            name: "email",
            description: "The email you use when you register an account.",
            required: true,
            autoComplete: "email",
            type: "email",
        },
        {
            label: "Password",
            placeholder: "********",
            name: "password",
            description: "The password you use when you register your account.",
            required: true,
            type: "password",
            autoComplete: "current-password",
        },
    ];
    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        progressive: true,
        resolver: zodResolver(LoginSchema),
        shouldFocusError: true,
        mode: "onBlur",
        reValidateMode: "onChange",
    });

    const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
        setIsLoading(true);
        await toast
            .promise(
                async () => {
                    await signIn("credentials", {
                        email: values.email,
                        password: values.password,
                        callbackUrl: "/",
                        redirect: false,
                    });
                },
                {
                    loading: "Signing in...",
                    success: "Successfully signed in",
                    error: "Failed to sign in. Please check your credentials.",
                },
            )
            .finally(() => {
                setIsLoading(false);
            });
        const session = await getSession();
        if (session && session.user && session.user.role) {
            setIsLoading(true);
            if (session.user?.role === "client") router.push("/c");
            else if (session.user?.role === "veterinarian") router.push("/v");
            else if (session.user?.role === "admin") router.push("/a");
            else if (session.user?.role === "user") router.push("/u");
        }
    };

    return (
        <Form {...form}>
            <form
                method="POST"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)(e);
                }}
                className="space-y-8"
            >
                {loginFormFields.map((loginField) => (
                    <FormField
                        key={loginField.name}
                        control={form.control}
                        name={loginField.name as "email" | "password"}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>{loginField.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        type={loginField.type}
                                        autoComplete={loginField.autoComplete}
                                        placeholder={loginField.placeholder}
                                        {...field}
                                        required={loginField.required}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                                <FormDescription>{loginField.description}</FormDescription>
                                <FormMessage className="text-red-500">{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <Button disabled={isLoading} className="w-full" type="submit">
                    Login
                </Button>
            </form>
        </Form>
    );
};

export default UserLoginForm;
