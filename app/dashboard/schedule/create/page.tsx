"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown } from "lucide-react";
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

/* ---------------- TYPES ---------------- */

type User = {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
};

/* ---------------- PAGE ---------------- */

export default function CreateSchedulePage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<SlotInfo | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");

  /* ---------------- FETCH USERS ---------------- */

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  /* ---------------- SLOT CLICK ---------------- */

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlot(slotInfo);
    setSelectedUsers([]);
    setOpen(true);
  };

  /* ---------------- SAVE ---------------- */

  const handleSave = async () => {
    if (!slot || selectedUsers.length === 0) return;

    await fetch("/api/schedules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: slot.start,
        startTime,
        endTime,
        userIds: selectedUsers,
      }),
    });

    // Optimistic UI update
    setEvents((prev) => [
      ...prev,
      ...selectedUsers.map((userId) => {
        const user = users.find((u) => u.id === userId);

        const start = new Date(slot.start);
        const end = new Date(slot.start);

        const [sh, sm] = startTime.split(":");
        const [eh, em] = endTime.split(":");

        start.setHours(Number(sh), Number(sm));
        end.setHours(Number(eh), Number(em));

        return {
          id: `${Date.now()}-${userId}`,
          title: "Shift",
          user: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
          start,
          end,
        };
      }),
    ]);

    setOpen(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      {/* -------- BACK -------- */}
      <div className="p-4">
        <Link href="/dashboard/schedule">
          <CustomButton variant="primary">
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Back
            </span>
          </CustomButton>
        </Link>
      </div>

      {/* -------- CALENDAR -------- */}
      <CalendarComponent events={events} onSelectSlot={handleSelectSlot} />

      {/* -------- MODAL -------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
          </DialogHeader>

          {slot && (
            <div className="space-y-5">
              {/* Date */}
              <div className="text-sm text-muted-foreground">
                {slot.start.toDateString()}
              </div>

              {/* USERS DROPDOWN */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Users</label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      {selectedUsers.length > 0
                        ? `${selectedUsers.length} user(s) selected`
                        : "Select users"}
                      <ChevronDown size={16} />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 w-[300px]">
                    <Command>
                      <CommandInput placeholder="Search users..." />
                      <CommandEmpty>No users found</CommandEmpty>

                      <CommandGroup>
                        {users.map((u) => {
                          const selected = selectedUsers.includes(u.id);

                          return (
                            <CommandItem
                              key={u.id}
                              onSelect={() =>
                                setSelectedUsers((prev) =>
                                  selected
                                    ? prev.filter((id) => id !== u.id)
                                    : [...prev, u.id]
                                )
                              }
                              className="flex items-center gap-2"
                            >
                              <Check
                                size={16}
                                className={
                                  selected ? "opacity-100" : "opacity-0"
                                }
                              />
                              {u.firstName} {u.lastName}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* TIME */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Start Time</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm">End Time</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* SAVE */}
              <CustomButton onClick={handleSave}>
                Save Schedule
              </CustomButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
