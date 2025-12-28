"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@clerk/nextjs";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type User = {
  id: number;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  role: string;
  createdAt: string;
};
const blockedEmails = ["abhisespoudyal@gmail.com", "teamplanteamplan@gmail.com"];

export default function Page() {
  const { user } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const ROLES = ["PENDING", "USER", "ADMIN"] as const;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const isAdmin =
    user &&
    users.find((u) => u.email === user.primaryEmailAddress?.emailAddress)
      ?.role === "ADMIN";

  const confirmDelete = (id: number) => {
    setSelectedUserId(id);
    setDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;

    setDeleting(true);
    setDeleteLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUserId }),
      });

      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
        setDeleteDialog(false);
        setSelectedUserId(null);
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    } finally {
      setDeleting(false);
      setDeleteLoading(false);
    }
  };

  const updateRole = async (id: number, role: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });

      const data = await res.json();

      if (data.success) {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      } else {
        alert(data.error || "Failed to update role");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  };

  if (loading || deleteLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-2 sm:px-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Users</h1>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden sm:block border rounded-lg overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 border-b">
            <tr>
              {[
                "#",
                "Email",
                "Name",
                "Avatar",
                "Role",
                "Created",
                "Actions",
                "Change Role",
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {users
              .filter((user) => !blockedEmails.includes(user.email))
              .map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">{item.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {item.firstName} {item.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <Image
                      src={item.imageUrl || "/default-avatar.png"}
                      alt="avatar"
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.role === "ADMIN"
                          ? "bg-blue-100 text-blue-800"
                          : item.role === "USER"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && item.role !== "ADMIN" && (
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="p-2 hover:bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={item.role}
                        onChange={(e) => updateRole(item.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        disabled={item.role === "ADMIN"}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      item.role
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="sm:hidden space-y-3">
        {users
          .filter((user) => !blockedEmails.includes(user.email))
          .map((item) => (
            <div key={item.id} className="border rounded-lg p-3 flex gap-3">
              <Image
                src={item.imageUrl || "/default-avatar.png"}
                alt="avatar"
                width={40}
                height={40}
                className="rounded-full"
              />

              <div className="flex-1">
                <p className="text-sm font-semibold">
                  {item.firstName} {item.lastName}
                </p>
                <p className="text-xs text-gray-500 break-all">{item.email}</p>

                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.role === "ADMIN"
                        ? "bg-blue-100 text-blue-800"
                        : item.role === "USER"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.role}
                  </span>

                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isAdmin && item.role !== "ADMIN" && (
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => confirmDelete(item.id)}
                      className="p-2 bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-2"
                    >
                      <Trash2 size={16} />
                    </button>

                    <select
                      value={item.role}
                      onChange={(e) => updateRole(item.id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 flex items-center gap-2 cursor-pointer hover:-translate-y-2"
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
  );
}
