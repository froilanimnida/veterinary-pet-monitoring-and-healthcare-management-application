import { getAppointmentRecordedServices } from "@/actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Badge,
} from "@/components/ui";
import { format } from "date-fns";
import { Pill, Stethoscope, Syringe } from "lucide-react";
import { Suspense } from "react";
import { toTitleCase } from "@/lib";
import { DeleteRecordButton } from "./ongoing-record-delete-buttons";

async function RecordedServices({ appointmentUuid }: { appointmentUuid: string }) {
    const servicesResponse = await getAppointmentRecordedServices(appointmentUuid);

    if (!servicesResponse.success) {
        return (
            <div className="py-6 text-center">
                <p className="text-muted-foreground">Unable to load recorded services</p>
            </div>
        );
    }

    const { vaccinations, healthcareProcedures, prescriptions, appointment_id, petUuid } = servicesResponse.data;
    const hasRecordedServices = vaccinations.length > 0 || healthcareProcedures.length > 0 || prescriptions.length > 0;

    if (!hasRecordedServices) {
        return (
            <div className="py-6 text-center">
                <p className="text-muted-foreground">No services have been recorded for this appointment yet</p>
            </div>
        );
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "Not recorded";
        return format(new Date(date), "MMM d, yyyy");
    };

    return (
        <Tabs defaultValue="vaccinations" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="vaccinations" className="flex items-center gap-2">
                    <Syringe className="h-4 w-4" />
                    Vaccinations
                    {vaccinations.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {vaccinations.length}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="procedures" className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Procedures
                    {healthcareProcedures.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {healthcareProcedures.length}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                    <Pill className="h-4 w-4" />
                    Prescriptions
                    {prescriptions.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {prescriptions.length}
                        </Badge>
                    )}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="vaccinations">
                {vaccinations.length > 0 ? (
                    <div className="space-y-4">
                        {vaccinations.map((vax) => (
                            <Card key={vax.vaccination_id} className="overflow-hidden relative">
                                <DeleteRecordButton
                                    id={vax.vaccination_id}
                                    appointmentId={appointment_id}
                                    appointmentUuid={appointmentUuid}
                                    petUuid={petUuid}
                                    recordType="vaccination"
                                />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{vax.vaccine_name || "Unknown Vaccine"}</CardTitle>
                                    <CardDescription>
                                        Administered on {formatDate(vax.administered_date)}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {vax.next_due_date && (
                                        <p className="text-sm">
                                            <span className="font-medium">Next due:</span>{" "}
                                            {formatDate(vax.next_due_date)}
                                        </p>
                                    )}
                                    {vax.batch_number && (
                                        <p className="text-sm text-muted-foreground">Batch: {vax.batch_number}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-muted-foreground">No vaccinations recorded during this appointment</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="procedures">
                {healthcareProcedures.length > 0 ? (
                    <div className="space-y-4">
                        {healthcareProcedures.map((proc) => (
                            <Card key={proc.procedure_id} className="overflow-hidden relative">
                                <DeleteRecordButton
                                    id={proc.procedure_id}
                                    appointmentId={appointment_id}
                                    appointmentUuid={appointmentUuid}
                                    petUuid={petUuid}
                                    recordType="procedure"
                                />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        {toTitleCase(proc.procedure_type.replace(/_/g, " "))}
                                    </CardTitle>
                                    <CardDescription>Performed on {formatDate(proc.procedure_date)}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {(proc.product_used || proc.dosage) && (
                                        <div className="mb-2">
                                            {proc.product_used && (
                                                <p className="text-sm">
                                                    <span className="font-medium">Product:</span> {proc.product_used}
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
                                        <p className="text-sm mt-2">
                                            <span className="font-medium">Notes:</span> {proc.notes}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-muted-foreground">No procedures recorded during this appointment</p>
                    </div>
                )}
            </TabsContent>

            <TabsContent value="prescriptions">
                {prescriptions.length > 0 ? (
                    <div className="space-y-4">
                        {prescriptions.map((rx) => (
                            <Card key={rx.prescription_id} className="overflow-hidden relative">
                                <DeleteRecordButton
                                    id={rx.prescription_id}
                                    appointmentId={appointment_id}
                                    appointmentUuid={appointmentUuid}
                                    petUuid={petUuid}
                                    recordType="prescription"
                                />
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        {rx.medications?.name || "Prescription"}
                                    </CardTitle>
                                    <CardDescription>
                                        {rx.dosage} • {rx.frequency}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm">
                                            <span className="font-medium">Start date:</span> {formatDate(rx.start_date)}
                                        </p>
                                        <p className="text-sm">
                                            <span className="font-medium">End date:</span> {formatDate(rx.end_date)}
                                        </p>
                                        {rx.refills_remaining !== null && (
                                            <p className="text-sm">
                                                <span className="font-medium">Refills:</span> {rx.refills_remaining}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-6 text-center">
                        <p className="text-muted-foreground">No prescriptions recorded during this appointment</p>
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}

function SkeletonCard() {
    return (
        <Card>
            <CardHeader>
                <div className="w-3/4 h-5 bg-gray-200 animate-pulse rounded"></div>
                <div className="w-1/2 h-4 bg-gray-100 animate-pulse rounded mt-2"></div>
            </CardHeader>
            <CardContent>
                <div className="w-full h-24 bg-gray-100 animate-pulse rounded"></div>
            </CardContent>
        </Card>
    );
}

function CurrentAppointmentRecordedService({ appointmentUuid }: { appointmentUuid: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-semibold">Current Appointment Services</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Services recorded during this appointment session
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<SkeletonCard />}>
                    <RecordedServices appointmentUuid={appointmentUuid} />
                </Suspense>
            </CardContent>
        </Card>
    );
}

export default CurrentAppointmentRecordedService;
