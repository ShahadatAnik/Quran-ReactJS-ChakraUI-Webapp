import { Check, Copy } from "lucide-react"
import type { ComponentProps } from "react"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"

interface CopyButtonProps extends Omit<ComponentProps<typeof Button>, "onClick" | "value"> {
  value: string
  label?: string
  successMessage?: string
}

export function CopyButton({
  value,
  label = "Copy",
  successMessage,
  variant = "outline",
  size = "sm",
  ...props
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={!value}
      onClick={() => copy(value, successMessage)}
      {...props}
    >
      {copied ? <Check className="text-primary" /> : <Copy />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </Button>
  )
}
