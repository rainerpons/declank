
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  id,
  disabled = false,
  ...props
}: SelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        id={id}
        value={value}
        disabled={disabled}
        aria-label={props["aria-label"]}
        onChange={(e) => onValueChange(e.target.value)}
        className="
          appearance-none h-9 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-3 pr-9 py-1
          text-sm shadow-sm transition-colors
          focus:border-blue-500 focus:outline-none focus:ring-1
          focus:ring-blue-500
          disabled:cursor-not-allowed disabled:opacity-50
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 flex items-center justify-center text-gray-400 dark:text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
}
