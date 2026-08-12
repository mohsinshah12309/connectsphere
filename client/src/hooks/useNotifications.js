import { useEffect, useState } from "react";
import api from "../api/axios";
import { useSocket } from "../context/SocketContext";

/**
 * Owns the full notification lifecycle so any component can just ask for
 * { notifications, unreadCount } without knowing whether a given entry
 * came from the initial REST fetch or arrived live over the socket.
 *
 *  - On mount: loads persisted history from GET /api/notifications.
 *  - While mounted: merges anything SocketContext receives over
 *    'newNotification' (deduped by _id, since a fast refresh could
 *    otherwise double up an entry already in the initial fetch).
 *  - markAllRead(): optimistically clears the badge, then calls
 *    PATCH /notifications/mark-all-read to persist it server-side.
 */
export function useNotifications() {
  const { liveNotifications } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.data.notifications);
        setUnreadCount(res.data.data.unreadCount);
      } catch (err) {
        console.error("Failed to load notifications", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (liveNotifications.length === 0) return;
    const newest = liveNotifications[0];
    setNotifications((prev) => {
      if (prev.some((n) => n._id === newest._id)) return prev;
      return [newest, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveNotifications.length]);

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await api.patch("/notifications/mark-all-read");
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  return { notifications, unreadCount, loading, markAllRead };
}
