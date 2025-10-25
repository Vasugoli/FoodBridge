import { format } from 'date-fns';
import { MoreHorizontal } from "lucide-react";
import type { Donation } from "@/lib/types";
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

const statusVariantMap: { [key in Donation['status']]: "default" | "secondary" | "destructive" | "outline" } = {
  available: 'default',
  claimed: 'secondary',
  completed: 'outline',
  expired: 'destructive',
};

export function DonationTable({ donations }: { donations: Donation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Donations</CardTitle>
        <CardDescription>
          A list of all donations on the FoodBridge platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead className="hidden md:table-cell">Created On</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell className="font-medium">{donation.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[donation.status]} className="capitalize">
                    {donation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={donation.donor.avatarUrl} alt={donation.donor.name} />
                      <AvatarFallback>{donation.donor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{donation.donor.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(donation.createdAt, 'PP')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Mark as Expired</DropdownMenuItem>
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
