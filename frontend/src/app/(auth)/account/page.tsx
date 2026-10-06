"use client";
import { AccountForm } from "@/components/useprofile"

export default function Account() {
  return (
    <>
      {/* fixed backdrop matching the rest of the auth pages — no effects */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-bl from-amber-100 to-sky-100 dark:bg-gray-900 dark:bg-none"
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 pb-20 pt-8">
        <AccountForm />
      </div>
    </>
  );
}
