"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Home, LogOut, Settings, User as UserIcon } from "lucide-react";

import type { SerializableUser } from "@/lib/types";
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

export function DashboardHeader({ user }: { user: SerializableUser }) {
	const router = useRouter();
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const userInitials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("");

	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await fetch("/api/auth/logout", {
				method: "POST",
			});
			router.push("/login");
			router.refresh();
		} catch (error) {
			console.error("Logout error:", error);
			setIsLoggingOut(false);
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
			<div className='w-full flex-1'>
				{/* Can add a global search here if needed */}
			</div>

			{/* Notifications */}
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300'>
						<Bell className='h-5 w-5' />
						<span className='absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white' />
						<span className='sr-only'>Toggle notifications</span>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-80 p-0 rounded-2xl border-2 shadow-xl'>
					<div className='p-6'>
						<div className='space-y-2 mb-6'>
							<h4 className='font-semibold text-lg'>
								Notifications
							</h4>
							<p className='text-sm text-muted-foreground'>
								You have 2 new messages.
							</p>
						</div>
						<div className='space-y-3'>
							<div className='flex items-start space-x-4 rounded-xl p-3 transition-all hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer'>
								<div className='h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0'>
									<Bell className='h-5 w-5 text-emerald-600' />
								</div>
								<div className='space-y-1 flex-1'>
									<p className='text-sm font-semibold leading-none'>
										Donation Claimed
									</p>
									<p className='text-xs text-muted-foreground'>
										Your "Surplus bread" donation was
										claimed.
									</p>
								</div>
							</div>
							<div className='flex items-start space-x-4 rounded-xl p-3 transition-all hover:bg-primary/5 border border-transparent hover:border-primary/20 cursor-pointer'>
								<div className='h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0'>
									<Bell className='h-5 w-5 text-blue-600' />
								</div>
								<div className='space-y-1 flex-1'>
									<p className='text-sm font-semibold leading-none'>
										New Donation Nearby
									</p>
									<p className='text-xs text-muted-foreground'>
										A new donation is available 2km away.
									</p>
								</div>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>

			{/* User Menu */}
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
							<p className='text-xs text-muted-foreground'>
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						asChild
						className='rounded-lg cursor-pointer'>
						<Link
							href='/dashboard/profile'
							className='flex items-center'>
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
						{isLoggingOut ? "Logging out..." : "Log out"}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}
