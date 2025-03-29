import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: LucideIcon;
    iconClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, icon: Icon, iconClassName, ...props }, ref) => {
        return (
            <div className="relative flex w-full items-center">
                {Icon && (
                    <div className="absolute left-3 flex items-center pointer-events-none">
                        <Icon className={cn("h-4 w-4 text-muted-foreground", iconClassName)} aria-hidden="true" />
                    </div>
                )}
                <input
                    type={type}
                    ref={ref}
                    data-slot="input"
                    className={cn(
                        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed",
                        Icon && "pl-10",
                        className,
                    )}
                    {...props}
                />
            </div>
        );
    },
);

Input.displayName = "Input";

export { Input };
