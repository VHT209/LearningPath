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
import { SigninForm } from "@/components/ui/signin-form"
import * as React from "react"

//object for sign in dialog props
type DialogSigninProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  // fires when registration succeeds but auto-login fails — parent should open the login dialog
  onRegisterSuccess?: () => void
  // fires when registration AND auto-login both succeed — parent should just close this dialog
  onAutoLoginSuccess?: () => void
}

export function DialogSignin({ open, onOpenChange, onRegisterSuccess, onAutoLoginSuccess }: DialogSigninProps) {
  return (
    //Dialog component are open
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger
          render={
            <Button
              // matches the dashboard's filled pill: solid blue (light) / yellow (dark),
              // borderless, h-8 inside the parent's clear-bubble wrapper.
              className="h-8 rounded-full border-transparent bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
            >
              Sign Up
            </Button>
          }
        />
        {/* popup bg matches the page theme (amber→sky gradient in light, gray-900 in dark) */}
        <DialogContent className="sm:max-w-sm bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none">
          <DialogHeader>
            <DialogTitle>Create your LearningPath Account</DialogTitle>
            <DialogDescription>
                Enter your email, username, and password to create an account
            </DialogDescription>
          </DialogHeader>
            <SigninForm
              onRegisterSuccess={onRegisterSuccess}
              onAutoLoginSuccess={onAutoLoginSuccess} />
        </DialogContent>
    </Dialog>
  )
}
