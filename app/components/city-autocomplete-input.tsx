'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';

type CityAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  onErrorReset?: () => void;
  placeholder?: string;
  className?: string;
};

export default function CityAutocompleteInput({
  value,
  onChange,
  onErrorReset,
  placeholder,
  className = '',
}: CityAutocompleteInputProps) {
  return (
    <div className={`relative ${className}`.trim()}>
      <div className="relative z-40 overflow-hidden rounded-[24px] border border-white/[0.14] bg-[#1A1B1D] transition-colors focus-within:border-white/[0.24]">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            strokeWidth={1.9}
            className="h-[1.05rem] w-[1.05rem] shrink-0 text-white/45"
          />
          <input
            type="text"
            value={value}
            onChange={(event) => {
              onErrorReset?.();
              onChange(event.target.value);
            }}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full bg-transparent text-base text-white placeholder:text-white/35 outline-none focus:outline-none focus:ring-0"
          />
        </div>
      </div>
    </div>
  );
}
