"use client"

import Link from "next/link"
import {
  Bell,
  Home,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react"

import type { User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Logo } from "../icons/logo"

export function DashboardHeader({ user }: { user: User }) {
  const userInitials = user.name.split(' ').map(n => n[0]).join('');

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background/60 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Link href="/" className="hidden md:block">
          <Logo />
        </Link>
      </div>
      <div className="w-full flex-1">
        {/* Can add a global search here if needed */}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Notifications</h4>
              <p className="text-sm text-muted-foreground">
                You have 2 new messages.
              </p>
            </div>
            <div className="grid gap-2">
              <div
                className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent"
              >
                <Bell className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Donation Claimed</p>
                  <p className="text-sm text-muted-foreground">
                    Your "Surplus bread" donation was claimed.
                  </p>
                </div>
              </div>
               <div
                className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-accent"
              >
                <Bell className="mt-px h-5 w-5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">New Donation Nearby</p>
                  <p className="text-sm text-muted-foreground">
                    A new donation is available 2km away.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full h-8 w-8">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile"><UserIcon className="mr-2 h-4 w-4" />Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard"><Settings className="mr-2 h-4 w-4" />Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
            <Link href="/"><LogOut className="mr-2 h-4 w-4" />Log out</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
