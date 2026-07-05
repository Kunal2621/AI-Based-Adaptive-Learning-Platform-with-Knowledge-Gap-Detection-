import { Mail } from "lucide-react";
import PriorityBadge from "./PriorityBadge";
import { getNotificationIcon } from "../../utils/notificationIcons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
export default function NotificationDetails({ notification }) {
  if (!notification) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Mail className="mx-auto w-12 h-12 mb-3" />
          <p className="text-lg">Select a notification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-white">

      {/* Header */}

      <div className="border-b p-6 flex items-center gap-4">

        <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1">

          <div className="flex items-center gap-3 flex-wrap">

            <h2 className="text-2xl font-bold">
              {notification.student?.name}
            </h2>

            <PriorityBadge priority={notification.priority} />

          </div>
          {notification.course && (
           <p className="text-sm text-gray-500 mt-1">
           Course : {notification.course.title}
             </p>
              
            )
        }

          <p className="text-violet-600 font-medium mt-1">
            {notification.title}
          </p>

          <p className="text-sm text-gray-400 mt-1">
            {dayjs(notification.createdAt).fromNow()}
          </p>

        </div>

      </div>

      {/* Body */}

      <div className="p-8">

        <div className="flex items-center gap-3 mb-8">

          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>

          <h1 className="text-3xl font-bold">
            {notification.title}
          </h1>

        </div>

        <div className="bg-gray-50 rounded-xl p-6 border">

          <p className="text-gray-700 leading-8 text-lg">
            {notification.message}
          </p>

        </div>

        {/* AI Suggestion */}

        {notification.type === "LOW_SCORE" && (
          <div className="mt-8 rounded-xl bg-red-50 border border-red-200 p-5">

            <h3 className="font-bold text-red-700 mb-3">
              AI Recommendation
            </h3>

            <ul className="list-disc ml-5 space-y-2 text-red-600">

              <li>Review previous lesson.</li>

              <li>Practice recommended quiz.</li>

              <li>Revise weak concepts.</li>

              <li>Schedule a mentor session.</li>

            </ul>

          </div>
        )}

        {notification.type === "KNOWLEDGE_GAP" && (
          <div className="mt-8 rounded-xl bg-purple-50 border border-purple-200 p-5">

            <h3 className="font-bold text-purple-700 mb-3">
              AI Knowledge Gap Analysis
            </h3>

            <ul className="list-disc ml-5 space-y-2 text-purple-700">

              <li>Concept retention is below expected level.</li>

              <li>Recommend watching Module 3 again.</li>

              <li>Attempt Practice Quiz before continuing.</li>

              <li>Difficulty level should remain Beginner.</li>

            </ul>

          </div>
        )}

        {notification.type === "HIGH_SCORE" && (
          <div className="mt-8 rounded-xl bg-green-50 border border-green-200 p-5">

            <h3 className="font-bold text-green-700 mb-3">
              AI Feedback
            </h3>

            <p className="text-green-700">
              Excellent performance. AI recommends unlocking the
              next advanced module.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}