"use client";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Mon",
    screens: 14,
    batteries: 8,
  },
  {
    name: "Tue",
    screens: 18,
    batteries: 12,
  },
  {
    name: "Wed",
    screens: 22,
    batteries: 15,
  },
  {
    name: "Thu",
    screens: 20,
    batteries: 14,
  },
  {
    name: "Fri",
    screens: 26,
    batteries: 19,
  },
  {
    name: "Sat",
    screens: 30,
    batteries: 22,
  },
];

const AttendanceChart = () => {
  return (
    <div className="bg-white rounded-xl p-4 h-full shadow-2xs flex flex-col justify-between">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-base font-bold text-gray-800">Weekly Repair Activity</h1>
          <p className="text-[11px] text-gray-400">Screens replaced vs battery/other services</p>
        </div>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ borderRadius: "8px", borderColor: "#f3f4f6", fontSize: 11 }}
            />
            <Legend
              align="left"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: "5px", paddingBottom: "20px", fontSize: 11 }}
            />
            <Bar
              dataKey="screens"
              name="Screen Repairs"
              fill="#0d9488"
              legendType="circle"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="batteries"
              name="Battery & Others"
              fill="#C3EBFA"
              legendType="circle"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceChart;
