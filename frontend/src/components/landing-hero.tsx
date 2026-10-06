"use client"

import * as React from "react"
import { Sparkles, ArrowRight, Play } from "lucide-react"
import { Meteors } from "@/components/ui/meteors"
import { OrigamiPlanes } from "@/components/ui/origami-planes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// pre-canned outline used in the sample plan section below the hero
type WeekPlan = { week: number; title: string; bullets: string[] }
type Outline = { topic: string; weeks: WeekPlan[] }

// dark-mode sample, python / data analysis vibe to match the meteor backdrop
const sampleOutlineDark: Outline = {
  topic: "Sample: Python for data analysis",
  weeks: [
    { week: 1, title: "Setup & syntax", bullets: ["Install Python + Jupyter", "Lists, dicts, comprehensions"] },
    { week: 2, title: "NumPy & pandas", bullets: ["DataFrames, indexing, joins", "Cleaning a real dataset"] },
    { week: 3, title: "Visualization", bullets: ["matplotlib + seaborn basics", "Build a one-page report"] },
  ],
}

// light-mode sample, webdev track, friendlier for the cream/origami look
const sampleOutlineLight: Outline = {
  topic: "Sample: Web development for beginners",
  weeks: [
    { week: 1, title: "HTML & CSS foundations", bullets: ["Semantic tags, the box model", "Flexbox + grid basics"] },
    { week: 2, title: "JavaScript essentials", bullets: ["Variables, functions, the DOM", "Fetch API + async/await"] },
    { week: 3, title: "Build with React", bullets: ["Components, props, state", "Ship a small portfolio site"] },
  ],
}

// types `text` one char at a time
function useTypedText(text: string, speed = 22, run: boolean) {
  const [typed, setTyped] = React.useState("")
  const [done, setDone] = React.useState(false)

  React.useEffect(() => {
    if (!run) return
    setTyped("")
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setTyped(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed, run])

  return { typed, done }
}

// renders the typing for one week, advances through the outline
function ResultCard({ outline }: { outline: Outline }) {
  const [activeIdx, setActiveIdx] = React.useState(0)
  const current = outline.weeks[activeIdx]

  const titleText = current ? `Week ${current.week}: ${current.title}` : ""
  const { typed: typedTitle, done: titleDone } = useTypedText(titleText, 22, !!current)

  const [bulletsShown, setBulletsShown] = React.useState(0)

  React.useEffect(() => {
    setBulletsShown(0)
  }, [activeIdx, outline])

  React.useEffect(() => {
    if (!titleDone || !current) return
    if (bulletsShown >= current.bullets.length) {
      const id = setTimeout(() => setActiveIdx((i) => i + 1), 600)
      return () => clearTimeout(id)
    }
    const id = setTimeout(() => setBulletsShown((n) => n + 1), 350)
    return () => clearTimeout(id)
  }, [titleDone, bulletsShown, current])

  React.useEffect(() => {
    setActiveIdx(0)
    setBulletsShown(0)
  }, [outline])

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs uppercase tracking-wider text-gray-600 dark:text-slate-400">{outline.topic}</div>
      {outline.weeks.map((w, idx) => {
        if (idx > activeIdx) return null
        const isActive = idx === activeIdx
        const isPast = idx < activeIdx
        const titleDisplay = isActive ? typedTitle : `Week ${w.week}: ${w.title}`
        const cursor = isActive && !titleDone ? "▍" : ""
        const bulletCount = isActive ? bulletsShown : w.bullets.length

        return (
          <div
            key={`${outline.topic}-${w.week}`}
            className={cn(
              "rounded-lg border border-foreground/10 bg-white/60 p-4 transition-opacity dark:border-white/10 dark:bg-white/5",
              isPast && "opacity-70"
            )}
          >
            <div className="font-semibold text-gray-900 dark:text-white">
              {titleDisplay}
              <span className="text-primary dark:text-sky-300">{cursor}</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-gray-700 dark:text-slate-300">
              {w.bullets.slice(0, bulletCount).map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary dark:text-sky-400">·</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export function LandingHero() {
  const sampleRef = React.useRef<HTMLDivElement>(null)

  // primary CTA → tells the Header to open the signup dialog via custom event
  // (Header listens for "open-signup" in a useEffect)
  function handleGenerate() {
    window.dispatchEvent(new Event("open-signup"))
  }

  // secondary CTA → scrolls to the sample plan section below
  function handleSeeSample() {
    sampleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <>
      {/* SHARED LANDING BACKDROP
            One viewport-spanning fixed layer so meteors/origami flow continuously
            across header → hero → sample → footer instead of being clipped at each
            section's overflow-hidden box. Unmounts when the user navigates off "/".
            light: cream + drifting origami planes (blue + yellow)
            dark:  gray-900 + meteor shower + faint blue→teal tint */}
      <div
        aria-hidden
        // light: diagonal amber→sky gradient (yellow upper-right blending into pale blue
        // lower-left; the warm "beige" is just the midpoint where the two colors meet).
        // dark: original gray-900 — `dark:bg-none` strips the gradient image so the
        // solid bg-gray-900 takes over cleanly.
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none"
      >
        <div className="absolute inset-0 dark:hidden">
          <OrigamiPlanes number={20} />
        </div>
        <div className="absolute inset-0 hidden dark:block">
          <Meteors number={40} />
        </div>
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-blue-500/10 via-transparent to-teal-500/10" />
      </div>

      {/* HERO — transparent so the shared backdrop shows through */}
      <section className="relative z-10 w-full">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:py-32">
          {/* pill badge — white floating chip in light, translucent in dark */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/80 px-4 py-1.5 text-sm text-gray-700 shadow-sm backdrop-blur-sm dark:border-white/15 dark:bg-white/5 dark:text-slate-200 dark:shadow-none">
            <Sparkles className="h-3.5 w-3.5 text-primary dark:text-yellow-300" />
            <span>AI-curated learning paths</span>
          </div>

          {/* headline — line 1 dark in light mode / white in dark; line 2 is a
              blue→yellow gradient in light, plain golden yellow in dark */}
          <h1 className="text-5xl font-bold leading-tight text-gray-900 sm:text-6xl dark:text-white">
            Your goal. Your progress.<br />
            <span className="bg-gradient-to-r from-primary to-yellow-500 bg-clip-text text-transparent dark:from-yellow-300 dark:to-yellow-300">
              Powered by AI.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-gray-700 dark:text-slate-300">
            Tell us what you want to learn and we&apos;ll build a personalized
            week-by-week plan with curated resources for every stage.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={handleGenerate}
              className={cn(
                // light: filled blue + white + blue glow
                "rounded-full bg-blue-700 px-6 text-base font-semibold text-white",
                "hover:bg-blue-800 hover:text-white",
                "shadow-[0_0_24px_rgba(13,101,157,0.4)] transition-shadow",
                "hover:shadow-[0_0_36px_rgba(13,101,157,0.65)]",
                // dark: filled yellow + dark text + yellow glow (original)
                "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200 dark:hover:text-gray-900",
                "dark:shadow-[0_0_24px_rgba(247,203,45,0.4)] dark:hover:shadow-[0_0_36px_rgba(247,203,45,0.65)]"
              )}
            >
              Generate my path
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSeeSample}
              className="rounded-full border-gray-300/40 bg-white px-6 text-base font-semibold text-gray-800 hover:bg-gray-50 hover:text-gray-900 dark:border-white/20 dark:bg-white/5 dark:text-white dark:backdrop-blur-sm dark:hover:bg-white/10 dark:hover:text-white"
            >
              <Play className="mr-2 h-4 w-4 fill-current" />
              See a sample plan
            </Button>
          </div>
        </div>
      </section>

      {/* SAMPLE PLAN SECTION — scroll target for the secondary CTA.
          transparent so the shared backdrop above shows through; the card itself
          provides the visual frame that previously came from the section bg. */}
      <section ref={sampleRef} className="relative z-10 w-full px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
            <span className="text-xs uppercase tracking-wider text-gray-600 dark:text-slate-400">
              Sample plan, generating in real time
            </span>
          </div>
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900 dark:text-white">
            What a path looks like
          </h2>
          <p className="mb-10 text-center text-gray-600 dark:text-slate-400">
            A peek at the kind of week-by-week breakdown you&apos;ll get.
          </p>

          {/* card uses light glass in light mode, dark glass in dark.
              two ResultCards render — only one is visible per theme via dark:hidden / hidden dark:block,
              same pattern as origami planes vs meteors above. */}
          <div className="rounded-2xl border border-foreground/10 bg-white/70 p-6 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-gray-900/70 dark:shadow-none">
            <div className="dark:hidden">
              <ResultCard outline={sampleOutlineLight} />
            </div>
            <div className="hidden dark:block">
              <ResultCard outline={sampleOutlineDark} />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
