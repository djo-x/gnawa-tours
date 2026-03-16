import { cn } from "@/lib/utils"
import type { TestimonialAuthor } from "@/components/ui/testimonial-card"
import { TestimonialCard } from "@/components/ui/testimonial-card"
import { useEffect, useState } from "react"

interface TestimonialsSectionProps {
  title: string
  description?: string
  testimonials: Array<{
    author: TestimonialAuthor
    text: string
    href?: string
    rating?: number
  }>
  className?: string
}

export function TestimonialsSection({
  title,
  description,
  testimonials,
  className,
}: TestimonialsSectionProps) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = () => setReducedMotion(media.matches)
    handler()
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  const safeTestimonials =
    testimonials.length > 0
      ? testimonials
      : [
          {
            author: {
              name: "Voyageuse anonyme",
              location: "Sahara algérien",
            },
            text: "Une traversée du désert comme un rêve éveillé – dunes dorées, nuits étoilées et accueil touareg inoubliable.",
            rating: 5,
          },
        ]

  const repeatedSets = reducedMotion ? 1 : 3

  return (
    <section
      className={cn(
        "relative border-t border-ivory/10 bg-[radial-gradient(circle_at_10%_0%,rgba(215,180,124,0.22),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(124,135,150,0.2),transparent_55%),linear-gradient(180deg,#0b0b0d,rgba(6,6,10,1))] py-16 sm:py-24",
        className,
      )}
      aria-labelledby="temoignages-heading"
    >
      <div className="section-ornament" aria-hidden="true" />
      <div className="section-ornament section-ornament--bottom" aria-hidden="true" />

      <div className="mx-auto max-w-container px-6">
        <div className="mb-10 flex flex-col items-center gap-4 text-center sm:mb-14">
          <p className="eyebrow text-ivory/65">Récits venus des dunes</p>
          <h2
            id="temoignages-heading"
            className="font-heading text-3xl font-bold uppercase tracking-[0.08em] text-ivory sm:text-4xl md:text-5xl"
          >
            {title}
          </h2>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-ivory/70 sm:text-base">
              {description}
            </p>
          )}
        </div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-midnight via-midnight/50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-midnight via-midnight/50 to-transparent" />

          <div
            className={cn(
              "flex w-full flex-row items-stretch gap-4 py-2",
              !reducedMotion && "animate-marquee [--duration:40s] [--gap:1.25rem]",
            )}
          >
            {Array.from({ length: repeatedSets }).map((_, setIndex) =>
              safeTestimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={`${setIndex}-${i}-${testimonial.author.name}`}
                  {...testimonial}
                  className="min-w-[260px] sm:min-w-[280px] md:min-w-[320px]"
                />
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

