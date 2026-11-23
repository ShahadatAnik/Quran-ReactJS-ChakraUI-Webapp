import { type ErrorComponentProps, Link, useRouter } from "@tanstack/react-router"
import { RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <TriangleAlert />
          </EmptyMedia>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>
            {import.meta.env.DEV && error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button
            onClick={() => {
              reset()
              void router.invalidate()
            }}
          >
            <RefreshCw />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
