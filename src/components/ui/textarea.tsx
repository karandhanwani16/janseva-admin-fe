import * as React from "react"

import { cn } from "@/lib/utils"
import { useTheme } from "@/store/useTheme";
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {

  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <textarea
      className={cn(
        `flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${isDarkMode ? "bg-zinc-800" : ""}`,
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
