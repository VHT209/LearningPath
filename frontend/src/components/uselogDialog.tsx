import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginForm } from "@/components/ui/login-form"
import * as React from "react"

//props to open login dialog after successful registration
type DialogLoginProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  //optinal to either open dialog by button or by register success
  showTrigger?: boolean
  // fired when user clicks the "Sign up" link inside the login form
  onSwitchToSignup?: () => void
}


export function DialogLogin({ open, onOpenChange, showTrigger = true, onSwitchToSignup }: DialogLoginProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger
            render={
              <Button
                // matches the dashboard's filled pill: solid blue (light) / yellow (dark),
                // borderless, h-8 inside the parent's clear-bubble wrapper.
                className="h-8 rounded-full border-transparent bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
              >
                Login
              </Button>
            }
          />
        )}
        {/* popup bg matches the page theme (amber→sky gradient in light, gray-900 in dark) */}
        <DialogContent className="sm:max-w-sm bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none">
          <DialogHeader>
            <DialogTitle>Login to your account</DialogTitle>
            <DialogDescription>
                Enter your email below to login to your account
            </DialogDescription>
          </DialogHeader>
            <LoginForm
              onLoginSuccess={() => onOpenChange(false)}
              onSwitchToSignup={onSwitchToSignup}
            />
        </DialogContent>
    </Dialog>
  )
}
