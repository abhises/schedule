"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash2, Plus } from "lucide-react";
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
import { useAuth } from "@clerk/nextjs";

type ScheduleEntry = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  userId: number;
};

type ScheduleBatch = {
  id: number;
  status: "DRAFTED" | "PUBLISHED";
  startDate: string;
  endDate: string;
  totalDays: number;
  createdAt: string;
  entries: ScheduleEntry[];
};

const Page = () => {
  const [batches, setBatches] = useState<ScheduleBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { has } = useAuth();
  const isPaidUser = has && has({ plan: "basic" });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/schedules");
      if (!res.ok) throw new Error("Failed to fetch schedules");
      setBatches(await res.json());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch schedules"
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async () => {
    if (!selectedBatchId) return;

    try {
      setDeleting(true);
      setLoading(true);
      await fetch(`/api/schedules/${selectedBatchId}`, { method: "DELETE" });
      setBatches((prev) => prev.filter((b) => b.id !== selectedBatchId));
      setDeleteDialog(false);
      setSelectedBatchId(null);
    } catch {
      alert("Failed to delete batch");
    } finally {
      setDeleting(false);
      setLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-3 sm:px-4">
      <div className="p-4">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold">Schedules</h1>

          <Link
            href={
              isPaidUser ? "/dashboard/schedule/create" : "/dashboard/price"
            }
          >
            <CustomButton>
              <span className="flex items-center gap-2">
                <Plus size={16} />
                Create Schedule
              </span>
            </CustomButton>
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden sm:block border rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "#",
                  "Status",
                  "Date Range",
                  "Days",
                  "Entries",
                  "Created",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {batches.map((batch, index) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm">#{index + 1}</td>
                  <td className="px-6 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        batch.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
                  </td>
                  <td className="px-6 py-3 text-sm">{batch.totalDays}</td>
                  <td className="px-6 py-3 text-sm">{batch.entries.length}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {formatDate(batch.createdAt)}
                  </td>
                  <td className="px-6 py-3 flex gap-2">
                    <Link href={`/dashboard/schedule/${batch.id}`}>
                      <button className="p-2 hover:bg-blue-100 rounded text-blue-600 cursor-pointer hover:-translate-y-2">
                        <Eye size={16} />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        setDeleteDialog(true);
                      }}
                      className="p-2 hover:bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="sm:hidden space-y-3">
          {batches.map((batch, index) => (
            <div
              key={batch.id}
              className="border rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">
                  Batch #{index + 1}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    batch.status === "PUBLISHED"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {batch.status}
                </span>
              </div>

              <p className="text-xs text-gray-600">
                {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
              </p>

              <div className="flex gap-4 text-xs text-gray-500">
                <span>Days: {batch.totalDays}</span>
                <span>Entries: {batch.entries.length}</span>
              </div>

              <div className="flex items-center gap-3 mt-2">
                <Link href={`/dashboard/schedule/${batch.id}`}>
                  <button className="p-2 bg-blue-100 rounded text-blue-600 cursor-pointer hover:-translate-y-2">
                    <Eye size={16} />
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setSelectedBatchId(batch.id);
                    setDeleteDialog(true);
                  }}
                  className="p-2 bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ================= DELETE DIALOG ================= */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Schedule Batch</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this schedule batch? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex justify-end gap-2">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteBatch}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Spinner className="h-4 w-4" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Page;
