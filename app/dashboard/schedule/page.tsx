import CalendarComponent from "@/components/Calendar"


const events = [
  {
    id: 1,
    user:"abhises",
    start: new Date(2025, 11, 20, 10, 0), // Jan 10, 10:00
    end: new Date(2025, 11, 20, 10, 0, 30),   // Jan 10, 11:00
  },

  {
    id: 2,
    user:"amrit",
    start: new Date(2025, 11, 20, 10, 0), // Jan 10, 10:00
    end: new Date(2025, 11, 20, 10, 0, 30),   // Jan 10, 11:00
  },
   {
    id: 3,
    user:"amrit",
    start: new Date(2025, 11, 20, 10, 0), // Jan 10, 10:00
    end: new Date(2025, 11, 20, 10, 0, 30),   // Jan 10, 11:00
  }, {
    id: 4,
    user:"amrit",
    start: new Date(2025, 11, 20, 10, 0), // Jan 10, 10:00
    end: new Date(2025, 11, 20, 10, 0, 30),   // Jan 10, 11:00
  }, {
    id: 5,
    user:"amrit",
    start: new Date(2025, 11, 20, 10, 0), // Jan 10, 10:00
    end: new Date(2025, 11, 20, 10, 0, 30),   // Jan 10, 11:00
  },
  {
    id: 6,
    user:"john_doe",
    start: new Date(2025, 11, 16, 13, 0),
    end: new Date(2025, 11, 16, 14, 0),
  },
];

const page = () => {
  return (
    <div><CalendarComponent events={events}/></div>
  )
}

export default page