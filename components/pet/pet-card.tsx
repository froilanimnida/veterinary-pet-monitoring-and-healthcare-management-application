"use client";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Avatar,
    AvatarImage,
    AvatarFallback,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui";
import { FileUpload } from "@/components/ui/file-upload";
import { Camera, Loader2, Venus, Mars, VenusAndMars } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { calculateAge, toTitleCase } from "@/lib";
import { updatePetProfileImage } from "@/lib/functions/upload/update-pet-profile-image";
import type { Modify } from "@/types";
import { pet_sex_type, type pets } from "@prisma/client";

export default function PetCard({ pet }: { pet: Modify<pets, { weight_kg: string }> }) {
    const [isHovering, setIsHovering] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showImageDialog, setShowImageDialog] = useState(false);
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(pet.profile_picture_url);
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const handleImageClick = () => {
        setShowImageDialog(true);
    };

    const handleFileChange = (file: File | null) => {
        setProfileImage(file);
    };

    const handleImageUpdate = async () => {
        if (!profileImage) {
            setShowImageDialog(false);
            return;
        }

        setIsUploading(true);
        try {
            // Use the new comprehensive function that handles both upload and DB update
            const result = await updatePetProfileImage(pet.pet_id, pet.pet_uuid, profileImage);

            if (result.success) {
                toast.success("Pet profile picture updated successfully");
                // Update the image URL from the result
                if (result.data?.imageUrl) {
                    setImageUrl(result.data.imageUrl);
                }
            } else {
                toast.error(result.error || "Failed to update pet profile picture");
            }
        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            setShowImageDialog(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!pet.profile_picture_url) {
            setShowImageDialog(false);
            return;
        }

        setIsUploading(true);
        try {
            // Use null to indicate image removal
            const result = await updatePetProfileImage(pet.pet_id, pet.pet_uuid, null);

            if (result.success) {
                toast.success("Profile picture removed");
                setImageUrl(null);
            } else {
                toast.error(result.error || "Failed to remove profile picture");
            }
        } catch {
            toast.error("Failed to remove image");
        } finally {
            setIsUploading(false);
            setShowImageDialog(false);
        }
    };

    const getInitials = (name: string) => {
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <>
            <Card className="h-full flex flex-col">
                <div
                    className="relative w-full flex justify-center pt-6"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Avatar className="h-24 w-24 cursor-pointer" onClick={handleImageClick}>
                        {imageUrl ? (
                            <AvatarImage src={imageUrl} alt={pet.name} />
                        ) : (
                            <AvatarFallback className="text-3xl bg-primary/10">{getInitials(pet.name)}</AvatarFallback>
                        )}
                    </Avatar>

                    {isHovering && (
                        <div
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-black/30 rounded-full h-24 w-24 cursor-pointer"
                            onClick={handleImageClick}
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    )}
                </div>

                <CardHeader>
                    <div>
                        <CardTitle className="text-center">{toTitleCase(pet.name)}</CardTitle>
                        <CardDescription className="text-center">{toTitleCase(pet.breed)}</CardDescription>
                        <div className="flex justify-center mt-1">
                            {pet.sex === "male" && <Mars className="h-5 w-5 text-blue-500" />}
                            {pet.sex === "female" && <Venus className="h-5 w-5 text-pink-500" />}
                            {(!pet.sex || pet.sex === pet_sex_type.prefer_not_to_say) && (
                                <VenusAndMars className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-grow">
                    <div className="space-y-2">
                        <p className="text-sm">
                            <span className="font-medium">Species:</span> {toTitleCase(pet.species)}
                        </p>
                        {pet.date_of_birth && (
                            <p className="text-sm">
                                <span className="font-medium">Age:</span>{" "}
                                {String(calculateAge(new Date(pet.date_of_birth), "full"))}
                            </p>
                        )}
                        <p className="text-sm">
                            <span className="font-medium">Weight:</span> {pet.weight_kg} kg
                        </p>
                    </div>
                </CardContent>

                <CardFooter>
                    <Link href={`/user/pets/${pet.pet_uuid}`} className="w-full">
                        <Button className="w-full">View Details</Button>
                    </Link>
                </CardFooter>
            </Card>

            <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update Pet Profile Picture</DialogTitle>
                        <DialogDescription>Upload a new profile picture for {toTitleCase(pet.name)}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <FileUpload
                            onFileChange={handleFileChange}
                            currentImageUrl={imageUrl || null}
                            label={`Upload a picture of ${pet.name}`}
                        />
                    </div>

                    <div className="flex justify-between gap-3">
                        {/* Add Remove button if there's a current image */}
                        {imageUrl && (
                            <Button variant="destructive" onClick={handleRemoveImage} disabled={isUploading}>
                                Remove Image
                            </Button>
                        )}

                        <div className="flex gap-3 ml-auto">
                            <Button variant="outline" onClick={() => setShowImageDialog(false)} disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button onClick={handleImageUpdate} disabled={isUploading || !profileImage}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
