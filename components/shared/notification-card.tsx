"use client";
import { notifications } from "@prisma/client";
import { formatDistanceToNow, isAfter } from "date-fns";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Badge,
} from "@/components/ui";
import {
    Bell,
    Calendar,
    MessageCircle,
    Pill,
    Shield,
    Stethoscope,
    Syringe,
    AlertCircle,
    AlertTriangle,
    ExternalLink,
    Clock,
} from "lucide-react";
import { markNotificationAsRead } from "@/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface NotificationCardProps {
    notification: notifications & {
        pets?: {
            name: string;
            profile_picture_url: string | null;
            pet_uuid: string;
        } | null;
        appointments?: {
            appointment_uuid: string;
            appointment_date: Date;
        } | null;
        forum_posts?: {
            post_uuid: string;
            title: string;
        } | null;
    };
}

// Helper function to get icon based on notification type
function getNotificationIcon(type: string) {
    if (type.includes("appointment")) return Calendar;
    if (type.includes("medication")) return Pill;
    if (type.includes("vaccine")) return Syringe;
    if (type.includes("health")) return Stethoscope;
    if (type.includes("message") || type.includes("forum")) return MessageCircle;
    if (type.includes("security")) return Shield;
    return Bell;
}

// Helper function to get notification color based on type
function getNotificationColor(type: string): string {
    if (type.includes("appointment")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300";
    if (type.includes("medication")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300";
    if (type.includes("vaccine")) return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300";
    if (type.includes("health_alert")) return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300";
    if (type.includes("health")) return "bg-teal-100 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300";
    if (type.includes("message") || type.includes("forum"))
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300";
    if (type.includes("security")) return "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

// Helper function to get priority class
function getPriorityClass(priority: string): string {
    switch (priority) {
        case "urgent":
            return "border-l-4 border-red-500";
        case "high":
            return "border-l-4 border-orange-500";
        case "low":
            return "";
        default:
            return "";
    }
}

// Helper function to get border color for unread notifications
function getBorderColor(isRead: boolean | null, type: string, priority: string): string {
    if (priority === "urgent" || priority === "high") {
        return getPriorityClass(priority);
    }

    if (isRead) return "";

    if (type.includes("health_alert")) return "border-l-4 border-red-500";
    if (type.includes("appointment")) return "border-l-4 border-blue-500";
    if (type.includes("medication")) return "border-l-4 border-purple-500";
    if (type.includes("vaccine")) return "border-l-4 border-green-500";

    return "border-l-4 border-primary";
}

// Helper function to format notification type
function formatNotificationType(type: string): string {
    return type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function NotificationCard({ notification }: NotificationCardProps) {
    const router = useRouter();
    const Icon = getNotificationIcon(notification.type);
    const colorClass = getNotificationColor(notification.type);
    const borderClass = getBorderColor(notification.is_read, notification.type, notification.priority);
    const formattedDate = notification.created_at
        ? formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })
        : "recently";

    // Check expiration
    const hasExpiration = notification.expires_at !== null;
    const isExpired = hasExpiration && !isAfter(new Date(notification.expires_at!), new Date());

    const handleMarkAsRead = async () => {
        if (!notification.is_read) {
            try {
                await markNotificationAsRead(notification.notification_uuid);
                router.refresh();
            } catch {
                toast.error("Failed to mark notification as read");
            }
        }
    };

    // Function to render relationship badges
    const renderRelationshipBadges = () => {
        const badges = [];

        if (notification.pet_id && notification.pets) {
            badges.push(
                <Badge key="pet" variant="outline" className="flex items-center gap-1 text-[10px]">
                    <Avatar className="h-4 w-4 mr-1">
                        <AvatarImage src={notification.pets.profile_picture_url || undefined} />
                        <AvatarFallback className="text-[8px]">
                            {notification.pets.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    {notification.pets.name}
                </Badge>,
            );
        }

        if (notification.appointment_id && notification.appointments) {
            badges.push(
                <Badge key="appt" variant="outline" className="flex items-center gap-1 text-[10px]">
                    <Calendar className="h-3 w-3" />
                    Appointment
                </Badge>,
            );
        }

        if (notification.forum_post_id && notification.forum_posts) {
            badges.push(
                <Badge key="post" variant="outline" className="flex items-center gap-1 text-[10px]">
                    <MessageCircle className="h-3 w-3" />
                    Forum Post
                </Badge>,
            );
        }

        return badges.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-2">
                {badges}

                {hasExpiration && (
                    <Badge
                        variant={isExpired ? "secondary" : "outline"}
                        className="flex items-center gap-1 text-[10px]"
                    >
                        <Clock className="h-3 w-3" />
                        {isExpired ? "Expired" : "Expires soon"}
                    </Badge>
                )}
            </div>
        ) : null;
    };

    // Get action URL or construct from relationships
    const getActionUrl = () => {
        if (notification.action_url) {
            return notification.action_url;
        }

        if (notification.appointment_id && notification.appointments) {
            return `/user/appointments/${notification.appointments.appointment_uuid}`;
        }

        if (notification.pet_id && notification.pets) {
            return `/user/pets/${notification.pets.pet_uuid}`;
        }

        if (notification.forum_post_id && notification.forum_posts) {
            return `/post/${notification.forum_posts.post_uuid}`;
        }

        return `/user/notification/${notification.notification_uuid}`;
    };

    // Priority indicator
    const renderPriorityIndicator = () => {
        if (notification.priority === "urgent") {
            return (
                <Badge variant="destructive" className="ml-2 flex items-center gap-1 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    Urgent
                </Badge>
            );
        }

        if (notification.priority === "high") {
            return (
                <Badge variant="destructive" className="ml-2 flex items-center gap-1 text-xs">
                    <AlertTriangle className="h-3 w-3" />
                    High
                </Badge>
            );
        }

        return null;
    };

    return (
        <Card className={`mb-4 transition-all hover:shadow-md ${borderClass}`} onClick={handleMarkAsRead}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${colorClass}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-medium flex items-center">
                                {notification.title}
                                {!notification.is_read && (
                                    <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-primary"></span>
                                )}
                                {renderPriorityIndicator()}
                            </CardTitle>
                            <CardDescription className="text-xs">{formattedDate}</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                        {formatNotificationType(notification.type)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-sm">{notification.content}</p>
                {renderRelationshipBadges()}
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
                <Link
                    href={`/user/notification/${notification.notification_uuid}`}
                    className="w-full"
                    onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
                >
                    <Button variant="ghost" size="sm" className="text-xs justify-start p-0 h-8">
                        View details →
                    </Button>
                </Link>

                {notification.action_url && (
                    <Link
                        href={getActionUrl()}
                        className="ml-auto"
                        onClick={(e) => e.stopPropagation()} // Prevent triggering the parent onClick
                    >
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Action
                        </Button>
                    </Link>
                )}
            </CardFooter>
        </Card>
    );
}
