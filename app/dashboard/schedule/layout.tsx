import { ReactNode } from "react";


export default function ScheduleLayout({ children }: { children: ReactNode }) {
  return (
    <section>
      {children}
    </section>
  );
}