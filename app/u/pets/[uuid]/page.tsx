import React from "react";
import { notFound } from "next/navigation";
import { getPet } from "@/actions/pets";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toTitleCase } from "@/lib/functions/text/title-case";

export async function generateMetadata({ params }: { params: Promise<{ uuid: string }> }): Promise<Metadata> {
    const { uuid } = await params;
    const pet = await getPet(uuid);
    return {
        title: pet
            ? `${toTitleCase(pet.name)} | ${toTitleCase(pet.breed)} | PawsitiveHealth`
            : "Pet Details | PawsitiveHealth",
        description: pet ? `Details for ${pet.name}` : "Pet details page",
    };
}

export default async function PetDetails({ params }: { params: Promise<{ uuid: string }> }) {
    const { uuid } = await params;

    if (!uuid) {
        notFound();
    }

    const pet = await getPet(uuid);

    if (!pet) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="text-2xl">{toTitleCase(pet.name)}</CardTitle>
                    <CardDescription>
                        {toTitleCase(pet.species)} • {toTitleCase(pet.breed)}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Pet Information</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-sm font-medium text-muted-foreground">Species</div>
                                <div>{toTitleCase(pet.species)}</div>

                                <div className="text-sm font-medium text-muted-foreground">Breed</div>
                                <div>{toTitleCase(pet.breed)}</div>

                                <div className="text-sm font-medium text-muted-foreground">Sex</div>
                                <div>{pet.sex}</div>

                                {pet.date_of_birth && (
                                    <>
                                        <div className="text-sm font-medium text-muted-foreground">Date of Birth</div>
                                        <div>{new Date(pet.date_of_birth).toLocaleDateString()}</div>
                                    </>
                                )}

                                <div className="text-sm font-medium text-muted-foreground">Weight</div>
                                <div>{pet.weight_kg?.toString()} kg</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Medical Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Vaccination Status</div>
                                    <div className="mt-1">{pet.vaccination_status || "Unknown"}</div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Medical History</div>
                                    <div className="mt-1 text-sm">
                                        {pet.medical_history || "No medical history available"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="outline">Edit Pet</Button>
                    <Button asChild variant="default">
                        <Link href={`/u/appointments/${pet.pet_uuid}`}>Schedule Appointment</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
