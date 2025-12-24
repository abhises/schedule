"use client";

import { Calendar, SlotInfo, Event, EventPropGetter } from "react-big-calendar";
import { localizer } from "../utils/calendarLocalizer";
import "react-big-calendar/lib/css/react-big-calendar.css";

export type CalendarEvent = {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  userId: number; // ✅ REQUIRED
  user?: string;
};

type CalendarComponentProps = {
  events: CalendarEvent[];
  min?: Date;
  max?: Date;
  onSelectSlot?: (slot: SlotInfo) => void;
  onSelectEvent?: (event: CalendarEvent) => void;
  defaultView?: "month" | "week" | "day" | "agenda";
  onEventDrop?: ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => void;

  onEventResize?: ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => void;

  eventPropGetter?: EventPropGetter<CalendarEvent>;
};

const CalendarComponent = ({
  events,
  onSelectSlot,
  onSelectEvent,
  onEventDrop,
  onEventResize,
  eventPropGetter,
  min,
  max,
  defaultView = "month",
}: CalendarComponentProps) => {
  return (
    <div className="h-[70vh] sm:h-[80vh] w-full min-w-[320px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        // views={["month", "week", "day"]}
        defaultView={defaultView}
        min={min}
        max={max}
        selectable={!!onSelectSlot}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        dayPropGetter={() => ({
          style: { cursor: "pointer" },
        })}
        components={{
          event: ({ event }: { event: CalendarEvent }) => (
            <div className="text-xs">
              {event.user && <div className="font-semibold">{event.user}</div>}
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
