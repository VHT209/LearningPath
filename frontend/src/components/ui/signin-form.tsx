"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { setToken } from "@/lib/auth"
import { useRouter } from "next/navigation"



//form schema for validation using zod
const formSchema = z.object({
  email: z.string()
          .trim()
          .min(1, "Email is required")
          .email("Invalid email address"),
  username: z.string()
            .trim()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be at most 20 characters"),
  password: z.string()
            .trim()
            .min(8, "Password must be at least 8 characters")
            .max(10, "Password must be at most 10 characters"),
            confirmPassword: z.string()
    })
    /*Making sure password and confirm password match*/
    .refine((values) => values.password === values.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
    })

//function to be called on successful registration
type SigninFormProps = React.ComponentProps<"div"> & {
  // fired when register succeeded but auto-login did NOT — parent should open
  // the login dialog so the user can retry manually
  onRegisterSuccess?: () => void
  // fired when register AND auto-login both succeeded — parent should just
  // close the signup dialog, since the user is already on their way to /dashboard
  onAutoLoginSuccess?: () => void
}

export function SigninForm({className, onRegisterSuccess, onAutoLoginSuccess, ...props
}: SigninFormProps) {
  //function to handle form submission

  //router used to send the user straight to the dashboard after auto-login
  const router = useRouter()

  //hook to call
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    }
  })

  //function to acutally sending user input to backend API
  //FixMe: Need to call API to validate user credentials and handle login logic. For now, just showing a success toast on form submission.
  //FixMe: Need to change page to dashboard on successfull login
  async function onSubmit(data: z.infer<typeof formSchema>){
    //sending http request
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    //handling error response
    if(!res.ok){
      const errorData = await res.json()
      toast.error(`Registration failed: ${errorData?.message || "Unknown error"}`, {
        position: "top-center",
      })
      return
    }

    if (res.status !== 201) {
      toast.error("Unexpected response from server. Please try again later.", {
        position: "top-center",
      })
      return
    }

    //register succeeded — try logging the user in immediately with the same
    //credentials so they skip the "now type your password again" step. The
    //login endpoint accepts form-encoded `username`+`password` (oauth2 style)
    //and `username` here is actually the email, matching the login form.
    try {
      const loginRes = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: data.email,
          password: data.password,
        }).toString(),
      })

      if (loginRes.ok) {
        const returnedLogin = await loginRes.json()
        //fresh signups default to persistent storage — first-time users almost
        //always want to stay signed in. They can flip Remember me off the next
        //time they log in if they prefer session-only.
        setToken(returnedLogin.access_token, true)
        toast.success("Account created — welcome!", { position: "top-center" })
        form.reset()
        onAutoLoginSuccess?.()
        router.push("/dashboard")
        return
      }
    } catch {
      //network blip or unexpected error — fall through to the manual login fallback
    }

    //auto-login didn't take. Fall back to the original flow: tell the user the
    //account exists and let the parent open the login dialog for a manual retry.
    toast.success("Account created — please log in to continue.", {
      position: "top-center",
    })
    form.reset()
    onRegisterSuccess?.()
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* card is transparent so the popup's theme bg (set on DialogContent) shows through */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/*Email Field */}
              <Controller
                name="email"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      aria-invalid={fieldState.invalid}
                      placeholder="m@example.com"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
             {/*User-Name Field */}
              <Controller
                name="username"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input
                      {...field}
                      id="username"
                      aria-invalid={fieldState.invalid}
                      placeholder="john_doe"
                      autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/*Password Field */} 
              <Controller 
                name="password"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
                    <Input 
                        {...field}
                        id="password"
                        aria-invalid={fieldState.invalid} 
                        type="password" 
                        placeholder="********"
                        autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}

                  </Field>
                  )}
              />
            {/*Confirm Password Field */} 
              <Controller 
                name="confirmPassword"
                control={form.control}
                render={({field, fieldState}) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    </div>
                    <Input 
                        {...field}
                        id="confirmPassword"
                        aria-invalid={fieldState.invalid} 
                        type="password" 
                        placeholder="********"
                        autoComplete="off"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}

                  </Field>
                  )}
              />
              <Field>
                  {/* matches the design-system pill used in the header / dashboard CTAs:
                      solid blue (light) / yellow (dark), rounded-full, borderless. */}
                  <Button
                    type="submit"
                    className={cn(
                      "h-10 rounded-full border-transparent px-4 text-sm font-semibold",
                      "bg-blue-700 text-white hover:bg-blue-800",
                      "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
                    )}
                  >
                    Sign Up
                  </Button>
              </Field>
  
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
