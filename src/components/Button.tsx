import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
    onClick: () => void;
    type?: "button" | "submit" | "reset";
    variant?: "primary" | "secondary";
    className?: string;
}

export const Button = ({children, onClick, type = "button", variant = "primary", className = ""}: Props) => {
    const baseClasses =
        "w-full cursor-pointer rounded-2xl border-4 border-(--border) px-6 py-3 text-xl font-black shadow-[4px_4px_0_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none";
    const variantClasses = {
        primary: "bg-(--coral) text-white",
        secondary: "text-(--ink) border-(--border) bg-(--accent)",
    };
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`;

    return (
        <button type={type} onClick={onClick} className={classes}>
            {children}
        </button>
    );
};
