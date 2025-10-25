"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Users,
  HandHeart,
  PackageSearch,
  CheckCircle,
  Settings,
  PanelLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/lib/types";
import { Separator } from "../ui/separator";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";

interface SidebarProps {
  role: UserRole;
}

const adminNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/admin/donations", icon: PackageSearch, label: "All Donations" },
  { href: "/dashboard/admin/users", icon: Users, label: "Manage Users" },
];

const donorNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/donations", icon: Package, label: "My Donations" },
  { href: "/dashboard/donations/new", icon: PlusCircle, label: "New Donation" },
];

const distributorNav = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/donations", icon: HandHeart, label: "Find Donations" },
  { href: "/dashboard/claims", icon: CheckCircle, label: "My Claims" },
];

export function AppSidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navItems = {
    admin: adminNav,
    donor: donorNav,
    distributor: distributorNav,
  }[role];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
         <Logo />
         <SidebarTrigger><Button variant="ghost" size="icon"><PanelLeft /></Button></SidebarTrigger>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="mt-auto">
        <Separator className="my-2" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/dashboard/profile'} tooltip={{ children: 'Profile' }}>
              <Link href="/dashboard/profile">
                <Settings />
                <span>Profile Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
