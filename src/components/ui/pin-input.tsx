import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PinInput({ length = 6, value, onChange, className }: PinInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when clicking anywhere on the container
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    onChange(pastedData);
  };

  // Handle individual slot clicks
  const handleSlotClick = (index: number) => {
    inputRef.current?.focus();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={length}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value.replace(/\D/g, '').slice(0, length);
          onChange(newValue);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        className="absolute opacity-0 pointer-events-none"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="flex items-center justify-center gap-2"
      >
        {Array.from({ length }).map((_, index) => {
          const digit = value[index];
          const isFilled = !!digit;
          const isActive = isFocused && inputRef.current?.selectionStart === index;

          return (
            <div
              key={index}
              onClick={() => handleSlotClick(index)}
              className={cn(
                "relative flex h-14 w-12 items-center justify-center border-2 rounded-lg bg-slate-800 transition-all duration-200 cursor-pointer",
                isActive && "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 border-blue-500",
                !isActive && "border-slate-600 hover:border-slate-500",
                isFilled && !isActive && "border-green-500/50 bg-green-500/10"
              )}
            >
              <span className="text-2xl font-bold text-white">
                {digit || (isActive ? '|' : '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
