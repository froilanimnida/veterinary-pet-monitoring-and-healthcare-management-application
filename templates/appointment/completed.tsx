import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from "@react-email/components";

export interface AppointmentCompletedEmailProps {
    petName: string;
    ownerName: string;
    vetName: string;
    date: string;
    time: string;
    clinicName: string;
    clinicPhone: string;
    appointmentType: string;
    appointmentId: string;
    diagnosis?: string;
    followUpDate?: string;
    prescriptions?: { name: string; dosage: string; instructions: string }[];
    recommendations?: string;
}

export default function AppointmentCompleted({
    petName,
    ownerName,
    vetName,
    date,
    time,
    clinicName,
    clinicPhone,
    appointmentType,
    appointmentId,
    diagnosis,
    followUpDate,
    prescriptions,
    recommendations,
}: AppointmentCompletedEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2" style={styles.title}>
                            Appointment Completed
                        </Heading>

                        <Text style={styles.greeting}>Hello {ownerName},</Text>

                        <Text>
                            Thank you for bringing {petName} to see Dr. {vetName} at {clinicName}. This email provides a
                            summary of your completed appointment.
                        </Text>

                        <Section style={styles.details}>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Appointment ID:</span> #{appointmentId}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Appointment Type:</span> {appointmentType}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Date:</span> {date}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Time:</span> {time}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Veterinarian:</span> Dr. {vetName}
                            </Text>
                        </Section>

                        {diagnosis && (
                            <Section style={styles.diagnosisSection}>
                                <Heading as="h3" style={styles.sectionTitle}>
                                    Diagnosis
                                </Heading>
                                <Text>{diagnosis}</Text>
                            </Section>
                        )}

                        {prescriptions && prescriptions.length > 0 && (
                            <Section style={styles.prescriptionsSection}>
                                <Heading as="h3" style={styles.sectionTitle}>
                                    Prescriptions
                                </Heading>
                                {prescriptions.map((prescription, index) => (
                                    <div key={index} style={styles.prescriptionItem}>
                                        <Text style={styles.prescriptionName}>{prescription.name}</Text>
                                        <Text>
                                            <span style={styles.prescriptionLabel}>Dosage:</span> {prescription.dosage}
                                        </Text>
                                        <Text>
                                            <span style={styles.prescriptionLabel}>Instructions:</span>{" "}
                                            {prescription.instructions}
                                        </Text>
                                    </div>
                                ))}
                            </Section>
                        )}

                        {recommendations && (
                            <Section style={styles.recommendationsSection}>
                                <Heading as="h3" style={styles.sectionTitle}>
                                    Recommendations
                                </Heading>
                                <Text>{recommendations}</Text>
                            </Section>
                        )}

                        {followUpDate && (
                            <Section style={styles.followUpSection}>
                                <Heading as="h3" style={styles.followUpTitle}>
                                    Follow-Up Appointment
                                </Heading>
                                <Text>
                                    A follow-up appointment has been recommended for <strong>{followUpDate}</strong>.
                                    Please contact the clinic to schedule this appointment.
                                </Text>
                            </Section>
                        )}

                        <Text style={styles.questionsText}>
                            If you have any questions about today&apos;s appointment or your pet&apos;s care plan,
                            please contact us at {clinicPhone}.
                        </Text>

                        <Hr style={styles.divider} />

                        <Section style={styles.buttonContainer}>
                            <Button style={styles.button} href={`${process.env.FRONTEND_URL}/user/appointments`}>
                                View Appointment History
                            </Button>
                        </Section>
                    </Section>

                    <Text style={styles.footer}>
                        Thank you for choosing PawsitiveHealth for your pet&apos;s healthcare needs.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: {
        backgroundColor: "#f6f9fc",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
        margin: "0 auto",
        padding: "20px 0",
        width: "580px",
    },
    header: {
        color: "#3b82f6",
        fontSize: "24px",
        fontWeight: "bold",
        padding: "20px 0",
        textAlign: "center" as const,
    },
    section: {
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        padding: "20px",
    },
    title: {
        color: "#111827",
        fontSize: "24px",
        fontWeight: "bold",
        textAlign: "center" as const,
        margin: "0 0 24px",
    },
    greeting: {
        fontSize: "16px",
        lineHeight: "24px",
        margin: "16px 0",
    },
    details: {
        backgroundColor: "#f0f9ff",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #e0f2fe",
    },
    detailRow: {
        margin: "8px 0",
        fontSize: "15px",
    },
    detailLabel: {
        fontWeight: "bold",
        color: "#0369a1",
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        margin: "0 0 12px",
        color: "#1f2937",
    },
    diagnosisSection: {
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #e5e7eb",
    },
    prescriptionsSection: {
        backgroundColor: "#f0fdf4",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #dcfce7",
    },
    prescriptionItem: {
        marginBottom: "12px",
        paddingBottom: "12px",
        borderBottom: "1px dashed #d1d5db",
    },
    prescriptionName: {
        fontWeight: "bold",
        fontSize: "16px",
        color: "#15803d",
        marginBottom: "4px",
    },
    prescriptionLabel: {
        fontWeight: "bold",
        color: "#4b5563",
    },
    recommendationsSection: {
        backgroundColor: "#fffbeb",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #fef3c7",
    },
    followUpSection: {
        backgroundColor: "#f3f4f6",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderLeft: "4px solid #3b82f6",
    },
    followUpTitle: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "0 0 8px",
        color: "#1f2937",
    },
    questionsText: {
        fontSize: "15px",
        color: "#4b5563",
        margin: "16px 0",
    },
    divider: {
        borderColor: "#e5e7eb",
        margin: "20px 0",
    },
    buttonContainer: {
        textAlign: "center" as const,
        margin: "24px 0",
    },
    button: {
        backgroundColor: "#3b82f6",
        borderRadius: "6px",
        color: "#ffffff",
        display: "inline-block",
        fontSize: "14px",
        fontWeight: "bold",
        padding: "12px 24px",
        textDecoration: "none",
        textTransform: "uppercase" as const,
        letterSpacing: "0.025em",
    },
    footer: {
        color: "#6b7280",
        fontSize: "12px",
        marginTop: "20px",
        textAlign: "center" as const,
    },
};
