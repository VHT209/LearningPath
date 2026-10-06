"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Video,
  FileText,
  BookOpen,
  Pencil,
  Headphones,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getToken, clearToken } from "@/lib/auth";

// week starts on monday so that the weekend sits at the end
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// shape of a single resource pulled from the weekly plan
type Resource = {
  id: number;
  resource_type: "video" | "audio" | "article" | "problems" | "course";
  resource_summary: string;
  url: string;
};

// one weekly plan, mirrors the learning path detail page
type WeeklyPlan = {
  id: number;
  week_number: number;
  goal: string[];
  plan_description: string;
  completion_status: boolean;
  resources: Resource[];
};

// learning path returned from the detail endpoint, with weekly plans nested in
type LearningPath = {
  id: number;
  topic: string;
  proficency: string | null;
  weeks: number;
  created_at: string;
  weekly_plans: WeeklyPlan[];
};

// shape of one card slotted into a single day column
type ScheduledItem = {
  pathId: number;
  topic: string;
  weekNumber: number;
  totalWeeks: number;
  resource: Resource;
  completed: boolean;
};

// each entry pairs the card styling with a matching progress bar fill
// each path gets one entry, picked at random on mount
// static class strings so tailwind picks them up at build time
const colorPalette = [
  { card: "border-l-[#1AABDB] bg-[#1AABDB]/10", fill: "bg-[#1AABDB]" }, // sky blue
  { card: "border-l-[#F5A623] bg-[#F5A623]/10", fill: "bg-[#F5A623]" }, // golden yellow
  { card: "border-l-[#00BFA5] bg-[#00BFA5]/10", fill: "bg-[#00BFA5]" }, // teal
  { card: "border-l-[#FF6B6B] bg-[#FF6B6B]/10", fill: "bg-[#FF6B6B]" }, // coral red
  { card: "border-l-[#7C5CBF] bg-[#7C5CBF]/10", fill: "bg-[#7C5CBF]" }, // purple
  { card: "border-l-[#4CAF50] bg-[#4CAF50]/10", fill: "bg-[#4CAF50]" }, // green
  { card: "border-l-[#FF8C42] bg-[#FF8C42]/10", fill: "bg-[#FF8C42]" }, // orange
  { card: "border-l-[#E91E8C] bg-[#E91E8C]/10", fill: "bg-[#E91E8C]" }, // hot pink
  { card: "border-l-[#26C6DA] bg-[#26C6DA]/10", fill: "bg-[#26C6DA]" }, // cyan
  { card: "border-l-[#8D6E63] bg-[#8D6E63]/10", fill: "bg-[#8D6E63]" }, // warm brown
];

// shown for the brief moment before the shuffle effect runs
const fallbackColor = {
  card: "border-l-gray-300 bg-white",
  fill: "bg-gray-400",
};

// labels shown in the week dropdown, keyed by offset as a string since Select uses strings
const weekOffsetLabels: Record<string, string> = {
  "0": "This week",
  "1": "In 1 week",
  "2": "In 2 weeks",
  "3": "In 3 weeks",
  "4": "In 4 weeks",
};

// rotating subtitle, one is picked on every fresh mount
const subtitlePhrases = [
  "Your week at a glance.",
  "Here's what's on deck.",
  "Plan, learn, repeat.",
  "Your roadmap for the week.",
  "Time to level up.",
  "What's brewing this week.",
  "Stay sharp, here's the lineup.",
  "Knowledge incoming.",
  "Let's get after it.",
  "One step closer this week.",
];

// fisher yates, used so each path gets a unique color when there are six or fewer paths
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// matches the icon set used on the learning path detail page
function ResourceIcon({ type }: { type: Resource["resource_type"] }) {
  if (type === "video") return <Video className="h-4 w-4" />;
  if (type === "audio") return <Headphones className="h-4 w-4" />;
  if (type === "article") return <FileText className="h-4 w-4" />;
  if (type === "problems") return <Pencil className="h-4 w-4" />;
  if (type === "course") return <BookOpen className="h-4 w-4" />;
  return null;
}

// persisted layout + color picks live here so the schedule does not reshuffle on reload
// bump the version suffix if the cached shape ever changes
const STATE_KEY = "schedule_state_v1";

type ScheduleState = {
  // key is "pathId-weekNumber", value is the day index for each resource in that week
  layouts: Record<string, number[]>;
  // pathId to index into colorPalette
  colors: Record<number, number>;
};

function loadState(): ScheduleState {
  if (typeof window === "undefined") return { layouts: {}, colors: {} };
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return { layouts: {}, colors: {} };
    const parsed = JSON.parse(raw);
    return {
      layouts: parsed.layouts ?? {},
      colors: parsed.colors ?? {},
    };
  } catch {
    return { layouts: {}, colors: {} };
  }
}

function saveState(state: ScheduleState) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // out of quota or disabled storage, just skip persistence
  }
}

// figure out which day columns this path's resources should land in
// few resources scatter randomly so they do not bunch up at the start of the week
// many resources spread across the whole week with even spacing
function pickDayIndices(numResources: number, totalDays: number): number[] {
  if (numResources <= 0) return [];
  if (numResources >= totalDays) {
    return Array.from({ length: totalDays }, (_, i) => i);
  }
  if (numResources <= 3) {
    // shuffle 0..6, take n, sort so resource order maps to chronological days
    const all = Array.from({ length: totalDays }, (_, i) => i);
    return shuffle(all)
      .slice(0, numResources)
      .sort((a, b) => a - b);
  }
  // for 4+ resources, place them at evenly spaced positions across the week
  const step = (totalDays - 1) / (numResources - 1);
  return Array.from({ length: numResources }, (_, i) => Math.round(i * step));
}

// derive which week of the path the user is on right now from created_at
// clamped to the path length so finished paths stop at the final week
function currentWeekNumber(path: LearningPath): number {
  const created = new Date(path.created_at).getTime();
  const now = Date.now();
  const elapsedDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  const week = Math.floor(elapsedDays / 7) + 1;
  if (week < 1) return 1;
  if (week > path.weeks) return path.weeks;
  return week;
}

export default function Schedule() {
  const router = useRouter();

  // name of the current weekday, used to highlight the matching column
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // schedule grouped by day name, populated from the api
  const [schedule, setSchedule] = React.useState<
    Record<string, ScheduledItem[]>
  >(() => Object.fromEntries(days.map((d) => [d, [] as ScheduledItem[]])));

  // raw fetched paths kept around so changing the offset rebuilds without a refetch
  const [paths, setPaths] = React.useState<LearningPath[]>([]);

  // 0 means current week, capped at 4 so the dropdown only shows up to four weeks ahead
  const [weekOffset, setWeekOffset] = React.useState(0);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // start with the first phrase so server and client render the same html
  // the effect swaps in a random pick right after hydration
  const [subtitle, setSubtitle] = React.useState(subtitlePhrases[0]);

  // path id to color mapping, filled in once the data lands
  const [colorMap, setColorMap] = React.useState<
    Record<number, (typeof colorPalette)[number]>
  >({});

  // fetch every path + its weekly plans once on mount, store the raw data in state
  // the second effect turns that into a per-day schedule for whichever week is selected
  React.useEffect(() => {
    const fetchPaths = async () => {
      const token = getToken();
      if (!token) {
        router.push("/");
        return;
      }

      try {
        const listRes = await fetch("/api/learning-paths/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (listRes.status === 401) {
          clearToken();
          router.push("/");
          return;
        }
        if (!listRes.ok) throw new Error("Failed to fetch learning paths");
        const list: LearningPath[] = await listRes.json();

        const detailed = await Promise.all(
          list.map(async (p) => {
            const res = await fetch(
              `/api/learning-paths/${p.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) return null;
            return (await res.json()) as LearningPath;
          })
        );

        setPaths(detailed.filter((p): p is LearningPath => p !== null));
      } catch (err) {
        console.error("Error fetching schedule:", err);
        setError("Could not load schedule. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaths();

    // pick a fresh subtitle on every mount so the page feels alive
    setSubtitle(
      subtitlePhrases[Math.floor(Math.random() * subtitlePhrases.length)]
    );
  }, [router]);

  // rebuild the per-day schedule whenever the fetched paths or the chosen offset change
  // pulls saved layout + colors from localStorage so reloading does not reshuffle anything
  React.useEffect(() => {
    if (paths.length === 0) {
      setSchedule(
        Object.fromEntries(days.map((d) => [d, [] as ScheduledItem[]]))
      );
      setColorMap({});
      return;
    }

    const next: Record<string, ScheduledItem[]> = Object.fromEntries(
      days.map((d) => [d, [] as ScheduledItem[]])
    );

    const saved = loadState();
    const layouts: Record<string, number[]> = { ...saved.layouts };
    const colors: Record<number, number> = { ...saved.colors };

    paths.forEach((path) => {
      // shift the target week by the dropdown offset, skip the path if it is finished by then
      const targetWeek = currentWeekNumber(path) + weekOffset;
      if (targetWeek > path.weeks) return;

      const plan = path.weekly_plans.find((w) => w.week_number === targetWeek);
      if (!plan) return;

      // single resource per day, capped at seven so we never overflow the week
      const resources = plan.resources.slice(0, days.length);
      const layoutKey = `${path.id}-${plan.week_number}`;

      // reuse saved slot positions, regenerate only when missing or the count changed
      let slots = layouts[layoutKey];
      if (!slots || slots.length !== resources.length) {
        slots = pickDayIndices(resources.length, days.length);
        layouts[layoutKey] = slots;
      }

      resources.forEach((resource, i) => {
        const day = days[slots[i]];
        next[day].push({
          pathId: path.id,
          topic: path.topic,
          weekNumber: plan.week_number,
          totalWeeks: path.weeks,
          resource,
          completed: plan.completion_status,
        });
      });
    });

    // assign a stable color to each path, reusing saved picks when present
    const uniquePathIds = Array.from(
      new Set(
        Object.values(next).flatMap((items) => items.map((i) => i.pathId))
      )
    ).sort((a, b) => a - b);

    const usedIndices = new Set<number>();
    uniquePathIds.forEach((id) => {
      if (typeof colors[id] === "number") {
        usedIndices.add(colors[id]);
      }
    });

    const map: Record<number, (typeof colorPalette)[number]> = {};
    uniquePathIds.forEach((id) => {
      if (typeof colors[id] !== "number") {
        const free = colorPalette
          .map((_, idx) => idx)
          .filter((idx) => !usedIndices.has(idx));
        const pick =
          free.length > 0
            ? free[Math.floor(Math.random() * free.length)]
            : Math.floor(Math.random() * colorPalette.length);
        colors[id] = pick;
        usedIndices.add(pick);
      }
      map[id] = colorPalette[colors[id]];
    });

    saveState({ layouts, colors });

    setSchedule(next);
    setColorMap(map);
  }, [paths, weekOffset]);

  // tiny helper so the JSX below stays readable
  const colorFor = (id: number) => colorMap[id] ?? fallbackColor;

  return (
    <>
      {/* fixed backdrop matching the dashboard — gradient in light, solid gray in dark.
          no meteors / origami here, just the color so the page tone matches. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none"
      />

      <div className="relative z-10 min-h-screen w-full p-8">
      {/* heading on the left, week selector on the right */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl dark:text-white">
            Schedule
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{subtitle}</p>
        </div>

        {/* lets the user peek up to four weeks ahead, current week is the default */}
        <Select
          value={String(weekOffset)}
          onValueChange={(v) => setWeekOffset(Number(v))}
        >
          <SelectTrigger className="w-[180px] text-primary">
            {/* base ui's SelectValue defaults to the raw value, render the label instead */}
            <SelectValue>
              {(value: string) => weekOffsetLabels[value] ?? "This week"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">This week</SelectItem>
            <SelectItem value="1">In 1 week</SelectItem>
            <SelectItem value="2">In 2 weeks</SelectItem>
            <SelectItem value="3">In 3 weeks</SelectItem>
            <SelectItem value="4">In 4 weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="mt-6 text-sm text-gray-600 dark:text-slate-400">Loading...</p>}
      {error && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {/* one column per day at desktop, collapses to two then one on smaller screens */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day, idx) => {
          const items = schedule[day] ?? [];
          // only highlight today when viewing the current week, future weeks have no "today"
          const isToday = weekOffset === 0 && day === today;
          const isLast = idx === days.length - 1;

          return (
            <div
              key={day}
              className={cn(
                "flex flex-col gap-3 px-3 py-3",
                // vertical divider between columns at desktop, skipped on the last one
                !isLast && "lg:border-r lg:border-border",
                // soft tint on the column that represents today
                isToday && "rounded-xl bg-primary/5 dark:bg-yellow-300/5"
              )}
            >
              {/* day name with the small today pill when this column is the current day */}
              <div className="flex items-baseline gap-2">
                <h2
                  className={cn(
                    "text-lg font-semibold text-gray-900 dark:text-white",
                    isToday && "text-primary dark:text-yellow-300"
                  )}
                >
                  {day}
                </h2>
                {isToday && (
                  <span className="text-xs font-medium text-primary dark:text-yellow-300">
                    Today
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                // shown when no sessions are scheduled for the day
                <div className="rounded-xl border border-dashed border-foreground/15 p-4 text-center dark:border-white/10">
                  <p className="text-sm text-gray-500 dark:text-slate-400">Rest day</p>
                </div>
              ) : (
                items.map((item) => {
                  // same path id resolves to the same color across every day
                  const color = colorFor(item.pathId);
                  // clamp to 100 so an off by one in real data does not break the bar
                  const pct = Math.min(
                    100,
                    Math.round((item.weekNumber / item.totalWeeks) * 100)
                  );

                  return (
                    // clicking the card jumps to the learning path detail page
                    <div
                      key={`${day}-${item.pathId}-${item.resource.id}`}
                      onClick={() =>
                        router.push(`/learning-path/${item.pathId}`)
                      }
                      className={cn(
                        "p-4 border border-l-4 rounded-xl shadow hover:shadow-md transition cursor-pointer",
                        color.card,
                        // faded look when the week is already done
                        item.completed && "opacity-60"
                      )}
                    >
                      {/* topic title with a check icon when the week is complete */}
                      <div className="flex items-start gap-1.5">
                        <h3
                          className="text-base font-semibold text-gray-900 dark:text-white truncate flex-1"
                          title={item.topic}
                        >
                          {item.topic}
                        </h3>
                        {item.completed && (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </div>

                      {/* the single resource for the day, clickable straight through to the source */}
                      <a
                        href={item.resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "mt-2 flex items-start gap-2 text-sm text-gray-700 dark:text-muted-foreground hover:text-blue-600 hover:underline",
                          item.completed && "line-through"
                        )}
                      >
                        <span className="mt-0.5 shrink-0 text-gray-500 dark:text-muted-foreground">
                          <ResourceIcon type={item.resource.resource_type} />
                        </span>
                        <span className="line-clamp-3">
                          {item.resource.resource_summary}
                        </span>
                      </a>

                      {/* week label and progress bar */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 dark:text-muted-foreground mb-1">
                          Week {item.weekNumber} of {item.totalWeeks}
                        </p>
                        <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                          {/* fill width tracks how far along the user is in the path */}
                          <div
                            className={cn("h-full rounded-full", color.fill)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
}
