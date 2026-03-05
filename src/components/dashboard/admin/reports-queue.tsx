"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ShieldAlert, RefreshCw, Eye, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface Report {
	_id?: string;
	donationId: string;
	donationTitle?: string;
	reporterId?: string;
	reporterName?: string;
	reason: string;
	createdAt: string;
}

export default function AdminReportsQueue() {
	const [reports, setReports] = useState<Report[]>([]);
	const [loading, setLoading] = useState(true);
	const [acting, setActing] = useState<string | null>(null);
	const { toast } = useToast();

	async function fetchReports() {
		setLoading(true);
		try {
			const res = await fetch("/api/admin/reports");
			if (!res.ok) throw new Error("Failed to load reports");
			const data = await res.json();
			setReports(data.reports ?? []);
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Could not load reports", variant: "destructive" });
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => { fetchReports(); }, []);

	async function handleAction(donationId: string, action: "unhide" | "dismiss") {
		setActing(`${action}-${donationId}`);
		try {
			const res = await fetch("/api/admin/reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ donationId, action }),
			});
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed");
			toast({ title: action === "unhide" ? "Donation restored" : "Reports dismissed", description: "Action completed." });
			await fetchReports();
		} catch (err) {
			toast({ title: "Error", description: err instanceof Error ? err.message : "Action failed", variant: "destructive" });
		} finally {
			setActing(null);
		}
	}

	// Group reports by donationId to show aggregate counts
	const grouped = reports.reduce<Record<string, { reports: Report[]; donationTitle: string }>>((acc, r) => {
		if (!acc[r.donationId]) {
			acc[r.donationId] = { reports: [], donationTitle: r.donationTitle ?? r.donationId };
		}
		acc[r.donationId].reports.push(r);
		return acc;
	}, {});

	return (
		<Card>
			<CardHeader>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='flex items-center gap-2'>
							<ShieldAlert className='h-5 w-5 text-red-500' />
							Reports Queue
						</CardTitle>
						<CardDescription>
							Review flagged donations. Donations with 3+ reports are hidden automatically.
						</CardDescription>
					</div>
					<Button variant='outline' size='sm' onClick={fetchReports} disabled={loading} className='gap-2'>
						<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Refresh
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{loading ? (
					<div className='flex items-center justify-center py-12 gap-2 text-muted-foreground'>
						<Loader2 className='h-5 w-5 animate-spin' />
						Loading reports…
					</div>
				) : Object.keys(grouped).length === 0 ? (
					<p className='text-center text-muted-foreground py-12'>No reports at this time. 🎉</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Donation</TableHead>
								<TableHead>Reports</TableHead>
								<TableHead>Latest Reason</TableHead>
								<TableHead>Latest Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead><span className='sr-only'>Actions</span></TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Object.entries(grouped).map(([donationId, { reports: dReports, donationTitle }]) => {
								const latest = dReports[0];
								const count = dReports.length;
								const isHidden = count >= 3;
								return (
									<TableRow key={donationId}>
										<TableCell className='font-medium max-w-[200px] truncate' title={donationTitle}>
											{donationTitle}
										</TableCell>
										<TableCell>
											<Badge variant={isHidden ? "destructive" : "secondary"}>
												{count} report{count !== 1 ? "s" : ""}
											</Badge>
										</TableCell>
										<TableCell className='max-w-[200px] text-sm text-muted-foreground truncate' title={latest.reason}>
											{latest.reason}
										</TableCell>
										<TableCell className='text-sm text-muted-foreground'>
											{formatDistanceToNow(new Date(latest.createdAt), { addSuffix: true })}
										</TableCell>
										<TableCell>
											{isHidden ? (
												<Badge variant='destructive'>Hidden</Badge>
											) : (
												<Badge variant='outline'>Visible</Badge>
											)}
										</TableCell>
										<TableCell>
											<div className='flex gap-2'>
												{isHidden && (
													<Button
														size='sm'
														variant='outline'
														disabled={acting === `unhide-${donationId}`}
														onClick={() => handleAction(donationId, "unhide")}
														className='gap-1 text-xs'>
														{acting === `unhide-${donationId}` ? <Loader2 className='h-3 w-3 animate-spin' /> : <Eye className='h-3 w-3' />}
														Restore
													</Button>
												)}
												<Button
													size='sm'
													variant='outline'
													disabled={acting === `dismiss-${donationId}`}
													onClick={() => handleAction(donationId, "dismiss")}
													className='gap-1 text-xs text-red-600 hover:text-red-700 hover:border-red-300'>
													{acting === `dismiss-${donationId}` ? <Loader2 className='h-3 w-3 animate-spin' /> : <Trash2 className='h-3 w-3' />}
													Dismiss
												</Button>
											</div>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
