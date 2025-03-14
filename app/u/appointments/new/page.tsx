"use client";

import ResponsiveContainer from "@/components/shared/layout/responsive-container";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { AppointmentType } from "@/lib/types/appointment-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function NewAppointment() {
  const form = useForm();
  const appointmentTypes = Object.values(AppointmentType);
  const [date, setDate] = useState(new Date());
  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>Add New Appointment</CardTitle>
          <CardDescription>Add new clinic appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormControl>
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormField
                  name="notes"
                  render={({ field, fieldState, formState }) => (
                    <Select required>
                      <SelectTrigger>Appointment Type</SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((type) => (
                          <SelectItem value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Date of Appointment</FormLabel>
                <FormField
                  name="date-of-birth"
                  render={({ field, fieldState, formState }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? (
                            format(date, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          className="bg-white"
                          mode="single"
                          selected={date}
                          required
                          onSelect={(day) => {
                            setDate(day ? day : new Date());
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </FormItem>
            </FormControl>
          </Form>
        </CardContent>
        <CardFooter>
          <Button>Create appointment</Button>
        </CardFooter>
      </Card>
    </ResponsiveContainer>
  );
}

export default NewAppointment;
