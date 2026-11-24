import type { ReactElement, ReactNode } from 'react'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'

import { cn } from '@/lib/utils'

/** The look shared by tooltips and hover cards on the site. */
export const TOOLTIP_CLASS =
  'bg-popover text-popover-foreground max-w-64 rounded-md border px-2.5 py-1.5 text-xs shadow-md'

/**
 * Shows `content` above `trigger` while it is pointed at or focused. Touch screens have no hover,
 * so put anything a phone reader needs somewhere else as well.
 */
function Tooltip({
  trigger,
  content,
  children,
  disabled = false,
  className,
}: {
  /** The element that opens the tooltip; `children` go inside it. */
  trigger: ReactElement
  content: ReactNode
  children?: ReactNode
  disabled?: boolean
  className?: string
}) {
  return (
    <TooltipPrimitive.Root disabled={disabled}>
      <TooltipPrimitive.Trigger render={trigger} delay={250}>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side="top" sideOffset={6} className="z-50">
          <TooltipPrimitive.Popup className={cn(TOOLTIP_CLASS, className)}>
            {content}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export { Tooltip }
