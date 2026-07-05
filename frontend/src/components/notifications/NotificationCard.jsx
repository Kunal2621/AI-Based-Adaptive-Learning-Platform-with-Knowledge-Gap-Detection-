import { Circle } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import { getNotificationIcon } from "../../utils/notificationIcons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function NotificationCard({
  notification,
  selected,
  onSelect,
}) {
  return (
    <div
      onClick={() => onSelect(notification)}
      className={`cursor-pointer border-b transition-all duration-200 hover:bg-violet-50 p-4 ${
        selected?._id === notification._id
          ? "bg-violet-100"
          : "bg-white"
      }`}
    >
      <div className="flex gap-4">

        <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1">

          <div className="flex items-center gap-2 flex-wrap">

            <h3 className="font-semibold">
              {notification.student?.name}
            </h3>

            <PriorityBadge priority={notification.priority} />

          </div>

          <p className="text-sm font-medium text-violet-600 mt-1">
            {notification.title}
          </p>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex justify-between items-center mt-3">

            <span className="text-xs text-gray-400">
                {dayjs(notification.createdAt).fromNow()}

            </span>

            {!notification.isRead && (
              <Circle
                size={10}
                fill="#7c3aed"
                color="#7c3aed"
              />
            )}

          </div>

        </div>

      </div>
    </div>
  );
}