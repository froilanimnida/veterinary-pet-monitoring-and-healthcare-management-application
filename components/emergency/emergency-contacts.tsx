"use client";

import { Phone, AlertCircle, InfoIcon } from "lucide-react";

interface EmergencyContactItem {
    name: string;
    description: string;
    phoneNumber: string;
    isEmergency?: boolean;
}

const emergencyContacts: EmergencyContactItem[] = [
    {
        name: "Animal Poison Control Hotline",
        description: "24/7 emergency poison information for pets",
        phoneNumber: "1-888-426-4435",
        isEmergency: true,
    },
    {
        name: "Pet Emergency Helpline",
        description: "For urgent animal emergencies and advice",
        phoneNumber: "1-844-242-3649",
        isEmergency: true,
    },
    {
        name: "ASPCA Animal Poison Control",
        description: "Toxicology experts for animal poison emergencies",
        phoneNumber: "1-800-548-2423",
        isEmergency: true,
    },
    {
        name: "Local Animal Control",
        description: "For stray or dangerous animals",
        phoneNumber: "Check local listings",
    },
    {
        name: "Wildlife Rescue",
        description: "For injured wildlife emergencies",
        phoneNumber: "Contact local wildlife authority",
    },
];

const EmergencyContacts = () => {
    return (
        <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800">Critical Emergency?</h3>
                        <p className="text-sm text-red-700">
                            Don&apos;t delay! Go to your nearest emergency veterinary clinic immediately. Call ahead if
                            possible to let them know you&apos;re coming.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                            contact.isEmergency ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                        }`}
                    >
                        <div className="flex items-start">
                            <Phone
                                className={`h-5 w-5 mr-3 mt-0.5 ${
                                    contact.isEmergency ? "text-red-600" : "text-gray-600"
                                }`}
                            />
                            <div>
                                <h4 className={`font-medium ${contact.isEmergency ? "text-red-800" : "text-gray-900"}`}>
                                    {contact.name}
                                </h4>
                                <p className="text-sm text-gray-600">{contact.description}</p>
                                <a
                                    href={contact.phoneNumber.startsWith("1-") ? `tel:${contact.phoneNumber}` : "#"}
                                    className={`mt-1 font-medium text-sm inline-block ${
                                        contact.phoneNumber.startsWith("1-")
                                            ? contact.isEmergency
                                                ? "text-red-600 hover:text-red-800"
                                                : "text-primary hover:text-primary/80"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {contact.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                    <InfoIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-800">Good To Know</h3>
                        <p className="text-sm text-blue-700">
                            Always have your regular vet&apos;s contact information accessible and consider saving
                            emergency clinic contacts in your phone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;
