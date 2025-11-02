"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockDonations } from "@/lib/placeholder-data";
import type { Donation } from "@/lib/types";

interface LeafletMapProps {
	donations?: Donation[];
}

export default function LeafletMap({
	donations = mockDonations,
}: LeafletMapProps) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<L.Map | null>(null);
	const markersRef = useRef<L.Marker[]>([]);

	// Create a unique container ID that persists across renders but not remounts
	const containerId = useMemo(
		() => `map-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		[]
	);

	// Filter available donations
	const availableDonations = useMemo(
		() => donations.filter((d) => d.status === "available"),
		[donations]
	);

	// Create custom icon with CDN paths (more reliable than local imports)
	const defaultIcon = useMemo(
		() =>
			new L.Icon({
				iconUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
				iconRetinaUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
				shadowUrl:
					"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41],
			}),
		[]
	);

	useEffect(() => {
		if (!mapContainerRef.current || mapInstanceRef.current) {
			return;
		}

		// Default center (Anytown, USA)
		const center: [number, number] = [34.0522, -118.2437];

		// Create the map
		const map = L.map(mapContainerRef.current, {
			center,
			zoom: 12,
			scrollWheelZoom: false,
		});

		// Add tile layer
		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		mapInstanceRef.current = map;

		// Cleanup on unmount
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, []);

	// Update markers when donations change
	useEffect(() => {
		if (!mapInstanceRef.current) {
			return;
		}

		const map = mapInstanceRef.current;

		// Clear existing markers
		markersRef.current.forEach((marker) => {
			map.removeLayer(marker);
		});
		markersRef.current = [];

		// Add markers for available donations
		availableDonations.forEach((donation) => {
			const marker = L.marker(
				[donation.location.lat, donation.location.lng],
				{ icon: defaultIcon }
			).addTo(map);

			const expiryDate =
				typeof donation.expiry === "string"
					? new Date(donation.expiry).toLocaleDateString()
					: donation.expiry.toLocaleDateString();

			marker.bindPopup(`
				<div style="padding: 8px; min-width: 200px;">
					<h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
						${donation.title}
					</h3>
					<p style="font-size: 12px; color: #666; margin-bottom: 8px;">
						${donation.description}
					</p>
					<div style="font-size: 12px;">
						<p><strong>Quantity:</strong> ${donation.quantity}</p>
						<p><strong>Location:</strong> ${donation.location.address}</p>
						<p><strong>Expires:</strong> ${expiryDate}</p>
					</div>
				</div>
			`);

			markersRef.current.push(marker);
		});
	}, [availableDonations, defaultIcon]);

	return (
		<div
			id={containerId}
			ref={mapContainerRef}
			className="h-full w-full rounded-lg"
			style={{ minHeight: "400px" }}
		/>
	);
}
