// app/dashboard/schedule/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit2, Trash2, Download } from "lucide-react";

import CalendarComponent, { CalendarEvent } from "@/components/Calendar";
import CustomButton from "@/components/ui/custom-button";
import { Spinner } from "@/components/ui/spinner";

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
  const id = params.id as string;

  const [batch, setBatch] = useState<ScheduleBatch | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const response = await fetch(`/api/schedules/${batch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PUBLISHED" }),
      });

      if (!response.ok) {
        throw new Error("Failed to publish batch");
      }

      const updated = await response.json();
      setBatch(updated);
      alert("Batch published successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to publish batch");
    }
  };

  const deleteBatch = async () => {
    if (!batch || !confirm("Are you sure you want to delete this batch?")) {
      return;
    }

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
            <CustomButton onClick={publishBatch}>
              <span className="flex items-center gap-2">
                <Edit2 size={14} />
                Publish
              </span>
            </CustomButton>
          )}

          <button
            onClick={deleteBatch}
            className="p-2 hover:bg-red-100 rounded text-red-600"
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
          <h2 className="text-lg font-semibold">Entries ({batch.entries.length})</h2>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}