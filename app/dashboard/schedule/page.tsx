"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Trash2, Plus } from "lucide-react";
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


const page = () => {
   const [batches, setBatches] = useState<ScheduleBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/schedules");

      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }

      const data = await response.json();
      setBatches(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  const deleteBatch = async (id: number) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;

    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete batch");
      }

      setBatches((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to delete batch"
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
     <div className="fixed inset-0 flex justify-center items-center  z-50">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }
  return (
    <div className="w-6xl">
       <div className="p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <Link href="/dashboard/schedule/create">
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

      {batches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No schedules created yet</p>
          <Link href="/dashboard/schedule/create">
            <CustomButton>Create Your First Schedule</CustomButton>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Entries
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">
                    #{batch.id}
                  </td>
                  <td className="px-6 py-4 text-sm">
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
                  <td className="px-6 py-4 text-sm">
                    {formatDate(batch.startDate)} to{" "}
                    {formatDate(batch.endDate)}
                  </td>
                  <td className="px-6 py-4 text-sm">{batch.totalDays}</td>
                  <td className="px-6 py-4 text-sm">{batch.entries.length}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(batch.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <Link
                      href={`/dashboard/schedule/${batch.id}`}
                    >
                      <button className="p-2 hover:bg-blue-100 rounded text-blue-600 cursor-pointer">
                        <Eye size={16} />
                      </button>
                    </Link>
                    <button
                      onClick={() => deleteBatch(batch.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  )
}

export default page