import { Suspense } from "react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
    Separator,
    SkeletonCard,
} from "@/components/ui";
import { FileText, Pill, Syringe, Stethoscope, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { getAppointmentHistoricalData } from "@/actions";
import { toTitleCase } from "@/lib";
import type { healthcare_procedures, medical_records, vaccinations } from "@prisma/client";
import type { PrescriptionWithMedication } from "@/types/common-prisma-join-types";

export function AppointmentHistoricalDataCard({
    petName,
    data: { vaccinations, healthcareProcedures, prescriptions, medicalRecords },
}: {
    petName: string;
    data: {
        vaccinations: vaccinations[];
        healthcareProcedures: healthcare_procedures[];
        prescriptions: PrescriptionWithMedication[];
        medicalRecords: medical_records[];
    };
}) {
    const formatDate = (date: Date | null) => {
        if (!date) return "Not recorded";
        return format(new Date(date), "MMM d, yyyy");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">{petName}&apos;s Health History</CardTitle>
                <CardDescription>
                    View past vaccinations, prescriptions, healthcare procedures, and medical records
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="vaccinations" className="mt-4 w-full">
                    <TabsList className="flex flex-row mb-4 w-full">
                        <TabsTrigger value="vaccinations">
                            <Syringe className="h-4 w-4 mr-2" />
                            Vaccinations
                        </TabsTrigger>
                        <TabsTrigger value="prescriptions">
                            <Pill className="h-4 w-4 mr-2" />
                            Prescriptions
                        </TabsTrigger>
                        <TabsTrigger value="procedures">
                            <Stethoscope className="h-4 w-4 mr-2" />
                            Procedures
                        </TabsTrigger>
                        <TabsTrigger value="records">
                            <FileText className="h-4 w-4 mr-2" />
                            Medical Records
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="vaccinations">
                        {vaccinations && vaccinations.length > 0 ? (
                            <div className="space-y-4">
                                {vaccinations.map((vax) => (
                                    <Card key={vax.vaccination_id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">
                                                {vax.vaccine_name || "Unknown Vaccine"}
                                            </CardTitle>
                                            <CardDescription>
                                                Administered on {formatDate(vax.administered_date)}
                                            </CardDescription>
                                        </CardHeader>
                                        {vax.batch_number && (
                                            <CardContent className="pt-0">
                                                <p className="text-sm text-muted-foreground">
                                                    Batch: {vax.batch_number}
                                                </p>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<Syringe />} message="No vaccination history found" />
                        )}
                    </TabsContent>

                    <TabsContent value="prescriptions">
                        {prescriptions && prescriptions.length > 0 ? (
                            <div className="space-y-4">
                                {prescriptions.map((rx) => (
                                    <Card key={rx.prescription_id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">
                                                {rx.medications?.name || rx.medications?.name || "Prescription"}
                                            </CardTitle>
                                            <CardDescription>
                                                {rx.dosage} • {rx.frequency}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">Start date:</span>{" "}
                                                    {formatDate(rx.start_date)}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">End date:</span>{" "}
                                                    {formatDate(rx.end_date)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<Pill />} message="No prescription history found" />
                        )}
                    </TabsContent>

                    <TabsContent value="procedures">
                        {healthcareProcedures && healthcareProcedures.length > 0 ? (
                            <div className="space-y-4">
                                {healthcareProcedures.map((proc) => (
                                    <Card key={proc.procedure_id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">
                                                {toTitleCase(proc.procedure_type.replace(/_/g, " "))}
                                            </CardTitle>
                                            <CardDescription>
                                                Performed on {formatDate(proc.procedure_date)}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            {(proc.product_used || proc.dosage) && (
                                                <div className="mb-2">
                                                    {proc.product_used && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">Product:</span>{" "}
                                                            {proc.product_used}
                                                        </p>
                                                    )}
                                                    {proc.dosage && (
                                                        <p className="text-sm">
                                                            <span className="font-medium">Dosage:</span> {proc.dosage}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                            {proc.notes && (
                                                <>
                                                    <Separator className="my-2" />
                                                    <p className="text-sm">
                                                        <span className="font-medium">Notes:</span> {proc.notes}
                                                    </p>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<Stethoscope />} message="No procedure history found" />
                        )}
                    </TabsContent>

                    <TabsContent value="records">
                        {medicalRecords && medicalRecords.length > 0 ? (
                            <div className="space-y-4">
                                {medicalRecords.map((record) => (
                                    <Card key={record.record_id}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">
                                                {record.diagnosis || "Medical Visit"}
                                            </CardTitle>
                                            <CardDescription>Visit on {formatDate(record.visit_date)}</CardDescription>
                                        </CardHeader>
                                        {record.notes && (
                                            <CardContent className="pt-0">
                                                <p className="text-sm">
                                                    <span className="font-medium">Notes:</span> {record.notes}
                                                </p>
                                            </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <EmptyState icon={<FileText />} message="No medical records found" />
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
    return (
        <div className="py-10 flex flex-col items-center justify-center text-center border rounded-lg bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                {icon || <AlertCircle className="h-6 w-6" />}
            </div>
            <h3 className="font-medium">{message}</h3>
            <p className="text-sm text-muted-foreground mt-1">Healthcare information will appear here when available</p>
        </div>
    );
}

const AppointmentHistoricalData = async ({
    appointmentUuid,
    petName,
}: {
    appointmentUuid: string;
    petName: string;
    status: string;
}) => {
    const data = await getAppointmentHistoricalData(appointmentUuid);
    if (!data.success) {
        return (
            <div className="py-10 text-center">
                <p className="text-muted-foreground">Unable to load health history</p>
            </div>
        );
    }
    return (
        <Suspense fallback={<SkeletonCard />}>
            <AppointmentHistoricalDataCard data={data.data} petName={petName} />
        </Suspense>
    );
};

export default AppointmentHistoricalData;
