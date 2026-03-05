/**
 * Phase 2 – Server-Sent Events (SSE)
 *
 * GET /api/events
 *
 * Clients subscribe to a persistent stream and receive push events whenever
 * a donation status changes.  In a multi-process deployment you would use
 * Redis Pub/Sub here; for the current single-process dev setup a module-level
 * Map is sufficient.
 *
 * Usage (browser):
 *   const es = new EventSource("/api/events");
 *   es.addEventListener("donation_claimed", e => { ... JSON.parse(e.data) ... });
 *   es.addEventListener("donation_completed", e => { ... });
 *   es.addEventListener("new_donation", e => { ... });
 */

import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

// ── In-process subscriber registry ──────────────────────────────────────────
// Maps userId → Set of controller send-functions
type Sender = (event: string, data: object) => void;
const subscribers = new Map<string, Set<Sender>>();

export function broadcast(
  eventType: string,
  payload: object,
  targetRole?: "donor" | "distributor" | "admin" | "all",
) {
  // If no targeting, push to everyone
  subscribers.forEach((senders) => {
    senders.forEach((send) => {
      try {
        send(eventType, payload);
      } catch {
        // connection may already be closed; ignore
      }
    });
  });
}

// ── SSE route ────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic"; // never cache

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper: write a named SSE event
      const send: Sender = (event, data) => {
        const msg =
          `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(msg));
      };

      // Register subscriber
      if (!subscribers.has(userId)) {
        subscribers.set(userId, new Set());
      }
      subscribers.get(userId)!.add(send);

      // Send initial "connected" event
      send("connected", { userId, timestamp: new Date().toISOString() });

      // Heartbeat every 25 s to keep the connection alive through proxies
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Cleanup on disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        subscribers.get(userId)?.delete(send);
        if (subscribers.get(userId)?.size === 0) {
          subscribers.delete(userId);
        }
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection:      "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}
