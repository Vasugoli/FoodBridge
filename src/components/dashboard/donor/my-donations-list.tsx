import Image from "next/image";
import { format, formatDistanceToNow } from 'date-fns';
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

const statusVariantMap: { [key in Donation['status']]: "default" | "secondary" | "destructive" | "outline" } = {
  available: 'default',
  claimed: 'secondary',
  completed: 'outline',
  expired: 'destructive',
};

export default function MyDonationsList({ donations }: { donations: Donation[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Donations</CardTitle>
        <CardDescription>
          A list of all the food donations you have posted.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Expires</TableHead>
              <TableHead className="hidden md:table-cell">Created at</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell className="hidden sm:table-cell">
                  <Image
                    alt={donation.title}
                    className="aspect-square rounded-md object-cover"
                    height="64"
                    src={donation.imageUrl}
                    width="64"
                    data-ai-hint={donation.imageHint}
                  />
                </TableCell>
                <TableCell className="font-medium">{donation.title}</TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[donation.status]} className="capitalize">
                    {donation.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {formatDistanceToNow(donation.expiry, { addSuffix: true })}
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
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
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
