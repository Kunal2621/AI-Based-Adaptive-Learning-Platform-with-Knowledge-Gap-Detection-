export default function PriorityBadge({ priority }) {
  const styles = {
    High: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
    },
    Medium: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-200",
    },
    Low: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-200",
    },
  };

  const current = styles[priority] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        border
        ${current.bg}
        ${current.text}
        ${current.border}
      `}
    >
      {priority}
    </span>
  );
}