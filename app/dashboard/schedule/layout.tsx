import { ReactNode } from "react";

export default function ScheduleLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-4 pl-2">Schedule</h1>
      {children}
    </section>
  );
}
