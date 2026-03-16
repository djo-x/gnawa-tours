import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

export interface TestimonialAuthor {
  name: string
  location?: string
  handle?: string
  // avatar is kept for compatibility but not rendered
  avatar?: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  rating?: number
  className?: string
}

export function TestimonialCard({
  author,
  text,
  href,
  rating,
  className,
}: TestimonialCardProps) {
  const CardRoot = href ? "a" : "div"
  const safeName = author.name ?? "Voyageur"
  const displayRating = typeof rating === "number" && rating > 0

  return (
    <CardRoot
      {...(href ? { href, target: "_blank", rel: "noreferrer" } : {})}
      className={cn(
        "group flex max-w-[320px] flex-col rounded-2xl border border-ivory/20 bg-ivory/3 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-ivory/35 hover:bg-ivory/6 hover:shadow-[0_26px_80px_rgba(0,0,0,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight",
        href && "cursor-pointer",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-ivory">{safeName}</h3>
        {(author.location || author.handle) && (
          <p className="text-xs text-ivory/60">
            {author.location}
            {author.location && author.handle && " · "}
            {author.handle}
          </p>
        )}
      </div>

      {displayRating && (
        <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: Math.min(5, rating ?? 0) }).map((_, i) => (
            <Star
              key={i}
              className="h-3.5 w-3.5 fill-gold text-gold"
            />
          ))}
        </div>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ivory/75">
        “{text}”
      </p>
    </CardRoot>
  )
}

