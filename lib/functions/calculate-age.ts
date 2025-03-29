/**
 * Calculate age from a date of birth with detailed breakdown
 * @param dateOfBirth The date of birth
 * @param format Whether to return a formatted string or the raw values
 * @returns Either a string with formatted age or an object with years, months, and days
 */
export const calculateAge = (dateOfBirth: Date, format: "full" | "years" | "object" = "years") => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);

    // Basic year calculation (for backward compatibility)
    let years = today.getFullYear() - birthDate.getFullYear();

    // Adjust year if we haven't reached the birth month/day yet this year
    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
        years--;
    }

    // Return just years if that's all we need
    if (format === "years") {
        return years;
    }

    // Calculate months and days for detailed breakdown
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust for negative days (borrowing from months)
    if (days < 0) {
        // Get days in the previous month
        const daysInPreviousMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += daysInPreviousMonth;
        months--;
    }

    // Adjust for negative months (borrowing from years)
    if (months < 0) {
        months += 12;
        years--;
    }

    // Return object with all components if requested
    if (format === "object") {
        return { years, months, days };
    }

    // Format the age as a string
    const parts: string[] = [];

    if (years > 0) {
        parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    }

    if (months > 0) {
        parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    }

    if (days > 0 || parts.length === 0) {
        parts.push(`${days} ${days === 1 ? "day" : "days"}`);
    }

    return parts.join(", ");
};
