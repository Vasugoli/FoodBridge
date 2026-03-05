"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Bell,
	LogOut,
	User as UserIcon,
	CheckCheck,
	Trash2,
	Package,
	HandHeart,
	AlertTriangle,
	Clock,
	Info,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import type { SerializableUser } from "@/lib/types";
import type { AppNotification, NotificationType } from "@/hooks/use-notifications";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Logo } from "../icons/logo";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function notifIcon(type: NotificationType) {
	const base = "h-5 w-5";
	switch (type) {
		case "new_donation":
			return { icon: <Package className={cn(base, "text-emerald-600")} />, bg: "bg-emerald-100" };
		case "donation_claimed":
			return { icon: <HandHeart className={cn(base, "text-blue-600")} />, bg: "bg-blue-100" };
		case "donation_completed":
			return { icon: <CheckCheck className={cn(base, "text-purple-600")} />, bg: "bg-purple-100" };
		case "donation_expired":
			return { icon: <AlertTriangle className={cn(base, "text-amber-600")} />, bg: "bg-amber-100" };
		default:
			return { icon: <Info className={cn(base, "text-gray-500")} />, bg: "bg-gray-100" };
	}
}

function timeAgo(iso: string) {
	try {
		return formatDistanceToNow(new Date(iso), { addSuffix: true });
	} catch {
		return "just now";
	}
}

// ─── NotificationItem ────────────────────────────────────────────────────────

function NotificationItem({ notif }: { notif: AppNotification }) {
	const { icon, bg } = notifIcon(notif.type);
	return (
		<div
			className={cn(
				"flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-muted/60 border border-transparent",
				!notif.read && "bg-primary/5 border-primary/10",
			)}>
			<div className={cn("h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
				{icon}
			</div>
			<div className="flex-1 min-w-0 space-y-0.5">
				<div className="flex items-start justify-between gap-2">
					<p className={cn("text-sm leading-snug", !notif.read ? "font-semibold" : "font-medium")}>
						{notif.title}
					</p>
					{!notif.read && (
						<span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
					)}
				</div>
				<p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
				<p className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
					<Clock className="h-3 w-3" />
					{timeAgo(notif.timestamp)}
				</p>
			</div>
		</div>
	);
}

// ─── DashboardHeader ─────────────────────────────────────────────────────────

export function DashboardHeader({ user }: { user: SerializableUser }) {
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [open, setOpen] = useState(false);

	const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();

	const userInitials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("");

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/login");
			router.refresh();
		} catch (error) {
			console.error("Logout error:", error);
			setIsLoggingOut(false);
		}
	};

	const handleOpen = (v: boolean) => {
		setOpen(v);
		if (v && unreadCount > 0) {
			// Mark all read when panel opens
			setTimeout(markAllRead, 1500);
		}
	};

	return (
		<header className='flex h-16 items-center gap-4 border-b-2 border-gray-100 bg-white/80 px-4 lg:h-[72px] lg:px-8 sticky top-0 z-30 backdrop-blur-xl shadow-sm'>
			<div className='flex items-center gap-3'>
				<SidebarTrigger className='md:hidden hover:bg-primary/10 rounded-lg transition-colors' />
				<Link
					href='/'
					className='hidden md:block transition-transform duration-300 hover:scale-105'>
					<Logo />
				</Link>
			</div>
			<div className='w-full flex-1' />

			{/* ── Notifications ── */}
			<Popover open={open} onOpenChange={handleOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300'>
						<Bell className='h-5 w-5' />
						{unreadCount > 0 && (
							<Badge
								className='absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-bold bg-red-500 hover:bg-red-500 text-white border-2 border-white rounded-full pointer-events-none'>
								{unreadCount > 9 ? "9+" : unreadCount}
							</Badge>
						)}
						<span className='sr-only'>Notifications</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[360px] p-0 rounded-2xl border-2 shadow-xl' align='end'>
					{/* Header */}
					<div className='flex items-center justify-between px-5 pt-5 pb-3 border-b'>
						<div>
							<h4 className='font-semibold text-base'>Notifications</h4>
							<p className='text-xs text-muted-foreground'>
								{unreadCount > 0
									? `${unreadCount} unread`
									: "All caught up!"}
							</p>
						</div>
						<div className='flex items-center gap-1'>
							{unreadCount > 0 && (
								<Button
									variant='ghost'
									size='sm'
									className='h-7 text-xs gap-1 text-muted-foreground hover:text-foreground'
									onClick={markAllRead}
									title='Mark all as read'>
									<CheckCheck className='h-3.5 w-3.5' />
									Mark read
								</Button>
							)}
							{notifications.length > 0 && (
								<Button
									variant='ghost'
									size='icon'
									className='h-7 w-7 text-muted-foreground hover:text-destructive'
									onClick={clearAll}
									title='Clear all'>
									<Trash2 className='h-3.5 w-3.5' />
								</Button>
							)}
						</div>
					</div>

					{/* List */}
					<ScrollArea className='h-[340px]'>
						<div className='p-3 space-y-1'>
							{notifications.length === 0 ? (
								<div className='flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground'>
									<Bell className='h-10 w-10 opacity-20' />
									<p className='text-sm font-medium'>No notifications yet</p>
									<p className='text-xs text-center opacity-70'>
										Events like new donations and claims will appear here in real time.
									</p>
								</div>
							) : (
								notifications.map((notif) => (
									<NotificationItem key={notif.id} notif={notif} />
								))
							)}
						</div>
					</ScrollArea>
				</PopoverContent>
			</Popover>

			{/* ── User Menu ── */}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='rounded-xl h-10 w-10 hover:bg-primary/10 transition-all duration-300'>
						<Avatar className='h-9 w-9 ring-2 ring-primary/20'>
							<AvatarImage src={user.avatarUrl} alt={user.name} />
							<AvatarFallback className='bg-gradient-to-br from-primary to-emerald-600 text-white font-semibold'>
								{userInitials}
							</AvatarFallback>
						</Avatar>
						<span className='sr-only'>Toggle user menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align='end'
					className='w-56 rounded-xl border-2 shadow-xl p-2'>
					<DropdownMenuLabel className='px-3 py-2'>
						<div className='flex flex-col space-y-1'>
							<p className='text-sm font-semibold'>{user.name}</p>
							<p className='text-xs text-muted-foreground'>{user.email}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild className='rounded-lg cursor-pointer'>
						<Link href='/dashboard/profile' className='flex items-center'>
							<UserIcon className='mr-3 h-4 w-4' />
							Profile
						</Link>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={handleLogout}
						disabled={isLoggingOut}
						className='rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'>
						<LogOut className='mr-3 h-4 w-4' />
						{isLoggingOut ? "Logging out…" : "Log out"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
