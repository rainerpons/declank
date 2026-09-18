import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    return (
      <div className="inline-flex flex-col">
        <input
          ref={ref}
          className={`
            h-9 w-20 rounded-md border bg-white dark:bg-slate-900 px-3 py-1
            text-sm shadow-sm transition-colors
            focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-slate-700 focus:border-blue-500"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
