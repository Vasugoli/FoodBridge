import { redirect } from "next/navigation";

export default function DistributionsRedirect() {
	// Treat "distributions" as an alias for claims
	redirect("/dashboard/claims");
}
