"use client";
import ResponsiveContainer from "@/components/shared/layout/responsive-container";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  FormItem,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breeds } from "@/lib/types/breed-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

const breedsArray = Object.values(Breeds);

function AddPets() {
  const form = useForm({
    shouldFocusError: true,
    values: {
      "pet-name": "",
      "pet-species": "",
      "pet-breed": "",
      "pet-age": "",
      weight: "",
      color: "",
    },
    defaultValues: {
      "pet-name": "",
      "pet-species": "",
      "pet-breed": "",
      "pet-age": "",
      weight: "",
      color: "",
    },
  });
  const [date, setDate] = useState(new Date());
  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>Add a Pet</CardTitle>
          <CardDescription>Fill in the details of your pet</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormControl>
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormField
                  name="pet-name"
                  render={({ field, fieldState, formState }) => (
                    <Input type="text" placeholder="Enter your pet's name" />
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Species</FormLabel>
                <FormField
                  name="pet-species"
                  render={({ field, fieldState, formState }) => (
                    <Select required>
                      <SelectTrigger>Species</SelectTrigger>
                      <SelectValue>Species</SelectValue>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormField
                  name="pet-breed"
                  render={({ field, fieldState, formState }) => (
                    <Select required>
                      <SelectTrigger>Select Breed</SelectTrigger>
                      <SelectContent>
                        {breedsArray.map((breed) => (
                          <SelectItem value={breed} key={breed}>
                            {breed.replaceAll("_", " ").toLocaleUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
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
                          required
                          className="bg-white"
                          mode="single"
                          selected={date}
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
            <FormControl>
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormField
                  name="weight"
                  render={({ field, fieldState, formState }) => (
                    <Input
                      required
                      type="number"
                      placeholder="Enter your pet's weight"
                    />
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormField
                  name="sex"
                  render={({ field, fieldState, formState }) => (
                    <Select>
                      <SelectTrigger>Sex</SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="prefer-not-to-say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Medical History</FormLabel>
                <FormField
                  name="medical-history"
                  render={({ field, fieldState, formState }) => (
                    <Input
                      required
                      type="text"
                      placeholder="Enter your pet's medical history"
                    />
                  )}
                />
              </FormItem>
            </FormControl>
            <FormControl>
              <FormItem>
                <FormLabel>Vaccination Status</FormLabel>
                <FormField
                  name="vaccination-status"
                  render={({ field, fieldState, formState }) => (
                    <Input
                      required
                      type="text"
                      placeholder="Enter your pet's vaccination status"
                    />
                  )}
                />
              </FormItem>
            </FormControl>
          </Form>
        </CardContent>
        <CardFooter>
          <Button type="submit">Add Pet</Button>
        </CardFooter>
      </Card>
    </ResponsiveContainer>
  );
}

export default AddPets;
