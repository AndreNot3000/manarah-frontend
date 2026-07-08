"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationRead } from "@/lib/api";
import { Card, CardTitle, CardDescription, RowListSkeleton } from "@/components/ui";
import { Bell, BellOff, CheckCheck, Inbox, Circle } from "lucide-react";
import clsx from "clsx";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ limit: 50 }),
  });

  // Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      // Invalidate count in layout and notifications list
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Notifications</h1>
        <p className="text-sm text-neutral-muted mt-1">
          Stay updated with your inquiries, active competitions, and system alerts.
        </p>
      </div>

      {isLoading ? (
        <RowListSkeleton count={4} />
      ) : notifications.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center border-dashed border-2">
          <span className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Inbox size={32} />
          </span>
          <CardTitle className="text-lg font-bold text-slate-700">Inbox is Empty</CardTitle>
          <CardDescription className="max-w-sm mt-2">
            You don&apos;t have any notifications at the moment. System updates and competition activities will appear here.
          </CardDescription>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const dateStr = new Date(notif.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.read) {
                    markReadMutation.mutate(notif.id);
                  }
                }}
                className={clsx(
                  "p-5 rounded-xl border transition-all duration-200 cursor-pointer flex gap-4 items-start relative overflow-hidden",
                  notif.read 
                    ? "bg-white border-slate-200 text-slate-700 opacity-80" 
                    : "bg-white border-green-200 hover:border-green-300 shadow-sm font-semibold border-l-4 border-l-primary"
                )}
              >
                {/* Visual indicator (unread dot) */}
                <div className="mt-1 shrink-0">
                  {notif.read ? (
                    <BellOff size={18} className="text-slate-400" />
                  ) : (
                    <div className="relative">
                      <Bell size={18} className="text-primary" />
                      <Circle size={8} className="absolute -top-1 -right-1 text-red-500 fill-red-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className={clsx("text-sm", notif.read ? "text-slate-800 font-semibold" : "text-slate-900 font-bold")}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                      {dateStr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed break-words">
                    {notif.body}
                  </p>
                </div>

                {/* Mark read check icon */}
                {!notif.read && (
                  <div className="self-center pl-2 shrink-0 md:opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                    <CheckCheck size={16} className="text-green-600 hover:cursor-pointer" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
