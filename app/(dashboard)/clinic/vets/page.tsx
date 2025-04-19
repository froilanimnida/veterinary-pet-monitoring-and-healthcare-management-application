import { Suspense } from "react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    SkeletonCard,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Badge,
} from "@/components/ui";
import NewVeterinaryForm from "@/components/form/new-vet-form";
import type { Metadata } from "next";
import { getClinicVeterinarians } from "@/actions";
import Link from "next/link";
import { cn, toTitleCase } from "@/lib";
import type { users, veterinarians } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "PawsitiveHealth | Veterinarians",
    description: "PawsitiveHealth is a pet health care service.",
};

// Define the colors for different specializations
const specializationColors: Record<string, string> = {
    general_practice: "bg-blue-100 text-blue-800",
    surgery: "bg-purple-100 text-purple-800",
    dermatology: "bg-green-100 text-green-800",
    cardiology: "bg-red-100 text-red-800",
    neurology: "bg-yellow-100 text-yellow-800",
    oncology: "bg-pink-100 text-pink-800",
    dentistry: "bg-indigo-100 text-indigo-800",
    ophthalmology: "bg-teal-100 text-teal-800",
    exotic: "bg-amber-100 text-amber-800",
    emergency: "bg-rose-100 text-rose-800",
};

const VeterinaryCard = ({ veterinary }: { veterinary: veterinarians & { users: users | null } }) => (
    <Card key={veterinary.license_number}>
        <CardHeader>
            <CardTitle>
                {veterinary.users?.first_name} {veterinary.users?.last_name}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
                <Badge
                    className={cn(
                        "px-2 py-1 text-xs",
                        specializationColors[veterinary.specialization] || "bg-gray-100",
                    )}
                >
                    {toTitleCase(veterinary.specialization)}
                </Badge>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm">License: {veterinary.license_number}</p>
            <p className="text-sm mt-1">
                <span className="font-medium">Contact:</span> {veterinary.users?.email}
            </p>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href={`/clinic/vets/${veterinary.vet_uuid}`}>Manage</Link>
            </Button>
        </CardFooter>
    </Card>
);

const Veterinaries = async () => {
    const data = await getClinicVeterinarians();
    const veterinaries = data.success ? (data.data?.veterinarians ?? []) : [];

    if (!veterinaries || veterinaries.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-medium">No veterinarians found</h3>
                <p className="text-muted-foreground">Add your first veterinarian to get started</p>
            </div>
        );
    }

    const groupedVeterinarians = veterinaries.reduce(
        (acc, vet) => {
            const specialization = vet.specialization;
            if (!acc[specialization]) {
                acc[specialization] = [];
            }
            acc[specialization].push(vet);
            return acc;
        },
        {} as Record<string, typeof veterinaries>,
    );

    const specializations = Object.keys(groupedVeterinarians);

    const countBySpecialization = specializations.reduce(
        (acc, specialization) => {
            acc[specialization] = groupedVeterinarians[specialization].length;
            return acc;
        },
        {} as Record<string, number>,
    );

    const totalVeterinarians = veterinaries.length;

    return (
        <div className="w-full">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                    <TabsTrigger value="all" className="relative">
                        All Veterinarians
                        <Badge variant="secondary" className="ml-2">
                            {totalVeterinarians}
                        </Badge>
                    </TabsTrigger>

                    {specializations.map((specialization) => (
                        <TabsTrigger key={specialization} value={specialization} className="relative">
                            {toTitleCase(specialization)}
                            <Badge
                                variant="secondary"
                                className={cn("ml-2", specializationColors[specialization] || "bg-gray-100")}
                            >
                                {countBySpecialization[specialization]}
                            </Badge>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="all">
                    <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
                        {veterinaries.map((veterinary) => (
                            <VeterinaryCard key={veterinary.license_number} veterinary={veterinary} />
                        ))}
                    </div>
                </TabsContent>

                {specializations.map((specialization) => (
                    <TabsContent key={specialization} value={specialization}>
                        <div className="grid grid-cols-1 md:grid-cols-3 w-full lg:grid-cols-4 gap-4">
                            {groupedVeterinarians[specialization].map((veterinary) => (
                                <VeterinaryCard key={veterinary.license_number} veterinary={veterinary} />
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

const Veterinary = () => {
    return (
        <section className="p-4 w-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Veterinarians</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Add Veterinarian</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Veterinarian</DialogTitle>
                            <DialogDescription>
                                Please provide the details of the new veterinarian you want to add.
                            </DialogDescription>
                        </DialogHeader>
                        <NewVeterinaryForm />
                    </DialogContent>
                </Dialog>
            </div>
            <Suspense fallback={<SkeletonCard />}>
                <Veterinaries />
            </Suspense>
        </section>
    );
};

export default Veterinary;
