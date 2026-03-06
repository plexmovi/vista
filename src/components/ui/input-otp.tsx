import { useState, useRef } from 'react';
import { cn } from '../../lib/utils';

interface InputOTPProps {
  maxLength?: number;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function InputOTP({ maxLength = 6, value, onChange, className }: InputOTPProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, maxLength);
    onChange(pastedData);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        maxLength={maxLength}
        value={value}
        onChange={(e) => {
          const newValue = e.target.value.replace(/\D/g, '').slice(0, maxLength);
          onChange(newValue);
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPaste={handlePaste}
        className="absolute opacity-0 pointer-events-none"
        style={{ position: 'absolute', left: '-9999px' }}
      />

      <div
        onClick={handleContainerClick}
        className="flex items-center justify-center gap-2"
      >
        {Array.from({ length: maxLength }).map((_, index) => {
          const digit = value[index];
          const isFilled = !!digit;
          const isActive = isFocused && inputRef.current?.selectionStart === index;

          return (
            <div
              key={index}
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

export function InputOTPGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center", className)} {...props} />;
}

export function InputOTPSlot({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-12 items-center justify-center border-2 border-slate-600 rounded-lg bg-slate-800",
        className
      )}
      {...props}
    />
  );
}

export function InputOTPSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center", className)} {...props} />;
}
