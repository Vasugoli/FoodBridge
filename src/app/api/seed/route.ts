import { NextResponse } from "next/server";
import { seedSampleData } from "@/lib/db";

export async function POST() {
	try {
		const result = await seedSampleData();
		return NextResponse.json({ ok: true, result });
	} catch (err: any) {
		return NextResponse.json(
			{ ok: false, error: err?.message || String(err) },
			{ status: 500 }
		);
	}
}

export async function GET() {
	return NextResponse.json({
		message: "POST to this endpoint to seed sample data",
	});
}
