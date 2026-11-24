import { Popover } from '@base-ui/react/popover'
import type { ReactNode } from 'react'
import { TOOLTIP_CLASS } from '@/components/ui/tooltip'

/**
 * A word or phrase with a dotted underline that explains itself when pointed at or tapped, for
 * play-call names such as "12 personnel" or "Cover 3".
 */
export function Term({ children, explanation }: { children: ReactNode; explanation: ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger
        openOnHover
        delay={200}
        render={
          <button
            type="button"
            className="decoration-muted-foreground/70 hover:decoration-foreground cursor-help underline decoration-dotted underline-offset-4"
          />
        }
      >
        {children}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="top" sideOffset={6} className="z-50">
          <Popover.Popup className={`${TOOLTIP_CLASS} max-w-72 text-sm`}>
            {explanation}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
