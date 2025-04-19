import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr } from "@react-email/components";

export interface AppointmentCancelledEmailProps {
    petName: string;
    ownerName: string;
    vetName: string;
    date: string;
    time: string;
    clinicName: string;
    clinicPhone: string;
    appointmentType: string;
    appointmentId: string;
    cancellationReason?: string;
}

export default function AppointmentCancelled({
    petName,
    ownerName,
    vetName,
    date,
    time,
    clinicName,
    clinicPhone,
    appointmentType,
    appointmentId,
    cancellationReason,
}: AppointmentCancelledEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.header}>PawsitiveHealth</Heading>

                    <Section style={styles.section}>
                        <Heading as="h2" style={styles.title}>
                            Appointment Cancelled
                        </Heading>

                        <Text style={styles.greeting}>Hello {ownerName},</Text>

                        <Text>
                            This email confirms that your appointment for {petName} with Dr. {vetName}
                            has been <span style={styles.cancelled}>cancelled</span>.
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
                            <Hr style={styles.detailDivider} />
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Clinic:</span> {clinicName}
                            </Text>
                            <Text style={styles.detailRow}>
                                <span style={styles.detailLabel}>Phone:</span> {clinicPhone}
                            </Text>
                        </Section>

                        {cancellationReason && (
                            <Section style={styles.cancellationSection}>
                                <Heading as="h3" style={styles.cancellationTitle}>
                                    Cancellation Reason
                                </Heading>
                                <Text>{cancellationReason}</Text>
                            </Section>
                        )}

                        <Text style={styles.reschedulingText}>
                            If you&apos;d like to reschedule this appointment, please visit our website or call the
                            clinic directly at {clinicPhone}.
                        </Text>

                        <Hr style={styles.divider} />

                        <Section style={styles.buttonContainer}>
                            <Button style={styles.button} href={`${process.env.FRONTEND_URL}/user/appointments`}>
                                Book New Appointment
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
        backgroundColor: "#fef2f2",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #fee2e2",
    },
    detailRow: {
        margin: "8px 0",
        fontSize: "15px",
    },
    detailLabel: {
        fontWeight: "bold",
        color: "#b91c1c",
    },
    detailDivider: {
        borderColor: "#fee2e2",
        margin: "12px 0",
    },
    cancelled: {
        fontWeight: "bold",
        color: "#b91c1c",
    },
    cancellationSection: {
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        margin: "20px 0",
        padding: "16px",
        border: "1px solid #e5e7eb",
    },
    cancellationTitle: {
        fontSize: "16px",
        fontWeight: "bold",
        margin: "0 0 8px",
        color: "#4b5563",
    },
    reschedulingText: {
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
