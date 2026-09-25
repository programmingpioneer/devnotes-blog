"use client";

import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    { label, error, hint, className, id, type, ...props },
    ref
  ) {
    const [show, setShow] = useState(false);
    const fieldId =
      id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";
    const inputType = isPassword && show ? "text" : type;

    return (
      <div className="space-y-1.5">
        <label htmlFor={fieldId} className="block text-sm font-medium">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={inputType}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={cn(
              "block w-full rounded-md border bg-background px-3 py-2 text-sm outline-none transition-colors",
              "focus:border-accent focus:ring-2 focus:ring-accent/20",
              isPassword && "pr-16",
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-border",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              {show ? "Hide" : "Show"}
            </button>
          )}
        </div>
        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-red-500">
            {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

export default FormField;