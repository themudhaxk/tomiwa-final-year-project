const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800 border-green-200",
  B: "bg-blue-100 text-blue-800 border-blue-200",
  C: "bg-yellow-100 text-yellow-800 border-yellow-200",
  D: "bg-orange-100 text-orange-800 border-orange-200",
  F: "bg-red-100 text-red-800 border-red-200",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  lecturer: "bg-blue-100 text-blue-800 border-blue-200",
};

interface BadgeProps {
  variant?: "grade" | "status";
  value: string;
}

export function Badge({ variant = "grade", value }: BadgeProps) {
  const colors = variant === "grade" ? gradeColors : statusColors;
  const colorClass = colors[value] ?? "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
    >
      {value}
    </span>
  );
}
