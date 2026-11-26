import { cn } from "cn"
import type * as React from "react"

/**
 * A softly pulsing block standing in for content that is still loading. Shape it like the
 * content (a line of text, a tile, a button) so nothing jumps when the content arrives.
 * Hidden from screen readers: the container marks itself aria-busy instead.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-foreground/10 motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  )
}

/**
 * Text standing in for text that is still loading: put it inside the same element, with the
 * same classes, as the real text, with words of about the same length. It takes exactly the
 * lines the real text will take (it is laid out as text), drawn as a pulsing bar on each line.
 */
function SkeletonText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="skeleton-text"
      aria-hidden="true"
      className={cn("skeleton-text", className)}
      {...props}
    />
  )
}

export { Skeleton, SkeletonText }
