import { cn } from '@/lib/utils'

/**
 * A labelled menu whose first option, "Any" unless `anyLabel` says otherwise, leaves the choice
 * open (`undefined`).
 */
export function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
  anyLabel = 'Any',
  inline = false,
}: {
  label: string
  anyLabel?: string
  /** Puts the label beside the menu instead of above it. */
  inline?: boolean
  value: T | undefined
  options: [T, string][]
  onChange(value: T | undefined): void
}) {
  return (
    <label
      className={cn('flex text-sm font-medium', inline ? 'items-center gap-2' : 'flex-col gap-1')}
    >
      {label}
      <select
        className="bg-background min-h-11 rounded-lg border px-2 text-sm font-normal"
        value={value ?? ''}
        onChange={(e) => onChange((e.target.value || undefined) as T | undefined)}
      >
        <option value="">{anyLabel}</option>
        {options.map(([v, name]) => (
          <option key={v} value={v}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
