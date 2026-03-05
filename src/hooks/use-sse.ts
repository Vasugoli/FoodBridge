"use client";
import { useEffect, useRef, useCallback } from "react";

export type SSEHandler = (type: string, data: unknown) => void;

/**
 * Connects to /api/events and calls `onEvent` whenever a named event arrives.
 * Automatically reconnects on error with exponential back-off (max 30 s).
 * The connection is torn down when the component unmounts.
 */
export function useSSE(onEvent: SSEHandler) {
	const handlerRef = useRef<SSEHandler>(onEvent);
	const retryRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
	const esRef      = useRef<EventSource | null>(null);

	// Keep handler ref fresh without triggering reconnect
	useEffect(() => {
		handlerRef.current = onEvent;
	});

	const connect = useCallback(() => {
		if (typeof window === "undefined") return;

		const es = new EventSource("/api/events");
		esRef.current = es;
		let delay = 1000; // initial back-off

		const listen = (type: string) =>
			es.addEventListener(type, (e: MessageEvent) => {
				try {
					const data = JSON.parse(e.data);
					handlerRef.current(type, data);
				} catch {
					handlerRef.current(type, e.data);
				}
			});

		// Built-in event types
		listen("connected");
		listen("new_donation");
		listen("donation_claimed");
		listen("donation_completed");
		listen("donation_expired");

		es.onerror = () => {
			es.close();
			delay = Math.min(delay * 2, 30_000);
			retryRef.current = setTimeout(() => connect(), delay);
		};
	}, []);

	useEffect(() => {
		connect();
		return () => {
			esRef.current?.close();
			if (retryRef.current) clearTimeout(retryRef.current);
		};
	}, [connect]);
}
