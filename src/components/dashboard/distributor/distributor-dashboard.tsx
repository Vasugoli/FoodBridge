import type { User } from "@/lib/types";
import DonationMap from "./donation-map";

export default function DistributorDashboard({ user }: { user: User }) {
  return (
    <div className="space-y-6 h-full flex flex-col">
       <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Find Donations Near You</h1>
        <p className="text-muted-foreground">Explore the map to discover available food donations in your area.</p>
      </div>
      <div className="flex-grow min-h-[400px]">
        <DonationMap />
      </div>
    </div>
  );
}
