"use client";

import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jun", revenue: 8400, partsCost: 3100 },
  { name: "Jul", revenue: 9200, partsCost: 3400 },
  { name: "Aug", revenue: 10400, partsCost: 3800 },
  { name: "Sep", revenue: 11100, partsCost: 4050 },
  { name: "Oct", revenue: 11800, partsCost: 4200 },
  { name: "Nov", revenue: 12450, partsCost: 4400 },
];

const FinanceChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-2xs">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-base font-bold text-gray-800">Monthly Financials</h1>
          <p className="text-[11px] text-gray-400">Gross repair revenue vs parts &amp; inventory cost</p>
        </div>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              tickMargin={10}
            />
            <YAxis
              axisLine={false}
              tick={{ fill: "#6b7280", fontSize: 11 }}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip
              contentStyle={{ borderRadius: "8px", borderColor: "#f3f4f6", fontSize: 11 }}
            />
            <Legend
              align="center"
              verticalAlign="top"
              wrapperStyle={{ paddingTop: "5px", paddingBottom: "25px", fontSize: 11 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              name="Gross Revenue ($)"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="partsCost"
              name="Parts Cost ($)"
              stroke="#CFCEFF"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceChart;
