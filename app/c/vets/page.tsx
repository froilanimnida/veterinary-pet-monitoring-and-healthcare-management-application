import React, { Suspense } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import NewVeterinaryForm from "@/components/form/new-vet-form";
import type { Metadata } from "next";
import { getClinicVeterinarians } from "@/actions/veterinary";
import Link from "next/link";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Veterinaries",
    description: "PawsitiveHealth is a pet health care service.",
};

const Veterinaries = async () => {
    const veterinaries = await getClinicVeterinarians();
    if (!veterinaries || veterinaries.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No veterinaries found</h3>
                <p className="text-muted-foreground">Add your first veterinary to get started</p>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
            {veterinaries.map((veterinary) => (
                <Card key={veterinary.license_number}>
                    <CardHeader>
                        <CardTitle>
                            {veterinary.users?.first_name} {veterinary.users?.last_name}
                        </CardTitle>
                        <CardDescription>{veterinary.specialization}</CardDescription>
                    </CardHeader>
                    <CardContent>{veterinary.license_number}</CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href={`/c/vets/${veterinary.vet_uuid}`}>Manage</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

const Veterinary = () => {
    return (
        <section className="p-4 w-full">
            <Suspense fallback={<SkeletonCard />}>
                <Veterinaries />
            </Suspense>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Add Veterinary</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Veterinary</DialogTitle>
                        <DialogDescription>
                            Please provide the details of the new veterinary you want to add.
                        </DialogDescription>
                    </DialogHeader>
                    <NewVeterinaryForm />
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default Veterinary;
