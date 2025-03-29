"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { FormItem, Form, FormControl, FormField, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatBreeds, DogBreeds } from "@/types/breed-types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { PetSchema } from "@/schemas/pet-definition";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import toast from "react-hot-toast";
import { addPet } from "@/actions/pets";
import { toTitleCase } from "@/lib/functions/text/title-case";

const AddPetForm = () => {
    const [selectedBreed, setSelectedBreed] = useState<string | undefined>(undefined);
    const [selectedSpecies, setSelectedSpecies] = useState<string>("dog");

    const getBreedOptions = () => {
        if (selectedSpecies === "dog") {
            return Object.values(DogBreeds);
        } else if (selectedSpecies === "cat") {
            return Object.values(CatBreeds);
        }
        return [];
    };
    const form = useForm({
        shouldFocusError: true,
        defaultValues: {
            name: "",
            species: "dog",
            breed: "",
            weight_kg: 0,
            sex: "prefer-not-to-say",
            medical_history: "",
            vaccination_status: "",
            date_of_birth: undefined,
        },
        progressive: true,
        resolver: zodResolver(PetSchema),
    });

    const textFields: {
        name: "name" | "species" | "breed" | "sex" | "medical_history" | "vaccination_status" | "weight_kg";
        label: string;
        placeholder: string;
        description: string;
        type: string;
    }[] = [
        {
            name: "name",
            label: "Name",
            placeholder: "Name",
            description: "Enter your pet name",
            type: "text",
        },
        {
            name: "weight_kg",
            label: "Weight (kg)",
            placeholder: "Weight",
            description: "Enter your pet's weight in kilograms",
            type: "number",
        },
        {
            name: "medical_history",
            label: "Medical History",
            placeholder: "Medical history",
            description: "Enter your pet's medical history",
            type: "text",
        },
        {
            name: "vaccination_status",
            label: "Vaccination Status",
            placeholder: "Vaccination status",
            description: "Enter your pet's vaccination status",
            type: "text",
        },
    ];

    const selectFields: {
        name: "species" | "breed" | "sex";
        label: string;
        placeholder: string;
        description: string;
        options: { value: string; label: string }[];
        defaultValue?: string;
        onChange?: (value: string) => void;
    }[] = [
        {
            name: "species",
            label: "Species",
            placeholder: "Species",
            options: [
                { value: "dog", label: "Dog" },
                { value: "cat", label: "Cat" },
            ],
            description: "Select the species of your pet",
            defaultValue: selectedSpecies,
            onChange: (value) => {
                setSelectedSpecies(value);
                form.setValue("breed", "");
            },
        },
        {
            name: "breed",
            label: "Breed",
            placeholder: "Breed",
            description: "Select the breed of your pet",
            options: getBreedOptions().map((breed) => ({
                value: breed,
                label: toTitleCase(breed),
            })),
            defaultValue: selectedBreed,
            onChange: (value) => {
                setSelectedBreed(value);
            },
        },
        {
            name: "sex",
            label: "Sex",
            placeholder: "Sex",
            description: "Select the sex of your pet",
            options: [
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
            ],
            defaultValue: "prefer_not_to_say",
        },
    ];
    const onSubmit = (values: z.infer<typeof PetSchema>) => {
        toast.promise(addPet(values), {
            loading: "Adding pet...",
            success: "Pet added successfully",
            error: "Failed to add pet",
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {textFields.map((textField) => (
                    <FormField
                        key={textField.name}
                        control={form.control}
                        name={textField.name}
                        render={({ field, formState }) => (
                            <FormItem>
                                <FormLabel>{textField.label}</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type={textField.type || "text"}
                                        placeholder={textField.placeholder}
                                        {...(textField.type === "number"
                                            ? {
                                                  onChange: (e) => field.onChange(+e.target.value),
                                                  value: field.value,
                                              }
                                            : {})}
                                    />
                                </FormControl>
                                <FormDescription>{textField.description}</FormDescription>
                                <FormMessage>{formState.errors[textField.name]?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <FormField
                    name="date_of_birth"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value ? format(field.value, "MM/dd/yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                if (!date) {
                                                    field.onChange(null);
                                                    return;
                                                }

                                                const dateOnly = new Date(
                                                    date.getFullYear(),
                                                    date.getMonth(),
                                                    date.getDate(),
                                                );

                                                field.onChange(dateOnly);
                                            }}
                                            initialFocus
                                            disabled={(date) => date > new Date()}
                                            className="bg-white"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormDescription>Enter your pet&apos;s date of birth</FormDescription>
                            <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                    )}
                />
                {selectFields.map((selectField) => (
                    <FormField
                        key={selectField.name}
                        control={form.control}
                        name={selectField.name}
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel>{selectField.label}</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        if (selectField.onChange) selectField.onChange(value);
                                    }}
                                    value={field.value}
                                    defaultValue={field.value || selectField.defaultValue}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={selectField.placeholder} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {selectField.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>{selectField.description}</FormDescription>
                                <FormMessage>{fieldState.error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                ))}
                <Button type="submit" className="mt-6">
                    Add Pet
                </Button>
            </form>
        </Form>
    );
};

export default AddPetForm;
