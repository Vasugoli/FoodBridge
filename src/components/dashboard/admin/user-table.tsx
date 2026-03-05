"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Loader2, ShieldCheck } from "lucide-react";
import type { User } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

type UserWithStatus = User & { isSuspended?: boolean };

export function UserTable({ users: initialUsers }: { users: UserWithStatus[] }) {
  const [users, setUsers] = useState<UserWithStatus[]>(initialUsers);
  const [acting, setActing] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleAction(
    userId: string,
    action: "verify" | "unverify" | "suspend" | "unsuspend",
  ) {
    setActing(`${action}-${userId}`);
    try {
      const res = await fetch(`/api/users/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === "verify")    return { ...u, isVerified: true };
          if (action === "unverify")  return { ...u, isVerified: false };
          if (action === "suspend")   return { ...u, isSuspended: true };
          if (action === "unsuspend") return { ...u, isSuspended: false };
          return u;
        }),
      );

      const labels: Record<string, string> = {
        verify: "User verified",
        unverify: "Verification removed",
        suspend: "User suspended",
        unsuspend: "User unsuspended",
      };
      toast({ title: labels[action] ?? "Done", description: "User status updated." });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Action failed",
        variant: "destructive",
      });
    } finally {
      setActing(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          A list of all users on the FoodBridge platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden md:table-cell">Trust</TableHead>
              <TableHead className="hidden md:table-cell">Joined On</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={user.isSuspended ? "opacity-60" : undefined}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid">
                      <div className="font-medium flex items-center gap-1">
                        {user.name}
                        {user.isVerified && (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-label="Verified" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{user.role}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.isSuspended ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : user.isVerified ? (
                    <Badge variant="default" className="bg-emerald-600">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm font-mono">
                    {typeof (user as any).trustScore === "number"
                      ? `${((user as any).trustScore as number).toFixed(1)}/5`
                      : "—"}
                  </span>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(user.createdAt, "PP")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost"
                        disabled={acting?.endsWith(user.id) ?? false}>
                        {acting?.endsWith(user.id)
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <MoreHorizontal className="h-4 w-4" />}
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {user.role === "distributor" && (
                        user.isVerified ? (
                          <DropdownMenuItem onClick={() => handleAction(user.id, "unverify")}>
                            Remove Verification
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleAction(user.id, "verify")}>
                            ✓ Verify Distributor
                          </DropdownMenuItem>
                        )
                      )}
                      {user.isSuspended ? (
                        <DropdownMenuItem onClick={() => handleAction(user.id, "unsuspend")}>
                          Unsuspend User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleAction(user.id, "suspend")}
                          className="text-red-600 focus:text-red-700">
                          Suspend User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

