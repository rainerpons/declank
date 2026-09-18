
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
    <select
      id={id}
      value={value}
      disabled={disabled}
      aria-label={props["aria-label"]}
      onChange={(e) => onValueChange(e.target.value)}
      className="
        h-9 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1
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
  );
}
