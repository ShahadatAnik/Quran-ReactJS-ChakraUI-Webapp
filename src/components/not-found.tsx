import { Link } from "@tanstack/react-router"
import { ArrowLeft, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty"
import { appPages } from "@/lib/pages"

export function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 items-center px-4 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Compass />
          </EmptyMedia>
          <p className="text-6xl leading-none font-semibold tracking-tight text-gold">404</p>
          <h1 data-slot="empty-title" className="font-heading text-lg font-medium tracking-tight">
            This page doesn't exist
          </h1>
          <EmptyDescription>
            The page you're looking for doesn't exist or has moved. Surahs live at addresses like
            /surah/36. Try one of these instead.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex flex-wrap justify-center gap-2">
            {appPages.slice(0, 4).map((page) => (
              <Button key={page.path} variant="outline" size="sm" asChild>
                <Link {...page.link}>
                  <page.icon />
                  {page.title}
                </Link>
              </Button>
            ))}
          </div>
          <Button asChild>
            <Link to="/">
              <ArrowLeft />
              Back to home
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
