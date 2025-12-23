import { ReactNode } from "react";


export default function ScheduleLayout({ children }: { children: ReactNode }) {
  return (
   <div className="mx-auto">

      {children}
    </div>
  );
}