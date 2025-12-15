import React from "react";
import CustomButton from "@/components/ui/custom-button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
const page = () => {
  return (
    <div>
      <div className="flex items-center justify-end w-full">
        <Link href="/dashboard/schedule/create">
          {" "}
          <CustomButton variant="primary">Create Schedule</CustomButton>
        </Link>
      </div>
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
        <TableBody></TableBody>
      </Table>
    </div>
  );
};

export default page;
