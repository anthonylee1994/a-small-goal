import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
    onClick: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "md" | "sm";
    disabled?: boolean;
    className?: string;
}

export const Button = ({children, onClick, type = "button", variant = "primary", size = "md", disabled = false, className = ""}: Props) => {
    const baseClasses =
        "inline-flex items-center justify-center border-4 border-(--border) font-black shadow-[4px_4px_0_var(--border)] transition-[transform,box-shadow] active:enabled:translate-x-0.5 active:enabled:translate-y-0.5 active:enabled:shadow-none disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none";
    const sizeClasses = {
        md: "w-full min-h-12 rounded-2xl px-5 py-3 text-base",
        sm: "min-h-10 rounded-xl px-3 py-2 text-sm",
    };
    const variantClasses = {
        primary: "bg-(--coral) text-white",
        secondary: "bg-(--accent) text-(--ink)",
        danger: "bg-(--danger) text-white",
        ghost: "bg-white text-(--ink)",
    };
    const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={classes}>
            {children}
        </button>
    );
};
