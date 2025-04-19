"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { Trash2 } from "lucide-react";
import { deleteVaccination, deleteHealthcareProcedure, deletePrescription } from "@/actions";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui";

type RecordType = "vaccination" | "procedure" | "prescription";

interface DeleteButtonProps {
    id: number;
    appointmentId: number;
    appointmentUuid: string;
    petUuid: string;
    recordType: RecordType;
}

export function DeleteRecordButton({ id, appointmentId, appointmentUuid, recordType, petUuid }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);

        startTransition(async () => {
            try {
                let result;

                switch (recordType) {
                    case "vaccination":
                        result = await deleteVaccination(id, appointmentId, appointmentUuid, petUuid);
                        break;
                    case "procedure":
                        result = await deleteHealthcareProcedure(id, appointmentUuid, petUuid);
                        break;
                    case "prescription":
                        result = await deletePrescription(id, appointmentUuid);
                        break;
                }

                if (result && !result.success) {
                    toast.error(`Failed to delete ${recordType}: ${result.error}`);
                } else {
                    toast.success(`${recordType.charAt(0).toUpperCase() + recordType.slice(1)} deleted successfully`);
                }
            } catch (error) {
                toast.error(`An error occurred while deleting the ${recordType}`);
                console.error(error);
            } finally {
                setIsDeleting(false);
            }
        });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                    disabled={isPending || isDeleting}
                    onClick={handleDelete}
                    title={`Delete ${recordType}`}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>{isDeleting ? `Deleting ${recordType}...` : `Delete ${recordType}`}</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default DeleteRecordButton;
