import { ReactNode } from "react";

interface ResponsiveContainerProps {
    children: ReactNode;
    className?: string;
}

const ResponsiveContainer = ({ children, className = "" }: ResponsiveContainerProps) => {
    return <div className={`w-full max-w-7xl min-h-screen mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
};

export default ResponsiveContainer;
