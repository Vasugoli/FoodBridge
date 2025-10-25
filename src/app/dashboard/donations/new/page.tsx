import DonationForm from "@/components/dashboard/donor/donation-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewDonationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Post a New Donation</CardTitle>
          <CardDescription>
            Fill out the details below to make your surplus food available to distributors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DonationForm />
        </CardContent>
      </Card>
    </div>
  );
}
