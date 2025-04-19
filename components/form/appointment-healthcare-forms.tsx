"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import PrescriptionForm from "../form/prescription-form";
import { useState } from "react";
import PetProcedureForm from "./pet-healthcare-procedure-form";
import { VaccinationForm } from "./veccination-form";
import type { medications } from "@prisma/client";

interface AppointmentHealthcareFormsProps {
    petId: number;
    petUuid: string;
    appointmentUuid?: string;
    appointmentId?: number;
    vetId?: number;
    isVetView?: boolean;
    isCheckedIn?: boolean;
    medicationList: medications[] | [];
}

export function AppointmentHealthcareForms({
    petId,
    petUuid,
    appointmentUuid,
    appointmentId,
    vetId,
    isVetView = false,
    isCheckedIn = true,
    medicationList,
}: AppointmentHealthcareFormsProps) {
    const [activeTab, setActiveTab] = useState("vaccination");

    return (
        <div className="mt-6 space-y-4">
            <Tabs defaultValue="vaccination" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                    <TabsTrigger value="vaccination">Vaccination</TabsTrigger>
                    <TabsTrigger value="procedure">Healthcare Procedure</TabsTrigger>
                    <TabsTrigger value="prescription">Prescription</TabsTrigger>
                </TabsList>

                <TabsContent value="vaccination" className="p-4 border rounded-md bg-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Record Vaccination</h3>
                        <p className="text-sm text-muted-foreground">
                            {isVetView
                                ? "Record vaccines administered during this appointment"
                                : "Record historical vaccination information for this pet"}
                        </p>
                    </div>

                    <VaccinationForm
                        petId={petId}
                        petUuid={petUuid}
                        appointmentId={appointmentId}
                        appointmentUuid={appointmentUuid}
                        isUserView={false}
                    />
                </TabsContent>

                <TabsContent value="procedure" className="p-4 border rounded-md bg-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Record Healthcare Procedure</h3>
                        <p className="text-sm text-muted-foreground">
                            {isVetView
                                ? "Record procedures performed during this appointment"
                                : "Record historical procedure information for this pet"}
                        </p>
                    </div>

                    <PetProcedureForm
                        petId={petId}
                        petUuid={petUuid}
                        appointmentId={appointmentId}
                        appointmentUuid={appointmentUuid}
                        isUserView={!isVetView}
                        vetId={vetId}
                    />
                </TabsContent>

                <TabsContent value="prescription" className="p-4 border rounded-md bg-card">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Issue Prescription</h3>
                        <p className="text-sm text-muted-foreground">Create a new prescription for this pet</p>
                    </div>

                    <PrescriptionForm
                        medicationList={medicationList}
                        petId={petId}
                        petUuid={petUuid}
                        appointmentId={appointmentId}
                        appointmentUuid={appointmentUuid}
                        vetId={vetId}
                        isCheckIn={isCheckedIn}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
