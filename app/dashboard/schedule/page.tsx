"use client";

import { useState } from "react";
import CalendarComponent, {
  CalendarEvent,
} from "@/components/Calendar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlotInfo } from "react-big-calendar";

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
      <CalendarComponent
        events={events}
        onSelectSlot={handleSelectSlot}
      />

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

              <Button onClick={handleSave}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Page;
