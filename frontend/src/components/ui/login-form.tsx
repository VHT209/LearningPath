"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { setToken } from "@/lib/auth"
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

//
import { useRouter } from "next/navigation"



//form schema for validation using zod
const formSchema = z.object({
  email: z.string()
          .trim()
          .min(1, "Email is required")
          .email("Invalid email address"),
  password: z.string()
            .trim()
            .min(8, "Password must be at least 8 characters")
            .max(10, "Password must be at most 10 characters"),
  // when true, token persists across browser restarts (localStorage)
  // when false, token only lives for the current tab (sessionStorage)
  rememberMe: z.boolean(),
})

// used to tell the dialog to close after login, or to switch over to the signup
// dialog when the user clicks "Sign up" inside the login form.
type LoginFormProps = React.ComponentProps<"div"> & {
  onLoginSuccess?: () => void
  // close login dialog and open signup dialog (parent owns both)
  onSwitchToSignup?: () => void
}

export function LoginForm({className, onLoginSuccess, onSwitchToSignup, ...props
}: LoginFormProps) {

  // used to redirect to dashboard after logging in 
  const router = useRouter()


  //function to handle form submission

  //hook to call
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      // default to checked so existing users (who expect persistence) aren't surprised
      rememberMe: true,
    }
  })

  //FixMe: Need to call API to validate user credentials and handle login logic. For now, just showing a success toast on form submission.
  //FixMe: Need to change page to dashboard on successfull login

  // sends login req to backend and handles response
  async function onSubmit(data: z.infer<typeof formSchema>){
    //FIXME: For testing using the toast to show submitted data
    //The comment code is for successful login, for real implementation
    // toast.success("Login successful!",
    //   {position: "top-center"})
    //   form.reset()

    // sends email and pass to backend login endpoint
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        // send back json
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },

      // converts data into string
      body: new URLSearchParams({
        username: data.email,
        password: data.password,
      }).toString(),
    })
    
    // wrong password or username not found = error
    // true for success status codes but false for error status codes (duh)
    if(!res.ok) {

      // read error details
      const errorData = await res.json()

      // tell user what went wrong
      toast.error("Login failed: " + (errorData?.detail || "Unknown error"))
      return
    }

    // JWt token so other pages dont have to recheck and they knwo your logged in 
    const returnedData = await res.json()

    // saves token so other pages can check for it later when doing things
    // setToken routes to localStorage or sessionStorage based on the "Remember me" choice
    setToken(returnedData.access_token, data.rememberMe)

    //code to display submited input as JSON in the toast
    toast("You submitted the following values:", {      
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })

    // clear fields close the dialog then go to dashboard
    form.reset()
    onLoginSuccess?.()
    router.push("/dashboard")
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* card is transparent so the popup's theme bg (set on DialogContent) shows through */}
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent>
          <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
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
              {/*
                Remember-me toggle. Controlled via react-hook-form so the value flows
                into the same submit handler as the other fields. The native checkbox
                is styled with `accent-primary` to pick up the deep-blue theme color.
              */}
              <Controller
                name="rememberMe"
                control={form.control}
                render={({field}) => (
                  <Field orientation="horizontal">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                    <FieldLabel htmlFor="rememberMe" className="cursor-pointer text-sm font-normal">
                      Remember me
                    </FieldLabel>
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
                    Login
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={onSwitchToSignup}
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Sign up
                    </button>
                  </FieldDescription>
              </Field>
  
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
