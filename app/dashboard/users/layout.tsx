import { ReactNode } from "react";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return (
      <div className="mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4 pl-2">Users</h1>
      {children}
    </div>
  );
}
