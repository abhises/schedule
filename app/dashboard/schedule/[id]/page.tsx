// app/dashboard/schedule/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Download, X } from "lucide-react";

import CalendarComponent, { CalendarEvent } from "@/components/Calendar";
import CustomButton from "@/components/ui/custom-button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { useUsers } from "@/context/useUsers";
import { blockedEmails } from "@/constants/blockuser";

type ScheduleEntry = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  userId: number;
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

type ScheduleBatch = {
  id: number;
  status: "DRAFTED" | "PUBLISHED";
  startDate: string;
  endDate: string;
  totalDays: number;
  createdAt: string;
  updatedAt: string;
  entries: ScheduleEntry[];
};

const USER_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"];

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { users, setUsers } = useUsers();
  const [batch, setBatch] = useState<ScheduleBatch | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | null>(null);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [publishDialog, setPublishDialog] = useState(false);
  const [deleteEntryDialog, setDeleteEntryDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<ScheduleEntry | null>(
    null
  );
  const [updatingEntry, setUpdatingEntry] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [addDialog, setAddDialog] = useState(false);
  const [addDate, setAddDate] = useState<Date | null>(null);
  const [addUserId, setAddUserId] = useState<number | null>(null);
  const [addStartTime, setAddStartTime] = useState("10:00");
  const [addEndTime, setAddEndTime] = useState("14:00");
  const [addingEntry, setAddingEntry] = useState(false);

  useEffect(() => {
    fetchBatchDetail();
  }, [id]);

  const fetchBatchDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schedules/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch batch details");
      }

      const data: ScheduleBatch = await response.json();
      setBatch(data);

      // Convert entries to calendar events
      const calendarEvents = data.entries.map((entry) => {
        const date = new Date(entry.date);
        const [startH, startM] = entry.startTime.split(":").map(Number);
        const [endH, endM] = entry.endTime.split(":").map(Number);

        const start = new Date(date);
        start.setHours(startH, startM, 0, 0);

        const end = new Date(date);
        end.setHours(endH, endM, 0, 0);

        return {
          id: `${entry.id}`,
          title: `${entry.user.firstName} ${entry.user.lastName}`,
          start,
          end,
          userId: entry.userId,
          user: `${entry.user.firstName} ${entry.user.lastName}`,
        };
      });

      setEvents(calendarEvents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch details");
    } finally {
      setLoading(false);
    }
  };

  const getUserColor = (userId: number) =>
    USER_COLORS[userId % USER_COLORS.length];

  const publishBatch = async () => {
    if (!batch) return;
    setLoading(true);
    setPublishDialog(false); // close dialog immediately

    try {
      const response = await fetch(`/api/schedules/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PUBLISHED",
          entries: batch.entries, // send all entries
        }),
      });

      if (!response.ok) throw new Error("Failed to publish batch");

      const updated = await response.json();
      setBatch(updated);
      router.push("/dashboard/schedule");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish batch");
    }
  };

  const deleteBatch = async () => {
    if (!batch) {
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/schedules/${batch.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete batch");
      }

      window.location.href = "/dashboard/schedule";
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete batch");
    }
  };

  const downloadCSV = () => {
    if (!batch) return;

    const headers = [
      "Date",
      "User Name",
      "Email",
      "Start Time",
      "End Time",
      "Total Hours",
    ];
    const rows = batch.entries.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      `${entry.user.firstName} ${entry.user.lastName}`,
      entry.user.email,
      entry.startTime,
      entry.endTime,
      entry.totalHours.toString(),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schedule-batch-${batch.id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const updateEntry = async () => {
  if (!editingEntry || !batch) return;

  // If entry has a negative ID (new entry not saved yet), just update front-end state
  if (editingEntry.id < 0) {
    setBatch((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.map((e) =>
          e.id === editingEntry.id
            ? { ...e, startTime: editStartTime, endTime: editEndTime, totalHours: (() => {
                const [sh, sm] = editStartTime.split(":").map(Number);
                const [eh, em] = editEndTime.split(":").map(Number);
                return Math.round(((eh + em/60) - (sh + sm/60)) * 100) / 100;
              })() }
            : e
        ),
      };
    });

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== String(editingEntry.id)) return event;

        const date = new Date(editingEntry.date);
        const [sh, sm] = editStartTime.split(":").map(Number);
        const [eh, em] = editEndTime.split(":").map(Number);

        const start = new Date(date); start.setHours(sh, sm, 0, 0);
        const end = new Date(date); end.setHours(eh, em, 0, 0);

        return { ...event, start, end };
      })
    );

    setEditDialog(false);
    setEditingEntry(null);
    return;
  }

  // ---------------- Existing entry ----------------
  try {
    setUpdatingEntry(true);
    const response = await fetch(
      `/api/schedules/${batch.id}/entries/${editingEntry.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: editStartTime, endTime: editEndTime }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to update entry");
    }

    const updatedEntry: ScheduleEntry = await response.json();

    setBatch((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        entries: prev.entries.map((e) =>
          e.id === updatedEntry.id ? updatedEntry : e
        ),
      };
    });

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== String(updatedEntry.id)) return event;

        const date = new Date(updatedEntry.date);
        const [sh, sm] = updatedEntry.startTime.split(":").map(Number);
        const [eh, em] = updatedEntry.endTime.split(":").map(Number);

        const start = new Date(date); start.setHours(sh, sm, 0, 0);
        const end = new Date(date); end.setHours(eh, em, 0, 0);

        return { ...event, start, end };
      })
    );

    setEditDialog(false);
    setEditingEntry(null);
  } catch (err) {
    alert(err instanceof Error ? err.message : "Update failed");
  } finally {
    setUpdatingEntry(false);
  }
};

 const deleteEntry = async () => {
  if (!batch || !entryToDelete) return;

  // If entry has no DB ID, just remove from front-end state
  if (entryToDelete.id < 0) {
    setBatch((prev) =>
      prev
        ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryToDelete.id) }
        : prev
    );

    setEvents((prev) =>
      prev.filter((e) => e.id !== String(entryToDelete.id))
    );

    setEntryToDelete(null);
    setDeleteEntryDialog(false);
    return;
  }

  // ---------------- Existing entry ----------------
  try {
    setDeletingEntry(true);
    setLoading(true);
    const response = await fetch(
      `/api/schedules/${batch.id}/entries/${entryToDelete.id}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Failed to delete entry");
    }

    setBatch((prev) =>
      prev
        ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryToDelete.id) }
        : prev
    );

    setEvents((prev) =>
      prev.filter((e) => e.id !== String(entryToDelete.id))
    );

    setEntryToDelete(null);
    setDeleteEntryDialog(false);
  } catch (err) {
    alert(err instanceof Error ? err.message : "Delete failed");
  } finally {
    setDeletingEntry(false);
    setLoading(false);
  }
};


  const handleSelectSlot = (slot: { start: Date }) => {
    if (batch?.status !== "DRAFTED") return;

    const date = new Date(slot.start);
    date.setHours(0, 0, 0, 0);

    setAddDate(date);
    setAddUserId(null);
    setAddStartTime("10:00");
    setAddEndTime("14:00");
    setAddDialog(true);
  };

  // console.log("users", users);

  const createEntry = () => {
    if (!batch || !addDate || !addUserId) return;

    const tempId = Date.now() * -1;
    const selectedUserId = Number(addUserId);

    const user = users.find((u) => u.id === Number(selectedUserId));
    if (!user) return;

    const newEntry: ScheduleEntry = {
      id: tempId,
      date: addDate.toISOString(),
      startTime: addStartTime,
      endTime: addEndTime,
      totalHours: (() => {
        const [sh, sm] = addStartTime.split(":").map(Number);
        const [eh, em] = addEndTime.split(":").map(Number);
        return eh + em / 60 - (sh + sm / 60);
      })(),
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        // role: user.role,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
    };

    setBatch((prev) =>
      prev ? { ...prev, entries: [...prev.entries, newEntry] } : prev
    );

    const date = new Date(addDate);
    const [sh, sm] = addStartTime.split(":").map(Number);
    const [eh, em] = addEndTime.split(":").map(Number);

    const start = new Date(date);
    start.setHours(sh, sm, 0, 0);

    const end = new Date(date);
    end.setHours(eh, em, 0, 0);

    setEvents((prev) => [
      ...prev,
      {
        id: String(tempId),
        title: `${user.firstName} ${user.lastName}`,
        start,
        end,
        userId: user.id,
        user: `${user.firstName} ${user.lastName}`,
      },
    ]);

    setAddDialog(false);
  };

   

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center  z-50">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!batch || error) {
    return (
      <div className="p-4">
        <Link href="/dashboard/schedule">
          <CustomButton>
            <span className="flex items-center gap-2">
              <ArrowLeft size={14} />
              Back
            </span>
          </CustomButton>
        </Link>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error || "Batch not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/schedule">
            <CustomButton>
              <span className="flex items-center gap-2">
                <ArrowLeft size={14} />
                Back
              </span>
            </CustomButton>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Batch #{batch.id}</h1>
            <p className="text-sm text-gray-600">
              {batch.totalDays} days •{" "}
              {new Date(batch.startDate).toLocaleDateString()} to{" "}
              {new Date(batch.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <CustomButton onClick={downloadCSV}>
            <span className="flex items-center gap-2">
              <Download size={14} />
              Export
            </span>
          </CustomButton>

          {batch.status === "DRAFTED" && (
            <CustomButton onClick={() => setPublishDialog(true)}>
              <span className="flex items-center gap-2">
                <Edit2 size={14} />
                Publish
              </span>
            </CustomButton>
          )}

          <button
            onClick={() => setDeleteDialog(true)}
            className="p-2 hover:bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-1"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* STATUS BADGE */}
      <div className="mb-6">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            batch.status === "PUBLISHED"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {batch.status}
        </span>
      </div>

      {/* CALENDAR */}
      <div className="mb-8 border rounded-lg overflow-hidden">
        <CalendarComponent
          events={events}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: getUserColor(event.userId),
              color: "white",
            },
          })}
        />
      </div>

      {/* ENTRIES TABLE */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            Entries ({batch.entries.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Hours
                </th>
                {batch.status === "DRAFTED" && (
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {batch.entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {entry.user.firstName} {entry.user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {entry.user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">{entry.startTime}</td>
                  <td className="px-6 py-4 text-sm">{entry.endTime}</td>
                  <td className="px-6 py-4 text-sm">{entry.totalHours}h</td>
                  {batch.status === "DRAFTED" && (
                    <td className="px-6 py-4 text-sm space-x-2 flex">
                      <button
                        onClick={() => {
                          setEditingEntry(entry);
                          setEditStartTime(entry.startTime);
                          setEditEndTime(entry.endTime);
                          setEditDialog(true);
                        }}
                        className="p-1 hover:bg-blue-100 rounded text-blue-600 cursor-pointer hover:-translate-y-2"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEntryToDelete(entry);
                          setDeleteEntryDialog(true);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this batch? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteBatch}
              className="bg-red-300 hover:bg-red-700 cursor-pointer hover:-translate-y-2"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* PUBLISH CONFIRMATION DIALOG */}
      <AlertDialog open={publishDialog} onOpenChange={setPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Batch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this batch?
              <br />
              <span className="text-sm text-gray-500">
                Once published, entries can no longer be edited.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end gap-2">
            <AlertDialogCancel className="cursor-pointer hover:-translate-y-2">
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={publishBatch}
              className="bg-blue-600 hover:bg-green-700 cursor-pointer hover:-translate-y-2"
            >
              Publish
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* EDIT TIME DIALOG */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time</DialogTitle>
          </DialogHeader>

          {editingEntry && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  {editingEntry.user.firstName} {editingEntry.user.lastName} -{" "}
                  {new Date(editingEntry.date).toLocaleDateString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-gray-600">Start Time</label>
                  <Input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">End Time</label>
                  <Input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </div>
              </div>

              <CustomButton onClick={updateEntry} disabled={updatingEntry}>
                {updatingEntry ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </CustomButton>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE ENTRY CONFIRMATION DIALOG */}
      <AlertDialog open={deleteEntryDialog} onOpenChange={setDeleteEntryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this entry?
              <br />
              <span className="text-sm text-gray-500">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end gap-2">
            <AlertDialogCancel
              className="cursor-pointer"
              disabled={deletingEntry}
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={deleteEntry}
              disabled={deletingEntry}
              className="bg-red-600 hover:bg-red-700 cursor-pointer flex items-center gap-2"
            >
              {deletingEntry ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Entry</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Date: {addDate?.toLocaleDateString()}
            </p>

            {/* USER SELECT (simple select for now) */}
            <select
              className="w-full border rounded px-3 py-2"
              value={addUserId ?? ""}
              onChange={(e) => setAddUserId(Number(e.target.value))}
            >
              <option value="">Select user</option>
              {users.filter((u) => !blockedEmails.includes(u.email))

                .filter((v, i, a) => a.findIndex((x) => x.id === v.id) === i)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Start Time</label>
                <Input
                  type="time"
                  value={addStartTime}
                  onChange={(e) => setAddStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm">End Time</label>
                <Input
                  type="time"
                  value={addEndTime}
                  onChange={(e) => setAddEndTime(e.target.value)}
                />
              </div>
            </div>

            <CustomButton onClick={createEntry} disabled={addingEntry}>
              {addingEntry ? "Adding..." : "Add Entry"}
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
