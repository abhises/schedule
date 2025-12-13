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
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

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
        alert(data.error || "Failed to delete item");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting item");
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
            <TableCell className="text-right">
              {isAdmin && item.role !== "ADMIN" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
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
