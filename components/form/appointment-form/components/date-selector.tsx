import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DateSelectorProps {
    control: any;
    onSelect: (date: Date | undefined) => void;
}

export function DateSelector({ control, onSelect }: DateSelectorProps) {
    return (
        <FormField
            name="appointment_date"
            control={control}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel>Appointment Date</FormLabel>
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
                                    {field.value ? format(field.value, "MMM dd, yyyy") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    required
                                    selected={field.value}
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        onSelect(date || undefined);
                                    }}
                                    initialFocus
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date < today;
                                    }}
                                    className="bg-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormDescription>Select appointment date</FormDescription>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
            )}
        />
    );
}
