import { ButtonHTMLAttributes } from "react";

// Reusable button component with multiple variants
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "gold" | "outline";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const base = "px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal text-white hover:bg-teal-600",
    secondary: "bg-navy text-white hover:bg-navy-400",
    gold: "bg-gold text-navy hover:bg-gold-400",
    outline: "border-2 border-navy text-navy hover:bg-navy hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-navy",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}