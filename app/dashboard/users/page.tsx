"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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

export default function Page() {
  const { user, isLoaded, isSignedIn } = useUser(); // 👈 Clerk item

  console.log("Current user:", user);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // for fetch
  const [deleteLoading, setDeleteLoading] = useState(false); // full-screen spinner during delete
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const ROLES = ["PENDING", "USER", "ADMIN"] as const;

  // fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("API did not return an array:", data);
          setUsers([]);
        }
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

  // delete item
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

  // Show full-screen spinner if fetching or deleting
  if (loading || deleteLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center  z-50">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <div className="m-4">
      <Table>
        <TableCaption>All team members</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Id</TableHead>
            <TableHead>ClerkId</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>CreatedAt</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Role change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell>{item.clerkId}</TableCell>
              <TableCell>{item.email}</TableCell>
              <TableCell>{item.firstName}</TableCell>
              <TableCell>{item.lastName}</TableCell>
              <TableCell>
                <Image
                  src={item.imageUrl || "/default-avatar.png"}
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </TableCell>
              <TableCell>{item.role}</TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </TableCell>
              <TableCell>
                {isAdmin && item.role !== "ADMIN" && (
                  <button
                    onClick={() => confirmDelete(item.id)}
                    className="p-2 hover:bg-red-100 rounded text-red-600 cursor-pointer hover:-translate-y-2"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </TableCell>
              <TableCell>
                {isAdmin ? (
                  <select
                    value={item.role}
                    onChange={(e) => updateRole(item.id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={
                      item.role === "ADMIN"
                      //  &&
                      // item.email === user?.primaryEmailAddress?.emailAddress
                    }
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
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
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 cursor-pointer flex items-center gap-2"
              >
                {deleting ? (
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
      </Table>
    </div>
  );
}
