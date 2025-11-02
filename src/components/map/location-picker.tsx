"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Coordinates = { lat: number; lng: number };

export interface LocationValue extends Coordinates {
	address?: string;
}

interface LocationPickerProps {
	value?: LocationValue;
	onChange?: (value: LocationValue) => void;
	className?: string;
	height?: number;
}

export default function LocationPicker({
	value,
	onChange,
	className,
	height = 320,
}: LocationPickerProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const mapRef = useRef<L.Map | null>(null);
	const markerRef = useRef<L.Marker | null>(null);
	const [selected, setSelected] = useState<LocationValue | undefined>(value);

	// Default center (fallback): LA
	const defaultCenter: [number, number] = [34.0522, -118.2437];

	// Create a default icon via CDN to avoid bundling issues
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

	// Initialize the map only once
	useEffect(() => {
		if (!containerRef.current || mapRef.current) return;

		const map = L.map(containerRef.current, {
			center: value ? [value.lat, value.lng] : defaultCenter,
			zoom: 12,
			scrollWheelZoom: false,
		});

		L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		// Place initial marker if value exists
		if (value) {
			const m = L.marker([value.lat, value.lng], {
				icon: defaultIcon,
			}).addTo(map);
			markerRef.current = m;
		}

		// Click handler to set marker and update state
		function onClick(e: L.LeafletMouseEvent) {
			const { lat, lng } = e.latlng;
			if (markerRef.current) {
				markerRef.current.setLatLng([lat, lng]);
			} else {
				markerRef.current = L.marker([lat, lng], {
					icon: defaultIcon,
				}).addTo(map);
			}
			// Optimistically set without address, then reverse geocode
			const next: LocationValue = { lat, lng };
			setSelected(next);
			onChange?.(next);
			// Reverse geocode (best-effort)
			reverseGeocode(lat, lng).then((address) => {
				const enriched: LocationValue = { lat, lng, address };
				setSelected(enriched);
				onChange?.(enriched);
			});
		}

		map.on("click", onClick);
		mapRef.current = map;

		return () => {
			map.off("click", onClick);
			map.remove();
			mapRef.current = null;
			markerRef.current = null;
		};
	}, [defaultCenter, defaultIcon, value]);

	// Optionally center on browser location
	async function useMyLocation() {
		if (!navigator.geolocation || !mapRef.current) return;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude: lat, longitude: lng } = pos.coords;
				mapRef.current!.setView([lat, lng], 14);
				if (markerRef.current) {
					markerRef.current.setLatLng([lat, lng]);
				} else {
					markerRef.current = L.marker([lat, lng], {
						icon: defaultIcon,
					}).addTo(mapRef.current!);
				}
				const next: LocationValue = { lat, lng };
				setSelected(next);
				onChange?.(next);
				reverseGeocode(lat, lng).then((address) => {
					const enriched: LocationValue = { lat, lng, address };
					setSelected(enriched);
					onChange?.(enriched);
				});
			},
			() => {
				// ignore errors silently
			}
		);
	}

	return (
		<div className={className}>
			<div
				ref={containerRef}
				className='w-full rounded-md border'
				style={{ minHeight: `${height}px` }}
			/>
			<div className='mt-2 text-sm text-muted-foreground flex items-center justify-between'>
				<div>
					{selected ? (
						<span>
							Selected: {selected.lat.toFixed(5)},{" "}
							{selected.lng.toFixed(5)}
							{selected.address ? ` • ${selected.address}` : ""}
						</span>
					) : (
						<span>
							Click on the map to choose a pickup location.
						</span>
					)}
				</div>
				<button
					type='button'
					className='underline'
					onClick={useMyLocation}>
					Use my location
				</button>
			</div>
		</div>
	);
}

async function reverseGeocode(
	lat: number,
	lng: number
): Promise<string | undefined> {
	try {
		const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
		const res = await fetch(url, {
			headers: {
				Accept: "application/json",
				"User-Agent": "FoodBridge/1.0 (contact@foodbridge.local)",
			},
		});
		if (!res.ok) return undefined;
		const data = await res.json();
		return data?.display_name as string | undefined;
	} catch {
		return undefined;
	}
}
