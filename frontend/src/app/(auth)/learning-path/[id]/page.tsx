"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Video, FileText, BookOpen, Pencil, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getToken, clearToken } from "@/lib/auth"

// one resource inside a weekly plan
type Resource = {
  id: number
  resource_type: "video" | "audio" | "article" | "problems" | "course"
  resource_summary: string
  url: string
}

// a single week of the learning path
type WeeklyPlan = {
  id: number
  week_number: number
  goal: string[]
  plan_description: string
  completion_status: boolean
  resources: Resource[]
}

// full learning path payload
type LearningPath = {
  id: number
  topic: string
  proficency: string | null
  weeks: number
  created_at: string
  weekly_plans: WeeklyPlan[]
}

// icon per resource type
function ResourceIcon({ type }: { type: Resource["resource_type"] }) {
  if (type === "video") return <Video className="h-4 w-4" />
  if (type === "audio") return <Headphones className="h-4 w-4" />
  if (type === "article") return <FileText className="h-4 w-4" />
  if (type === "problems") return <Pencil className="h-4 w-4" />
  if (type === "course") return <BookOpen className="h-4 w-4" />
  return null
}

// loads when user clicks a card on the dashboard
export default function LearningPathDetail() {
  const router = useRouter()
  const params = useParams<{ id: string }>()

  const [path, setPath] = React.useState<LearningPath | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // fetch learning path
  React.useEffect(() => {
    const fetchPath = async () => {
      const token = getToken()
      if (!token) {
        router.push("/")
        return
      }

      try {
        const res = await fetch(`/api/learning-paths/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.status === 401) {
          clearToken()
          router.push("/")
          return
        }

        if (res.status === 404) {
          setError("Learning path not found")
          return
        }

        if (!res.ok) throw new Error("Failed to fetch learning path")

        const data: LearningPath = await res.json()
        setPath(data)
      } catch (err) {
        console.error("Error fetching path:", err)
        setError("Could not load learning path. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPath()
  }, [params.id, router])

  return (
    <>
      {/* fixed backdrop matching the dashboard / schedule pages — no effects */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none"
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-20 pt-8">
        {/* back link */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard")}
          className="mb-6 -ml-2 text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to dashboard
        </Button>

        {loading && (
          <p className="text-sm text-gray-600 dark:text-slate-400">Loading...</p>
        )}

        {error && !loading && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        {path && !loading && (
          <>
            {/* path header */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600 dark:text-slate-300">
                Learning path
              </p>
              <h1 className="mt-2 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl dark:text-white">
                {path.topic}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <span className="rounded-full border border-yellow-500/40 bg-yellow-300/20 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:border-yellow-300/30 dark:bg-yellow-300/10 dark:text-yellow-300">
                  {path.proficency || "N/A"}
                </span>
                <span>•</span>
                <span>{path.weeks} weeks</span>
              </div>
            </div>

            {/* weekly plan cards */}
            <div className="flex flex-col gap-4">
              {path.weekly_plans.map((plan) => (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-2xl border p-6",
                    "border-foreground/10 bg-white/70 backdrop-blur-md",
                    "dark:border-white/10 dark:bg-white/[0.03]"
                  )}
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Week {plan.week_number}
                  </h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                    {plan.plan_description}
                  </p>

                  {/* goals */}
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400">
                      Goals
                    </h3>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-slate-300">
                      {plan.goal.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* resources */}
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-slate-400">
                      Resources
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {plan.resources.map((resource) => (
                        <li key={resource.id} className="flex items-start gap-2">
                          <span className="mt-0.5 text-gray-500 dark:text-slate-400">
                            <ResourceIcon type={resource.resource_type} />
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-primary underline-offset-2 hover:underline dark:text-yellow-300"
                          >
                            {resource.resource_summary}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
