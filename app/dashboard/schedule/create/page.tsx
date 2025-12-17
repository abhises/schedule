"use client";

import { useState } from "react";
import CalendarComponent, { CalendarEvent } from "@/components/Calendar";
import { ArrowLeft } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SlotInfo } from "react-big-calendar";
import CustomButton from "@/components/ui/custom-button";
import Link from "next/link";

const Page = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [user, setUser] = useState("");

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSlot(slotInfo);
    setOpen(true);
  };

  const handleSave = () => {
    if (!slot || !user) return;

    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "Shift",
        user,
        start: slot.start,
        end: slot.end,
      },
    ]);

    setOpen(false);
    setUser("");
  };

  return (
    <>
      <Link href="/dashboard/schedule" className="ml-4">
        <CustomButton variant="primary">
          {" "}
          <span className="flex items-center gap-2">
            <ArrowLeft size={14} />
            <span>Back</span>
          </span>
        </CustomButton>
      </Link>
      <CalendarComponent events={events} onSelectSlot={handleSelectSlot} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
          </DialogHeader>

          {slot && (
            <div className="space-y-4">
              <Input
                placeholder="User"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />

              <CustomButton onClick={handleSave}>Save</CustomButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Page;
