"use client";

import { Calendar, SlotInfo, Event } from "react-big-calendar";
import { localizer } from "../utils/calendarLocalizer";
import "react-big-calendar/lib/css/react-big-calendar.css";

export type CalendarEvent = {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  user?: string;
};

type CalendarComponentProps = {
  events: CalendarEvent[];
  onSelectSlot?: (slot: SlotInfo) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  defaultView?: "month" | "week" | "day" | "agenda";
};

const CalendarComponent = ({
  events,
  onSelectSlot,
  onSelectEvent,
  defaultView = "month",
}: CalendarComponentProps) => {
  return (
    <div className="h-screen w-6xl p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={defaultView}
        selectable={!!onSelectSlot}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        dayPropGetter={() => ({
          style: { cursor: "pointer" },
        })}
        components={{
          event: ({ event }: { event: CalendarEvent }) => (
            <div className="text-xs">
              {event.user && (
                <div className="font-semibold">{event.user}</div>
              )}
              <div>
                {event.start.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" - "}
                {event.end.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
};

export default CalendarComponent;
