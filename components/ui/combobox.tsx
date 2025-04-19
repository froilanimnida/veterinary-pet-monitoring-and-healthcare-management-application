"use client";

import { useCallback, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    name?: string;
}

export function Combobox({
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = "Select option...",
    disabled = false,
    className,
    searchPlaceholder = "Search options...",
    emptyMessage = "No options found.",
    name,
}: ComboboxProps) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);

    // Support both controlled and uncontrolled usage
    const selectedValue = value !== undefined ? value : internalValue;

    const handleSelect = useCallback(
        (currentValue: string) => {
            const newValue = currentValue === selectedValue ? undefined : currentValue;

            // Handle uncontrolled state
            if (value === undefined) {
                setInternalValue(newValue);
            }

            // Call onValueChange for both controlled and uncontrolled
            onValueChange?.(newValue);
            setOpen(false);
        },
        [selectedValue, onValueChange, value],
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                    type="button" // Prevent form submission on click
                >
                    {selectedValue ? options.find((option) => option.value === selectedValue)?.label : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem key={option.value} value={option.value} onSelect={handleSelect}>
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValue === option.value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>

            {name && <input type="hidden" name={name} value={selectedValue || ""} />}
        </Popover>
    );
}

// Sample usage
//import { Combobox } from "@/components/ui/combobox";

//// In your component
//const [selectedBreed, setSelectedBreed] = useState<string | undefined>();

//// Later in JSX
//<Combobox
//  options={[
//    { value: "labrador", label: "Labrador Retriever" },
//    { value: "bulldog", label: "Bulldog" },
//    { value: "poodle", label: "Poodle" }
//  ]}
//  value={selectedBreed}
//  onValueChange={setSelectedBreed}
//  placeholder="Select breed..."
//  name="breed"
///>
