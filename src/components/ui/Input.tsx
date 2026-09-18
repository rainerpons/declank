import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, ...props }, ref) => {
    const isNumber = props.type === "number";
    const internalRef = React.useRef<HTMLInputElement>(null);

    const combinedRef = (node: HTMLInputElement) => {
      internalRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    };

    const handleStep = (direction: "up" | "down", e: React.MouseEvent) => {
      e.preventDefault();
      const input = internalRef.current;
      if (input) {
        if (direction === "up") input.stepUp();
        else input.stepDown();

        if (props.onChange) {
          props.onChange({
            target: input,
            currentTarget: input,
            type: "change",
          } as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      }
    };

    return (
      <div className="inline-flex flex-col">
        <div className="relative inline-flex items-center">
          <input
            ref={combinedRef}
            className={`
              h-9 w-20 rounded-md border bg-white dark:bg-slate-900 pl-3 ${isNumber ? "pr-8" : "pr-3"} py-1
              text-sm shadow-sm transition-colors
              focus:outline-none focus:ring-1 focus:ring-blue-500
              disabled:cursor-not-allowed disabled:opacity-50
              ${isNumber ? "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0" : ""}
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-slate-700 focus:border-blue-500"}
              ${className}
            `}
            {...props}
          />
          {isNumber && !props.disabled && (
            <div className="absolute right-1 flex flex-col items-center justify-center space-y-[1px]">
              <button
                type="button"
                tabIndex={-1}
                className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 flex h-3.5 w-5 items-center justify-center rounded-sm hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={(e) => handleStep("up", e)}
                aria-label="Increase"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
              </button>
              <button
                type="button"
                tabIndex={-1}
                className="text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-300 flex h-3.5 w-5 items-center justify-center rounded-sm hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={(e) => handleStep("down", e)}
                aria-label="Decrease"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </button>
            </div>
          )}
        </div>
        {error && (
          <span className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
