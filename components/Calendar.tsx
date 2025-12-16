"use client";

import { Calendar } from "react-big-calendar";
import { localizer } from "../utils/calendarLocalizer";
import "react-big-calendar/lib/css/react-big-calendar.css";

type CalendarEvent = {
  id: number;
  user: string;
  start: Date;
  end: Date;
};

type EventProps = {
  event: CalendarEvent;
};

const CustomEvent = ({ event }: EventProps) => {
  const start = event.start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const end = event.end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="text-xs leading-tight">
      <div className="font-semibold">{event.user}</div>
      <div className="text-[11px]">
        {start} – {end}
      </div>
      {/* <div>{event.title}</div> */}
    </div>
  );
};
const CalendarComponent = ({ events }: { events: CalendarEvent[] }) => {
  return (
    <div className="pl-4 h-screen w-6xl">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        dayPropGetter={() => {
          return {
            style: {
              cursor: "pointer",
              // backgroundColor: "#f3f4f6",
            },
          };
        }}
        components={{
          event: CustomEvent,
        }}
      />
    </div>
  );
};

export default CalendarComponent;
