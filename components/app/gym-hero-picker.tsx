"use client";

import { EVENT_PLACEHOLDERS } from "@/lib/placeholders";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/app/image-upload";

interface GymHeroPickerProps {
  value?: string;
  onChange: (value: string) => void;
}

export function GymHeroPicker({ value, onChange }: GymHeroPickerProps) {
  return (
    <div className="space-y-4">
      <ImageUpload label="Upload hero image" value={value} onChange={onChange} />
      <div>
        <p className="text-xs uppercase text-muted">Or choose a default</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EVENT_PLACEHOLDERS.map((imageUrl) => (
            <button
              key={imageUrl}
              type="button"
              onClick={() => onChange(imageUrl)}
              className={cn(
                "group relative h-20 overflow-hidden rounded-lg border border-white/10",
                value === imageUrl && "ring-2 ring-emberGlow"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Gym hero option" className="h-full w-full object-cover transition group-hover:scale-105" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
