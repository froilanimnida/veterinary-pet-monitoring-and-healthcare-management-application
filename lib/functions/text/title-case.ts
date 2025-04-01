export const toTitleCase = (str?: string): string => {
    if (!str) return "";
    return str
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
