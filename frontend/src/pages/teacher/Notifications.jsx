import { useEffect, useMemo, useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import API from "../../services/api";
import NotificationCard from "../../components/notifications/NotificationCard";
import NotificationDetails from "../../components/notifications/NotificationDetails";

export default function Notifications() {
  const [messages, setMessages] = useState([]);
const [selected, setSelected] = useState(null);
const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetchNotifications();
}, []);

const fetchNotifications = async () => {
  try {
    const res = await API.get("/notifications");

    setMessages(res.data.data);

    if (res.data.data.length > 0) {
      setSelected(res.data.data[0]);
    }

  } catch (err) {
    console.log(err);
  } finally{
    setLoading(false);
  }
};


  const filteredNotifications = useMemo(() => {
    return messages.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        (item.student?.name || "").toLowerCase().includes(keyword) ||
        (item.subject || "").toLowerCase().includes(keyword) ||
        (item.message || "").toLowerCase().includes(keyword)
      );
    });
  }, [messages, search]);

  if (loading) {
  return (
    <div className="flex items-center justify-center h-[82vh]">
      <h2 className="text-xl font-semibold text-violet-600">
        Loading Notifications...
      </h2>
    </div>
  );
}

  return (
    <div className="bg-white rounded-xl shadow h-[82vh] overflow-hidden">

      {/* ---------------- MOBILE ---------------- */}

      <div className="md:hidden h-full">

        {!selected ? (
          <>
            <div className="border-b p-4">

              <h1 className="text-2xl font-bold">
                Notifications
              </h1>

              <div className="relative mt-4">

                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />

                <input
                  type="text"
                  placeholder="Search notification..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border rounded-lg pl-10 py-2 outline-none"
                />

              </div>

            </div>

            <div className="overflow-y-auto h-full">

              {filteredNotifications.length === 0 ? (

                <div className="text-center mt-10 text-gray-400">
                  No Notifications Found
                </div>

              ) : (

                filteredNotifications.map((item) => (

                  <NotificationCard
                    key={item._id}
                    notification={item}
                    selected={selected}
                    onSelect={setSelected}
                  />

                ))

              )}

            </div>

          </>
        ) : (

          <div className="h-full flex flex-col">

            <div className="border-b p-4 flex items-center gap-3">

              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>

              <h2 className="font-bold text-lg">
                Notification Details
              </h2>

            </div>

            <NotificationDetails
              notification={selected}
            />

          </div>

        )}

      </div>

      {/* ---------------- DESKTOP ---------------- */}

      <div className="hidden md:flex h-full">

        {/* Sidebar */}

        <div className="w-[370px] border-r flex flex-col">

          <div className="border-b p-5">

            <h1 className="text-2xl font-bold">
              Notifications
            </h1>

            <div className="relative mt-4">

              <Search
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search notification..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg pl-10 py-2 outline-none"
              />

            </div>

          </div>

          <div className="overflow-y-auto flex-1">

            {filteredNotifications.length === 0 ? (

              <div className="text-center mt-10 text-gray-400">
                No Notifications Found
              </div>

            ) : (

              filteredNotifications.map((item) => (

                <NotificationCard
                  key={item._id}
                  notification={item}
                  selected={selected}
                  onSelect={setSelected}
                />

              ))

            )}

          </div>

        </div>

        {/* Details Panel */}
                <div className="flex-1 bg-gray-50">

          {selected ? (

            <NotificationDetails
              notification={selected}
            />

          ) : (

            <div className="h-full flex items-center justify-center">

              <div className="text-center">

                <div className="w-24 h-24 mx-auto rounded-full bg-violet-100 flex items-center justify-center mb-5">

                  <Search
                    size={40}
                    className="text-violet-600"
                  />

                </div>

                <h2 className="text-2xl font-bold text-gray-700">
                  No Notification Selected
                </h2>

                <p className="text-gray-500 mt-3">
                  Select a notification from the left panel to
                  view complete details.
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>

  );
}