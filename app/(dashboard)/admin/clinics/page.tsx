import { Suspense } from "react";
import { getClinics } from "@/actions";
import {
    SkeletonCard,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
    Button,
} from "@/components/ui";
import Link from "next/link";

const ClinicCardList = async () => {
    const clinics = await getClinics();
    const clinicsData = clinics.success ? (clinics.data?.clinics ?? []) : [];
    if (!clinicsData || clinicsData.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No clinics found</h3>
                <p className="text-muted-foreground">Add your first clinic to get started</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
            {clinicsData.map((clinic) => (
                <Card key={clinic.clinic_uuid}>
                    <CardHeader>
                        <CardTitle>{clinic.name}</CardTitle>
                        <CardDescription>{clinic.city}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Address: {clinic.address}</p>
                        <p>Contact: {clinic.phone_number}</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href={`/admin/clinics/${clinic.clinic_uuid}`}>View</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

const Clinics = () => {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Medicines</h1>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <ClinicCardList />
            </Suspense>
        </section>
    );
};

export default Clinics;
