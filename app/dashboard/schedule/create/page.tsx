// app/dashboard/schedule/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
} from "@/components/ui/command";

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

const USER_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"];

export default function CreateSchedulePage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [drafts, setDrafts] = useState<DraftSchedule[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [existingDates, setExistingDates] = useState<string[]>([]);

  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<SlotInfo | null>(null);

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDialog, setSuccessDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
    checkExistingSchedules();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const checkExistingSchedules = async () => {
    try {
      const response = await fetch("/api/schedules");
      if (response.ok) {
        const batches = await response.json();
        const dates = batches.flatMap((batch: any) =>
          batch.entries.map((entry: any) =>
            new Date(entry.date).toDateString()
          )
        );
        setExistingDates(dates);
      }
    } catch (err) {
      console.error("Failed to check existing schedules:", err);
    }
  };

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

  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past dates (before today)
    if (date < today) {
      return true;
    }

    // Check if date already has schedule entries
    if (existingDates.includes(date.toDateString())) {
      return true;
    }

    return false;
  };

  const handleSelectSlot = (info: SlotInfo) => {
    const slotDate = new Date(info.start);
    slotDate.setHours(0, 0, 0, 0);

    if (isDateDisabled(slotDate)) {
      if (slotDate < new Date()) {
        setError("Cannot create schedule for past dates");
      } else {
        setError("A schedule already exists for this date. Edit or delete the existing schedule.");
      }
      return;
    }

    setSlot(info);
    setSelectedUsers([]);
    setError(null);
    setOpen(true);
  };

  const handleAddDraft = () => {
    if (!slot || selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    const baseDate = new Date(slot.start);
    baseDate.setHours(0, 0, 0, 0);

    if (isDateDisabled(baseDate)) {
      setError("This date is no longer available");
      return;
    }

    const newDrafts: DraftSchedule[] = [];
    const newEvents: CalendarEvent[] = [];

    const validUsers = selectedUsers.filter(
      (uid) => !hasDuplicate(baseDate, uid)
    );

    if (validUsers.length === 0) {
      setError("All selected users already have a schedule for this date");
      return;
    }

    const draftId = crypto.randomUUID();

    newDrafts.push({
      id: draftId,
      date: baseDate,
      userIds: validUsers,
      startTime,
      endTime,
    });

    validUsers.forEach((uid) => {
      const user = users.find((u) => u.id === uid);
      const start = new Date(baseDate);
      const end = new Date(baseDate);

      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);

      start.setHours(sh, sm);
      end.setHours(eh, em);

      if (hasConflict(uid, start, end)) {
        setError(`Time conflict detected for ${user?.firstName}`);
        return;
      }

      newEvents.push({
        id: `${draftId}-${uid}`,
        title: `${user?.firstName} ${user?.lastName}`,
        userId: uid,
        user: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`,
        start,
        end,
      });
    });

    setDrafts((p) => [...p, ...newDrafts]);
    setEvents((p) => [...p, ...newEvents]);
    setOpen(false);
    setError(null);
  };

  const removeDraft = (id: string) => {
    setDrafts((p) => p.filter((d) => d.id !== id));
    setEvents((p) => p.filter((e) => !e.id.toString().startsWith(id)));
  };

  const updateEventTime = (eventId: string, start: Date, end: Date) => {
    setEvents((p) =>
      p.map((e) => (e.id === eventId ? { ...e, start, end } : e))
    );
  };

  const handlePublishAll = async () => {
    if (drafts.length === 0) {
      setError("No drafts to publish");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const entries = drafts.flatMap((draft) =>
        draft.userIds.map((userId) => {
          // Convert date to YYYY-MM-DD format without timezone conversion
          const year = draft.date.getFullYear();
          const month = String(draft.date.getMonth() + 1).padStart(2, "0");
          const day = String(draft.date.getDate()).padStart(2, "0");
          const dateString = `${year}-${month}-${day}`;

          return {
            date: dateString,
            startTime: draft.startTime,
            endTime: draft.endTime,
            userId,
          };
        })
      );

      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish schedules");
      }

      setDrafts([]);
      setEvents([]);
      setSuccessDialog(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to publish schedules"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 flex justify-between items-center">
        <Link href="/dashboard/schedule">
          <CustomButton>
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Back
            </span>
          </CustomButton>
        </Link>

        <CustomButton onClick={handlePublishAll} disabled={isLoading}>
          {isLoading ? "Drafting..." : `Draft All (${drafts.length})`}
        </CustomButton>
      </div>

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

      <div className="p-4 space-y-2">
        {drafts.map((d) => (
          <div
            key={d.id}
            className="border rounded-md p-2 flex justify-between text-sm"
          >
            <span>
              {d.date.toDateString()} · {d.startTime} – {d.endTime} ·{" "}
              {d.userIds.length} user(s)
            </span>
            <button onClick={() => removeDraft(d.id)}>
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {/* ADD SCHEDULE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full border px-3 py-2 flex justify-between rounded">
                  Select Users ({selectedUsers.length})
                  <ChevronDown size={14} />
                </button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search users..." />
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
              <div>
                <label className="text-sm text-gray-600">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <CustomButton onClick={handleAddDraft} disabled={isLoading}>
              Add to Draft
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* SUCCESS DIALOG */}
      <AlertDialog open={successDialog} onOpenChange={setSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Your schedules have been published successfully. You'll be redirected to the schedules page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <CustomButton
              onClick={() => {
                setSuccessDialog(false);
                router.push("/dashboard/schedule");
              }}
            >
              Go to Schedules
            </CustomButton>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ERROR DIALOG */}
      <AlertDialog open={!!error && !open} onOpenChange={() => setError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Dismiss</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}