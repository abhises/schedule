interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export default function Button({ variant = "primary", children }: ButtonProps) {
  const baseStyles =
    "px-6 py-2 rounded-lg font-medium text-white transition-all duration-300 cursor-pointer hover:-translate-y-2";

  const variants = {
    primary:
      `${baseStyles} bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600`,
    secondary:
      `${baseStyles} bg-gray-800 hover:bg-gray-900`,
  };

  return <button className={variants[variant]}>{children}</button>;
}
