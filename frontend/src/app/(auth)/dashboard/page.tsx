"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Flame, Target, Trophy } from "lucide-react"
import { LearningPathDialog } from "@/components/useLearningPathDialog"
import { Button } from "@/components/ui/button"
import { Meteors } from "@/components/ui/meteors"
import { OrigamiPlanes } from "@/components/ui/origami-planes"
import { getToken } from "@/lib/auth"
import { cn } from "@/lib/utils"

// shape of a learning path returned by GET /learning-paths/
type LearningPath = {
  id: number
  topic?: string
  proficency?: string
  weeks?: number
}

// streak / completed-weeks counters aren't tracked by the backend yet — placeholders
// so the visual matches the reference; swap to real values when the API exposes them
const STREAK_DAYS = 12
const COMPLETED_WEEKS = 9

// per-card week progress is also not in the schema yet; pick a deterministic-looking
// value off the path id so cards aren't all visually identical during this stub phase
function fakeProgress(path: LearningPath) {
  const totalWeeks = path.weeks ?? 8
  const currentWeek = Math.min(totalWeeks, ((path.id ?? 0) % Math.max(1, totalWeeks - 1)) + 2)
  const pct = Math.round((currentWeek / totalWeeks) * 100)
  return { currentWeek, totalWeeks, pct }
}

export default function Dashboard() {
  const router = useRouter()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [paths, setPaths] = React.useState<LearningPath[]>([])
  const [loading, setLoading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)

  const fetchPaths = async () => {
    const token = getToken()
    if (!token) return

    setLoading(true)
    try {
      const res = await fetch("/api/learning-paths/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch learning paths")
      setPaths(await res.json())
    } catch (err) {
      console.error("Error fetching paths:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, pathId: number) => {
    e.stopPropagation()
    if (!confirm("Delete this learning path? This cannot be undone.")) return

    const token = getToken()
    if (!token) return

    setDeletingId(pathId)
    try {
      const res = await fetch(`/api/learning-paths/${pathId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to delete")
      setPaths((prev) => prev.filter((p) => p.id !== pathId))
    } catch (err) {
      console.error("Error deleting path:", err)
    } finally {
      setDeletingId(null)
    }
  }

  React.useEffect(() => {
    fetchPaths()
  }, [])

  const totalWeeksAcrossPaths = paths.reduce((sum, p) => sum + (p.weeks ?? 0), 0)

  return (
    // single fixed-position backdrop covers the full viewport so meteors / origami
    // animate continuously across the header, content, and footer instead of being
    // clipped at each region's overflow-hidden box. header & footer are transparent
    // (with relative z-10 set in their own components) and sit on top of this layer.
    //   light → cream + drifting origami
    //   dark  → gray-900 + meteor shower
    <>
      <div
        aria-hidden
        // light: diagonal amber→sky gradient (yellow upper-right blending into pale blue
        // lower-left; the warm "beige" is just the midpoint where the two colors meet).
        // dark: original gray-900 — `dark:bg-none` strips the gradient image so the
        // solid bg-gray-900 takes over cleanly.
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none"
      >
        <div className="absolute inset-0 dark:hidden">
          <OrigamiPlanes number={16} />
        </div>
        <div className="absolute inset-0 hidden dark:block">
          <Meteors number={30} />
        </div>
        {/* dark glow — soft top-down tint, no seams to align since the backdrop
            is one continuous element now. */}
        <div className="absolute inset-0 hidden dark:block bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8">
        {/* welcome eyebrow + heading + new-path CTA */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-slate-300">
              Welcome back
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl dark:text-white">
              Your learning, this week
            </h1>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className={cn(
              "h-11 rounded-full px-5 text-sm font-semibold",
              "bg-blue-700 text-white hover:bg-blue-800",
              "shadow-[0_0_24px_rgba(13,101,157,0.35)] transition-shadow hover:shadow-[0_0_36px_rgba(13,101,157,0.6)]",
              "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200",
              "dark:shadow-[0_0_24px_rgba(247,203,45,0.35)] dark:hover:shadow-[0_0_36px_rgba(247,203,45,0.6)]"
            )}
          >
            <Plus className="mr-1 h-4 w-4" />
            New learning path
          </Button>
        </div>

        {/* stats row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Current streak"
            value={`${STREAK_DAYS} days`}
            sub="Keep it going"
            icon={<Flame className="h-4 w-4 text-yellow-600 dark:text-gray-900" />}
          />
          <StatCard
            label="Active paths"
            value={paths.length.toString()}
            sub={`Across ${totalWeeksAcrossPaths} weeks`}
            icon={<Target className="h-4 w-4 text-yellow-600 dark:text-gray-900" />}
          />
          <StatCard
            label="Completed weeks"
            value={COMPLETED_WEEKS.toString()}
            sub={`Out of ${totalWeeksAcrossPaths || "—"}`}
            icon={<Trophy className="h-4 w-4 text-yellow-600 dark:text-gray-900" />}
          />
        </div>

        {/* active paths */}
        <div className="mt-12 mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active paths</h2>
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:underline dark:text-yellow-300"
          >
            View all
          </button>
        </div>

        {loading && paths.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-slate-400">Loading paths…</p>
        ) : paths.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-foreground/15 bg-white/60 p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              No learning paths yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {paths.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                deleting={deletingId === path.id}
                onOpen={() => router.push(`/learning-path/${path.id}`)}
                onDelete={(e) => handleDelete(e, path.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* dialog is opened from the header CTA — no floating fab anymore */}
      <LearningPathDialog
        open={dialogOpen}
        showTrigger={false}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) fetchPaths()
        }}
      />
    </>
  )
}

// glass stat card with a yellow rounded icon chip in the top-right
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        "border-foreground/10 bg-white/70 backdrop-blur-md",
        "dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 dark:bg-yellow-300">
          {icon}
        </span>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="mt-1 text-sm text-gray-600 dark:text-slate-400">{sub}</div>
    </div>
  )
}

// row card per learning path — title + level chip, progress bar, delete affordance
function PathCard({
  path,
  deleting,
  onOpen,
  onDelete,
}: {
  path: LearningPath
  deleting: boolean
  onOpen: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const { currentWeek, totalWeeks, pct } = fakeProgress(path)
  const level = path.proficency ?? "Beginner"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen()
      }}
      className={cn(
        "group cursor-pointer rounded-2xl border p-5 transition-colors",
        "border-foreground/10 bg-white/70 hover:bg-white/90 backdrop-blur-md",
        "dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {path.topic || "Untitled topic"}
            </h3>
            <span className="rounded-full border border-yellow-500/40 bg-yellow-300/20 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:border-yellow-300/30 dark:bg-yellow-300/10 dark:text-yellow-300">
              {level}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">
            Week <span className="font-semibold text-gray-900 dark:text-white">{currentWeek}</span>{" "}
            of {totalWeeks}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={deleting}
          aria-label="Delete learning path"
          className="text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
        >
          <Trash2 />
        </Button>
      </div>

      {/* progress bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
          <span>Progress</span>
          <span className="font-semibold text-gray-900 dark:text-white">{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-primary dark:bg-yellow-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
