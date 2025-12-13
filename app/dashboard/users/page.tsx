"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true); // for fetch
  const [deleteLoading, setDeleteLoading] = useState(false); // full-screen spinner during delete

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

  // delete user
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeleteLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== id));
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    } finally {
      setDeleteLoading(false);
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
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.id}</TableCell>
            <TableCell>{user.clerkId}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.firstName}</TableCell>
            <TableCell>{user.lastName}</TableCell>
            <TableCell>
              <Image
                src={user.imageUrl || "/default-avatar.png"}
                alt="User avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            </TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </TableCell>
            <TableCell className="text-right">
              {user.role !== "ADMIN" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
