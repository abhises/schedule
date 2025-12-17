"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, Trash2 } from "lucide-react";
import { SlotInfo } from "react-big-calendar";

import CalendarComponent, { CalendarEvent } from "@/components/Calendar";
import CustomButton from "@/components/ui/custom-button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from "@/components/ui/command";

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

type User = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

type DraftSchedule = {
  id: string;
  date: Date;
  userIds: number[];
  startTime: string;
  endTime: string;
};

/* ------------------------------------------------------------------ */
/* CONSTANTS */
/* ------------------------------------------------------------------ */

const USER_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"];

/* ------------------------------------------------------------------ */
/* PAGE */
/* ------------------------------------------------------------------ */

export default function CreateSchedulePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [drafts, setDrafts] = useState<DraftSchedule[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<SlotInfo | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");

  const [isRecurring, setIsRecurring] = useState(false);
  const [weekdays, setWeekdays] = useState<number[]>([]);

  /* ------------------------------------------------------------------ */
  /* FETCH USERS */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  /* ------------------------------------------------------------------ */
  /* HELPERS */
  /* ------------------------------------------------------------------ */

  const getUserColor = (userId: number) =>
    USER_COLORS[userId % USER_COLORS.length];

  const hasDuplicate = (date: Date, userId: number) =>
    drafts.some(
      (d) =>
        d.date.toDateString() === date.toDateString() &&
        d.userIds.includes(userId)
    );

  const hasConflict = (userId: number, start: Date, end: Date) =>
    events.some((e) => e.userId === userId && start < e.end && end > e.start);

  const generateRecurringDates = (
    baseDate: Date,
    days: number[],
    weeks = 4
  ) => {
    const result: Date[] = [];
    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      if (days.includes(d.getDay())) result.push(d);
    }
    return result;
  };

  /* ------------------------------------------------------------------ */
  /* SLOT CLICK */
  /* ------------------------------------------------------------------ */

  const handleSelectSlot = (info: SlotInfo) => {
    setSlot(info);
    setSelectedUsers([]);
    setIsRecurring(false);
    setWeekdays([]);
    setOpen(true);
  };

  /* ------------------------------------------------------------------ */
  /* ADD DRAFT */
  /* ------------------------------------------------------------------ */

  const handleAddDraft = () => {
    if (!slot || selectedUsers.length === 0) return;

    const baseDate = new Date(slot.start);
    baseDate.setHours(0, 0, 0, 0);

    const dates = isRecurring
      ? generateRecurringDates(baseDate, weekdays)
      : [baseDate];

    const newDrafts: DraftSchedule[] = [];
    const newEvents: CalendarEvent[] = [];

    dates.forEach((date) => {
      const validUsers = selectedUsers.filter(
        (uid) => !hasDuplicate(date, uid)
      );

      if (validUsers.length === 0) return;

      const draftId = crypto.randomUUID();

      newDrafts.push({
        id: draftId,
        date,
        userIds: validUsers,
        startTime,
        endTime,
      });

      validUsers.forEach((uid) => {
        const user = users.find((u) => u.id === uid);
        const start = new Date(date);
        const end = new Date(date);

        const [sh, sm] = startTime.split(":");
        const [eh, em] = endTime.split(":");

        start.setHours(+sh, +sm);
        end.setHours(+eh, +em);

        if (hasConflict(uid, start, end)) return;

        newEvents.push({
          id: `${draftId}-${uid}`,
          title: "Draft",
          userId: uid,
          user: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
          start,
          end,
        });
      });
    });

    setDrafts((p) => [...p, ...newDrafts]);
    setEvents((p) => [...p, ...newEvents]);
    setOpen(false);
  };

  /* ------------------------------------------------------------------ */
  /* REMOVE DRAFT */
  /* ------------------------------------------------------------------ */

  const removeDraft = (id: string) => {
    setDrafts((p) => p.filter((d) => d.id !== id));
    setEvents((p) => p.filter((e) => !e.id.toString().startsWith(id)));
  };

  /* ------------------------------------------------------------------ */
  /* DRAG / RESIZE */
  /* ------------------------------------------------------------------ */

  const updateEventTime = (eventId: string, start: Date, end: Date) => {
    setEvents((p) =>
      p.map((e) => (e.id === eventId ? { ...e, start, end } : e))
    );
  };

  /* ------------------------------------------------------------------ */
  /* SAVE ALL */
  /* ------------------------------------------------------------------ */

  const handlePublishAll = async () => {
    if (drafts.length === 0) return;

    await fetch("/api/schedules/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schedules: drafts }),
    });

    alert("Schedules published");
    setDrafts([]);
    setEvents([]);
  };

  /* ------------------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------------------ */

  return (
    <>
      {/* HEADER */}
      <div className="p-4 flex justify-between items-center">
        <Link href="/dashboard/schedule">
          <CustomButton>
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Back
            </span>
          </CustomButton>
        </Link>

        <CustomButton onClick={handlePublishAll}>
          Publish All ({drafts.length})
        </CustomButton>
      </div>

      {/* CALENDAR */}
      <CalendarComponent
        events={events}
        onSelectSlot={handleSelectSlot}
        onEventDrop={({ event, start, end }) =>
          updateEventTime(event.id as string, start, end)
        }
        onEventResize={({ event, start, end }) =>
          updateEventTime(event.id as string, start, end)
        }
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: getUserColor(event.userId),
            color: "white",
          },
        })}
      />

      {/* DRAFT LIST */}
      <div className="p-4 space-y-2">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="border rounded-md p-2 flex justify-between text-sm"
          >
            <span>
              {d.date.toDateString()} · {d.startTime} – {d.endTime}
            </span>
            <button onClick={() => removeDraft(d.id)}>
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full border px-3 py-2 flex justify-between">
                  Select Users
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput />
                  <CommandGroup>
                    {users.map((u) => {
                      const selected = selectedUsers.includes(u.id);
                      return (
                        <CommandItem
                          key={u.id}
                          onSelect={() =>
                            setSelectedUsers((p) =>
                              selected
                                ? p.filter((id) => id !== u.id)
                                : [...p, u.id]
                            )
                          }
                        >
                          <Check
                            size={14}
                            className={selected ? "opacity-100" : "opacity-0"}
                          />
                          {u.firstName} {u.lastName}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <CustomButton onClick={handleAddDraft}>Add to Draft</CustomButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
