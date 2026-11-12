import Link from "next/link";

const announcements = [
  {
    id: 1,
    title: "iPhone 15 Screen Replacements Now In Stock",
    date: "Today",
    desc: "OEM-grade OLED panels arrived for Flagship & Center City branches.",
    color: "bg-lamaSkyLight",
  },
  {
    id: 2,
    title: "Weekly Promo: Free Screen Protector",
    date: "Active",
    desc: "Free tempered glass with any completed screen repair this week.",
    color: "bg-lamaPurpleLight",
  },
  {
    id: 3,
    title: "Google Local SEO Citation Sync",
    date: "Scheduled",
    desc: "Directory citations sync scheduled across Yelp & Apple Maps.",
    color: "bg-lamaYellowLight",
  },
];

const Announcements = () => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-base font-bold text-gray-800">Shop Announcements</h1>
          <p className="text-[11px] text-gray-400">Parts alerts &amp; updates</p>
        </div>
        <Link href="/admin/content" className="text-xs text-teal-600 hover:underline font-semibold">
          Manage →
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {announcements.map((item) => (
          <div key={item.id} className={`${item.color} rounded-lg p-3.5`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-xs text-gray-800">{item.title}</h2>
              <span className="text-[10px] text-gray-600 bg-white/90 rounded-md px-1.5 py-0.5 font-medium">
                {item.date}
              </span>
            </div>
            <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
