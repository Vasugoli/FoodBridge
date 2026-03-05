"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSSE } from "./use-sse";

export type NotificationType =
	| "new_donation"
	| "donation_claimed"
	| "donation_completed"
	| "donation_expired"
	| "system";

export interface AppNotification {
	id: string;
	type: NotificationType;
	title: string;
	body: string;
	timestamp: string;  // ISO string
	read: boolean;
}

const STORAGE_KEY = "fb_notifications";
const MAX_NOTIFICATIONS = 30;

function loadFromStorage(): AppNotification[] {
	if (typeof window === "undefined") return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
	} catch {
		return [];
	}
}

function saveToStorage(notifs: AppNotification[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
	} catch { /* quota exceeded — ignore */ }
}

function eventToNotification(type: string, data: any): AppNotification | null {
	const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	const timestamp = data.timestamp || new Date().toISOString();

	switch (type) {
		case "new_donation":
			return {
				id, type: "new_donation", timestamp, read: false,
				title: "New Donation Available",
				body: data.donationTitle
					? `"${data.donationTitle}" was just posted.`
					: "A new donation has been posted nearby.",
			};
		case "donation_claimed":
			return {
				id, type: "donation_claimed", timestamp, read: false,
				title: "Donation Claimed",
				body: data.donorTitle
					? `Your donation "${data.donorTitle}" was claimed by ${data.distributorName ?? "a distributor"}.`
					: data.donationTitle
						? `"${data.donationTitle}" was claimed by ${data.distributorName ?? "a distributor"}.`
						: "A donation has been claimed.",
			};
		case "donation_completed":
			return {
				id, type: "donation_completed", timestamp, read: false,
				title: "Donation Completed ✅",
				body: data.donationTitle
					? `"${data.donationTitle}" has been delivered.`
					: "A donation delivery was marked complete.",
			};
		case "donation_expired":
			return {
				id, type: "donation_expired", timestamp, read: false,
				title: "Donation Expired ⚠️",
				body: data.donationTitle
					? `"${data.donationTitle}" has expired without being claimed.`
					: "A donation expired without being claimed.",
			};
		default:
			return null;
	}
}

export function useNotifications() {
	const [notifications, setNotifications] = useState<AppNotification[]>(() =>
		loadFromStorage(),
	);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const push = useCallback((notif: AppNotification) => {
		setNotifications((prev) => {
			const next = [notif, ...prev].slice(0, MAX_NOTIFICATIONS);
			saveToStorage(next);
			return next;
		});
	}, []);

	const markAllRead = useCallback(() => {
		setNotifications((prev) => {
			const next = prev.map((n) => ({ ...n, read: true }));
			saveToStorage(next);
			return next;
		});
	}, []);

	const clearAll = useCallback(() => {
		setNotifications([]);
		saveToStorage([]);
	}, []);

	useSSE(useCallback((type, data) => {
		const notif = eventToNotification(type, data as any);
		if (notif) push(notif);
	}, [push]));

	return { notifications, unreadCount, markAllRead, clearAll };
}
