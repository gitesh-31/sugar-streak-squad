import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "streak_update":
      return <span className="text-lg">🔥</span>;
    case "streak_broken":
      return <span className="text-lg">😢</span>;
    case "food_logged":
      return <span className="text-lg">🍽️</span>;
    case "member_joined":
      return <span className="text-lg">👋</span>;
    default:
      return <span className="text-lg">📢</span>;
  }
}

export function NotificationsPopover() {
  const { notifications, loading, unreadCount, markAllAsRead } = useNotifications();

  return (
    <Popover onOpenChange={(open) => open && markAllAsRead()}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="border-b border-border p-3">
          <h4 className="font-display font-semibold text-foreground">Notifications</h4>
          <p className="text-xs text-muted-foreground">
            Activity from your communities
          </p>
        </div>

        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground">
                Join communities to see activity!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-3 transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={notification.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {notification.user_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <NotificationIcon type={notification.type} />
                      <span className="text-xs font-medium text-foreground truncate">
                        {notification.title}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
