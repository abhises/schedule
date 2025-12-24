import { ReactNode } from "react";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
      <div className="mx-auto p-4">
      {children}
    </div>
  );
}
