"use client";

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/*
  This is a placeholder for the interactive map.
  To implement the real map, you would:
  1. Install Leaflet and React-Leaflet:
     npm install leaflet react-leaflet
     npm install -D @types/leaflet
  2. Import the necessary components and Leaflet's CSS:
     import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
     import 'leaflet/dist/leaflet.css';
  3. Replace the placeholder Image with the MapContainer component.
  4. Dynamically create Marker components by mapping over donation data.
  5. Note: Since react-leaflet components can have issues with SSR in Next.js,
     you might need to dynamically import the map component with ssr: false.
     e.g., const Map = dynamic(() => import('@/components/map'), { ssr: false });
*/

export default function DonationMap() {
  const mapPlaceholder = PlaceHolderImages.find((img) => img.id === 'map-placeholder');

  return (
    <Card className="h-full w-full shadow-lg">
      <CardContent className="p-0 h-full relative">
        {mapPlaceholder ? (
          <Image
            src={mapPlaceholder.imageUrl}
            alt={mapPlaceholder.description}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
            data-ai-hint={mapPlaceholder.imageHint}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted rounded-lg">
            <p className="text-muted-foreground">Map placeholder image not found.</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
            <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg">
                <h3 className="text-xl font-bold text-foreground">Interactive Map Coming Soon</h3>
                <p className="text-muted-foreground">This will be replaced by a live map of donations.</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
