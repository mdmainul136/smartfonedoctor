"use client";

import Image from "next/image";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const appointments = [
  {
    id: 1,
    customer: "Marcus Johnson",
    device: "iPhone 14 Pro — Cracked Screen",
    time: "10:30 AM",
    branch: "Philly Flagship",
  },
  {
    id: 2,
    customer: "Aliyah Thompson",
    device: "Samsung S23 — Battery Replacement",
    time: "01:15 PM",
    branch: "Center City",
  },
  {
    id: 3,
    customer: "David Kim",
    device: "Pixel 8 — Charging Port Repair",
    time: "03:45 PM",
    branch: "Upper Darby",
  },
];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  return (
    <div className="bg-white p-4 rounded-xl shadow-2xs">
      <Calendar onChange={onChange} value={value} />
      <div className="flex items-center justify-between my-4">
        <div>
          <h1 className="text-base font-bold text-gray-800">Today&apos;s Appointments</h1>
          <p className="text-[11px] text-gray-400">Calendly bookings &amp; drop-offs</p>
        </div>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      <div className="flex flex-col gap-3">
        {appointments.map((item) => (
          <div
            className="p-3.5 rounded-lg border border-gray-100 border-l-4 odd:border-l-teal-500 even:border-l-lamaPurple bg-gray-50/40"
            key={item.id}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xs text-gray-800">{item.customer}</h2>
              <span className="text-teal-700 font-semibold text-[11px] bg-white px-2 py-0.5 rounded-full shadow-2xs">
                {item.time}
              </span>
            </div>
            <p className="mt-1 text-gray-600 text-[11px]">{item.device}</p>
            <p className="mt-0.5 text-gray-400 text-[10px]">📍 {item.branch}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCalendar;
