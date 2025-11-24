"use client";
import { useState } from "react";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";

type EventType = {
  date: string;
  employee: string;
  time: string;
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [error, setError] = useState("");

  const today = dayjs();
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayIndex = currentMonth.startOf("month").day();

  const employees = ["Alice", "Bob", "Charlie", "David", "Eve"];
  const timeSlots = [
    "08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"
  ];

  const addEvent = () => {
    if (!selectedEmployee) {
      setError("Please select an employee!");
      return;
    }
    if (!selectedDate) return;

    const exists = events.some(
      (e) => e.date === selectedDate && e.employee === selectedEmployee
    );
    if (exists) {
      setError("This employee is already scheduled on this date!");
      return;
    }

    setEvents([
      ...events,
      {
        date: selectedDate,
        employee: selectedEmployee,
        time: `${startTime} - ${endTime}`,
      },
    ]);

    setSelectedEmployee("");
    setStartTime("09:00");
    setEndTime("17:00");
    setSelectedDate(null);
    setError("");
  };

  const deleteEvent = (date: string, index: number) => {
    setEvents(events.filter((e, i) => !(e.date === date && i === index)));
  };

  const isToday = (date: string) => date === today.format("YYYY-MM-DD");
  const isPastDate = (date: string) => dayjs(date).isBefore(today, "day");

  const publish = () => {
    const totals: Record<string, number> = {};
    events.forEach((e) => {
      const [start, end] = e.time.split(" - ").map((t) => parseInt(t.split(":")[0]));
      const hours = end - start;
      if (!totals[e.employee]) totals[e.employee] = 0;
      totals[e.employee] += hours;
    });

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Employee Hours Report", 20, 20);
    let y = 30;

    Object.entries(totals).forEach(([employee, hours]) => {
      doc.setFontSize(12);
      doc.text(`${employee}: ${hours} hours`, 20, y);
      y += 10;
    });

    doc.save("employee_hours.pdf");
  };

  return (
    <div className="w-full h-full min-h-screen bg-white text-black p-2 md:p-5 flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-5">
        {currentMonth.format("MMMM YYYY")}
      </h1>

      {/* Change month */}
      <div className="flex justify-between mb-3 px-2 sm:px-0">
        <button
          className="px-2 sm:px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
        >
          Prev
        </button>
        <button
          className="px-2 sm:px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
        >
          Next
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center font-semibold mb-2 text-xs sm:text-sm">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
        <div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 overflow-y-auto mb-4">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={i}></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = currentMonth.date(i + 1).format("YYYY-MM-DD");
          const dayEvents = events.filter((e) => e.date === date);
          const past = isPastDate(date);

          return (
            <div
              key={i}
              onClick={() => !past && setSelectedDate(date)}
              className={`border p-1 sm:p-2 rounded cursor-pointer ${
                past
                  ? "bg-gray-100 cursor-not-allowed text-gray-400"
                  : "hover:bg-gray-200"
              } ${isToday(date) ? "border-blue-500" : "border-gray-400"}`}
            >
              <div className="font-bold text-xs sm:text-sm">{i + 1}</div>

              {dayEvents.map((ev, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-[8px] sm:text-xs mt-1 bg-blue-500 text-white p-1 rounded break-words"
                >
                  <span>{`${ev.employee} (${ev.time})`}</span>
                  <button
                    className="ml-1 sm:ml-2 bg-red-600 px-1 rounded hover:bg-red-700 text-[8px] sm:text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteEvent(date, idx);
                    }}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Publish Button */}
      {events.length > 0 && (
        <button
          className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 mb-4 self-end"
          onClick={publish}
        >
          Publish
        </button>
      )}

      {/* Add Event Popup */}
      {selectedDate && !isPastDate(selectedDate) && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-2">
          <div className="bg-white text-black p-4 sm:p-5 rounded shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3 text-center sm:text-left">
              Add Employee – {selectedDate}
            </h3>

            <label className="block mb-1 sm:mb-2">Select Employee:</label>
            <select
              className="w-full border border-gray-400 p-1 sm:p-2 rounded mb-1 sm:mb-3"
              value={selectedEmployee}
              onChange={(e) => {
                setSelectedEmployee(e.target.value);
                if (e.target.value) setError("");
              }}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp}
                </option>
              ))}
            </select>

            {error && <p className="text-red-600 text-sm mb-2 sm:mb-3">{error}</p>}

            <label className="block mb-1 sm:mb-2">Start Time:</label>
            <select
              className="w-full border border-gray-400 p-1 sm:p-2 rounded mb-2 sm:mb-3"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="block mb-1 sm:mb-2">End Time:</label>
            <select
              className="w-full border border-gray-400 p-1 sm:p-2 rounded mb-3"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            >
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <button
                className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 w-full sm:w-auto"
                onClick={() => {
                  setSelectedDate(null);
                  setError("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 w-full sm:w-auto"
                onClick={addEvent}
              >
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
