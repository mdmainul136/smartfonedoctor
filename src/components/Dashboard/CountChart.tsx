"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Total",
    count: 100,
    fill: "white",
  },
  {
    name: "Samsung",
    count: 42,
    fill: "#FAE27C",
  },
  {
    name: "iPhone",
    count: 58,
    fill: "#C3EBFA",
  },
];

const CountChart = () => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-2xs flex flex-col justify-between">
      {/* TITLE */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold text-gray-800">Repairs by Brand</h1>
          <p className="text-[11px] text-gray-400">Incoming device split</p>
        </div>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>

      {/* CHART */}
      <div className="relative w-full h-[65%]">
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={28}
            data={data}
          >
            <RadialBar background dataKey="count" />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <span className="text-xl">📱</span>
          <span className="text-[10px] font-bold text-gray-500 block leading-none">Devices</span>
        </div>
      </div>

      {/* BOTTOM LEGEND */}
      <div className="flex justify-around pt-2 border-t border-gray-50">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-4 h-4 bg-lamaSky rounded-full" />
          <span className="font-bold text-sm text-gray-800">58%</span>
          <span className="text-[11px] text-gray-500">Apple iPhone</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-4 h-4 bg-lamaYellow rounded-full" />
          <span className="font-bold text-sm text-gray-800">42%</span>
          <span className="text-[11px] text-gray-500">Android / Other</span>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
