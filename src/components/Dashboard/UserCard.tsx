import Image from "next/image";

interface UserCardProps {
  type?: string;
  title?: string;
  value?: string | number;
  badge?: string;
  subtext?: string;
}

const UserCard = ({
  type,
  title,
  value = "1,234",
  badge = "2024/25",
  subtext,
}: UserCardProps) => {
  const displayTitle = title || (type ? `${type}s` : "Items");
  const displayValue = value;
  const displayBadge = badge;

  return (
    <div className="rounded-2xl odd:bg-lamaPurple even:bg-lamaYellow p-4 flex-1 min-w-[130px] shadow-2xs">
      <div className="flex justify-between items-center">
        <span className="text-[10px] bg-white px-2 py-1 rounded-full text-green-700 font-semibold shadow-2xs">
          {displayBadge}
        </span>
        <Image src="/more.png" alt="" width={20} height={20} />
      </div>
      <h1 className="text-2xl font-bold my-3 text-gray-800">{displayValue}</h1>
      <h2 className="capitalize text-xs font-semibold text-gray-600">
        {displayTitle}
      </h2>
      {subtext && (
        <p className="text-[10px] text-gray-500 mt-0.5">{subtext}</p>
      )}
    </div>
  );
};

export default UserCard;
