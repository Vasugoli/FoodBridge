import { HandHeart } from 'lucide-react';

export function Logo({ className, showName = true }: { className?: string, showName?: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xl font-bold ${className}`}>
      <HandHeart className="h-6 w-6 text-primary" />
      {showName && <span className="font-headline">FoodBridge</span>}
    </div>
  );
}
