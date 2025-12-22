"use client";

import { createContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { User } from "@/types/user";

type UsersContextType = {
  users: User[];
  loading: boolean;
  isAdmin: boolean;
  refetchUsers: () => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
};

export const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchUsers();
    }
  }, [isLoaded]);

  const isAdmin =
    !!user &&
    users.find(
      (u) => u.email === user.primaryEmailAddress?.emailAddress
    )?.role === "ADMIN";

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        isAdmin,
        refetchUsers: fetchUsers,
        setUsers
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
