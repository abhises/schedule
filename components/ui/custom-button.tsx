import React from "react";

interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

export default function CustomButton({
  variant = "primary",
  children,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 cursor-pointer hover:-translate-y-2";

  const variants = {
    primary:
      `${baseStyles} bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600`,
    secondary:
      `${baseStyles} bg-gray-800 hover:bg-gray-900`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed hover:translate-y-0" : ""
      }`}
    >
      {children}
    </button>
  );
}
