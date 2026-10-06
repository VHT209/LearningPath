"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { getToken, clearToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


// topic is req, level must be one of the three values stated, and weeks miust be 1 week to 52
const formSchema = z.object({
  topic: z.string()
    .trim()
    .min(1, "Topic is required")
    .max(30, "Topic must be at most 30 characters"),
  proficency: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Please select a level",
  }),
  weeks: z.number()
    .int()
    .min(1, "Must be at least 1 week")
    .max(52, "Must be at most 6 weeks"),
})

// closes dialog after successful
type LearningPathFormProps = React.ComponentProps<"div"> & 
{
  onCreateSuccess?: () => void
}

export function LearningPathForm({ className, onCreateSuccess, ...props }: LearningPathFormProps) {
  // tracks if AI is generating
  const [isLoading, setIsLoading] = React.useState(false)

  // default values without you putting anything
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      proficency: "beginner",
      weeks: 4,
    }
  })

  // sends learning paht data to backend with token 
  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // grab token from login
      const token = getToken()

      // send POST request also tells backend who made it 
      const res = await fetch("/api/learning-paths/", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      // token expired, clear and relog
      if (res.status === 401) {
        clearToken()
        toast.error("Session expired, please log in again")
        return
      }

      // other errors
      if (!res.ok) {
        const errorData = await res.json()
        toast.error("Failed to create learning path: " + (errorData?.detail || "Unknown error"))
        return
      }

      // success
      toast.success("Learning path created!", {
        position: "top-center",
      })
      form.reset()
      onCreateSuccess?.()
    } catch (error) {

      // cant reach the backend = error
      toast.error("Network error: please try again")
    } finally {
      // turn off loading state
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent>
          <form id="learning-path-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* topic field */}
              <Controller
                name="topic"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="topic">Topic</FieldLabel>
                    <Input
                      {...field}
                      id="topic"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Python, Spanish, Guitar"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* level dropdown */}
              <Controller
                name="proficency"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="proficency">Level</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? "beginner"}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="proficency">
                        <SelectValue placeholder="Select your level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* weeks field */}
              <Controller
                name="weeks"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="weeks">Number of Weeks</FieldLabel>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      id="weeks"
                      type="number"
                      min={1}
                      max={6}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* submit button */}
              <Field>
                <Button className="hover:bg-background hover:text-foreground"type="submit" disabled={isLoading}>
                  {isLoading ? "Generating with AI..." : "Create Learning Path"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}