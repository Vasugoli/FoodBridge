/**
 * In-process SSE subscriber registry.
 *
 * Centralises the broadcast() function and subscriber Map so that:
 *   - API route files don't need to export non-HTTP symbols (which breaks
 *     Next.js route type checks).
 *   - Any server-side module can push events without importing the route file.
 *
 * In a multi-process deployment (e.g. multiple Vercel instances) this should
 * be replaced with Redis Pub/Sub; for the current single-process setup a
 * module-level Map is sufficient.
 */

type Sender = (event: string, data: object) => void;
export type Subscriber = { role: string; send: Sender };

/** userId → Set<Subscriber> */
export const subscribers = new Map<string, Set<Subscriber>>();

/**
 * Push a named SSE event to all currently connected clients.
 *
 * @param eventType  - The SSE event name (e.g. "new_donation").
 * @param payload    - Data serialised as JSON and sent in the `data:` field.
 * @param targetRole - When provided, only subscribers with a matching role
 *                     receive the event.  Omit (or pass "all") to broadcast
 *                     to every connected user.
 */
export function broadcast(
  eventType: string,
  payload: object,
  targetRole?: "donor" | "distributor" | "admin" | "all",
): void {
  subscribers.forEach((subs) => {
    subs.forEach(({ role, send }) => {
      if (!targetRole || targetRole === "all" || role === targetRole) {
        try {
          send(eventType, payload);
        } catch {
          // Connection may already be closed — ignore.
        }
      }
    });
  });
}
