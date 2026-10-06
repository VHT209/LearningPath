"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { DialogLogin } from "@/components/uselogDialog";
import { DialogSignin } from "@/components/useSignDialog";
import { handleLogOut } from "@/components/useprofile";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Meteors } from "@/components/ui/meteors";
import { OrigamiPlanes } from "@/components/ui/origami-planes";
import { getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import * as React from "react";

// nav links shown inside the center pill on logged-in routes
const AUTH_NAV = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Schedule", href: "/schedule" },
    { label: "Account", href: "/account" },
] as const;

//header component
export function Header() {
    //return the current location of the user
    const pathname = usePathname();

    //variable to monitor state of the dialog
    const [registerOpen, setRegisterOpen] = React.useState(false)
    const [loginOpen, setLoginOpen] = React.useState(false)

    //track login state so the header can swap login/signup for log-out without a refresh
    //re-checked on every pathname change, which catches the post-login redirect to /dashboard
    //also listens to the storage event so a logout in another tab updates this tab too
    //getToken() looks at both localStorage (Remember me) and sessionStorage (session-only)
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)
    React.useEffect(() => {
        const sync = () => setIsLoggedIn(!!getToken())
        sync()
        window.addEventListener("storage", sync)
        return () => window.removeEventListener("storage", sync)
    }, [pathname])

    // landing-hero CTAs dispatch these custom events to open the dialogs;
    // keeps the dialog state owned here without needing a global context.
    React.useEffect(() => {
        const onOpenSignup = () => setRegisterOpen(true)
        const onOpenLogin = () => setLoginOpen(true)
        window.addEventListener("open-signup", onOpenSignup)
        window.addEventListener("open-login", onOpenLogin)
        return () => {
            window.removeEventListener("open-signup", onOpenSignup)
            window.removeEventListener("open-login", onOpenLogin)
        }
    }, [])

    //special case for landing page
    //  light: beige cream gradient + drifting origami planes
    //  dark:  gray-900 + meteor shower
    //both modes share the layout so the header reads continuously with the hero
    if (pathname === '/'){
        // landing header is transparent — the LandingHero component renders one
        // viewport-spanning fixed backdrop (meteors / origami / tint) that flows
        // continuously behind the header, hero, sample section, and footer instead
        // of each region clipping its own particles at overflow-hidden boundaries.
        return (
            <header className="relative z-10 w-full h-fit text-gray-900 dark:text-white">
                {/* 3-col grid on sm+ pins the center nav to the viewport center
                    regardless of brand/actions widths (sm:col-start-2 + justify-self-center).
                    flex-col on mobile keeps the existing stacked layout. */}
                <div className="w-full h-fit p-10 flex flex-col items-center gap-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
                    {/* Brand pill — same design as the dashboard header (white glass in
                        light, yellow filled in dark), so the logo reads identically across routes. */}
                    <Link
                        href="/"
                        aria-label="Go to welcome page"
                        className={cn(
                            "group inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ease-out active:scale-[0.98]",
                            "border border-foreground/10 bg-white/70 backdrop-blur-sm",
                            "dark:border-yellow-300/50 dark:bg-yellow-300/95 dark:backdrop-blur-none",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "sm:col-start-1 sm:justify-self-start"
                        )}
                    >
                        <svg
                            className="h-7 w-7 fill-foreground transition-transform duration-300 ease-out group-hover:scale-110 dark:fill-gray-900"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1024 1024"
                            aria-hidden
                        >
                            <path d="M 522.0,827.5 L 537.0,824.5 L 549.0,820.5 L 565.0,811.5 L 575.0,802.5 L 910.0,802.5 L 914.0,800.5 L 917.5,796.0 L 918.5,789.0 L 860.5,673.0 L 858.5,671.0 L 842.5,637.0 L 836.0,631.5 L 829.0,631.5 L 825.0,633.5 L 815.0,635.5 L 813.5,637.0 L 826.5,669.0 L 837.5,692.0 L 839.5,699.0 L 849.5,720.0 L 851.5,727.0 L 862.5,751.0 L 863.0,754.5 L 796.0,741.5 L 752.0,736.5 L 751.0,735.5 L 743.0,735.5 L 742.0,734.5 L 719.0,733.5 L 718.0,732.5 L 717.0,733.5 L 715.0,732.5 L 699.0,732.5 L 698.0,731.5 L 695.0,732.5 L 693.0,731.5 L 638.0,732.5 L 637.0,733.5 L 621.0,734.5 L 620.0,735.5 L 593.0,739.5 L 563.0,748.5 L 535.0,762.5 L 520.0,773.5 L 512.0,781.5 L 496.0,767.5 L 487.0,761.5 L 458.0,747.5 L 443.0,742.5 L 417.0,736.5 L 398.0,734.5 L 397.0,733.5 L 373.0,732.5 L 372.0,731.5 L 327.0,731.5 L 326.0,732.5 L 322.0,731.5 L 321.0,732.5 L 306.0,732.5 L 305.0,733.5 L 271.0,735.5 L 270.0,736.5 L 254.0,737.5 L 253.0,738.5 L 214.0,743.5 L 160.0,754.5 L 166.5,737.0 L 170.5,730.0 L 172.5,723.0 L 176.5,716.0 L 178.5,709.0 L 185.5,695.0 L 187.5,688.0 L 191.5,681.0 L 209.5,638.0 L 209.0,636.5 L 202.0,633.5 L 194.0,631.5 L 187.0,631.5 L 180.5,637.0 L 105.5,787.0 L 104.5,791.0 L 105.5,796.0 L 107.5,799.0 L 114.0,802.5 L 449.0,802.5 L 463.0,814.5 L 483.0,823.5 L 503.0,827.5 L 520.0,827.5 L 521.0,826.5 L 522.0,827.5 Z M 184.0,741.5 L 214.0,735.5 L 220.0,735.5 L 226.0,733.5 L 262.0,729.5 L 270.0,727.5 L 303.0,725.5 L 304.0,724.5 L 317.0,724.5 L 318.0,723.5 L 341.0,723.5 L 342.0,722.5 L 381.0,723.5 L 382.0,724.5 L 391.0,724.5 L 392.0,725.5 L 393.0,724.5 L 394.0,725.5 L 401.0,725.5 L 402.0,726.5 L 425.0,729.5 L 447.0,735.5 L 460.0,722.5 L 470.0,715.5 L 478.0,711.5 L 483.0,710.5 L 483.5,708.0 L 477.0,707.5 L 464.0,701.5 L 454.5,693.0 L 448.5,682.0 L 446.5,675.0 L 446.5,662.0 L 448.5,656.0 L 442.0,655.5 L 436.0,657.5 L 425.0,658.5 L 399.0,664.5 L 379.0,667.5 L 310.0,684.5 L 280.0,694.5 L 277.0,694.5 L 271.0,697.5 L 265.0,698.5 L 231.0,711.5 L 219.0,717.5 L 218.5,716.0 L 228.5,689.0 L 248.5,641.0 L 262.5,603.0 L 265.0,600.5 L 288.0,599.5 L 289.0,598.5 L 307.0,598.5 L 308.0,597.5 L 372.0,597.5 L 373.0,598.5 L 393.0,598.5 L 394.0,599.5 L 395.0,598.5 L 396.0,599.5 L 421.5,601.0 L 421.0,599.5 L 417.0,597.5 L 402.0,592.5 L 388.0,584.5 L 369.0,580.5 L 362.0,580.5 L 361.0,579.5 L 296.0,578.5 L 295.0,579.5 L 277.0,579.5 L 276.0,580.5 L 252.0,581.5 L 244.5,588.0 L 243.5,593.0 L 238.5,603.0 L 237.5,608.0 L 232.5,618.0 L 221.5,648.0 L 199.5,699.0 L 196.5,709.0 L 183.5,739.0 L 184.0,741.5 Z M 525.0,686.5 L 612.0,663.5 L 648.0,650.5 L 664.0,642.5 L 679.0,631.5 L 685.5,624.0 L 689.5,617.0 L 691.5,610.0 L 691.5,600.0 L 688.5,590.0 L 681.5,580.0 L 673.0,572.5 L 664.0,566.5 L 642.0,556.5 L 605.0,547.5 L 583.0,545.5 L 582.0,544.5 L 571.0,544.5 L 571.5,561.0 L 566.0,574.5 L 599.0,579.5 L 615.0,584.5 L 625.0,589.5 L 630.5,594.0 L 633.5,600.0 L 633.5,604.0 L 631.5,608.0 L 621.0,616.5 L 599.0,626.5 L 571.0,634.5 L 567.0,634.5 L 536.0,642.5 L 522.0,644.5 L 520.5,646.0 L 526.5,656.0 L 528.5,666.0 L 527.5,667.0 L 527.5,676.0 L 523.5,685.0 L 525.0,686.5 Z M 498.0,570.5 L 496.5,569.0 L 493.5,559.0 L 493.5,549.0 L 495.5,544.0 L 495.0,541.5 L 462.0,539.5 L 447.0,536.5 L 438.0,533.5 L 431.0,529.5 L 426.5,524.0 L 424.5,518.0 L 426.5,510.0 L 430.5,503.0 L 446.0,488.5 L 474.0,472.5 L 506.5,460.0 L 499.5,450.0 L 497.5,440.0 L 496.0,438.5 L 475.0,445.5 L 444.0,458.5 L 414.0,476.5 L 395.5,494.0 L 391.5,500.0 L 386.5,511.0 L 384.5,526.0 L 387.5,537.0 L 392.5,545.0 L 404.0,555.5 L 415.0,561.5 L 436.0,567.5 L 446.0,568.5 L 447.0,569.5 L 455.0,569.5 L 456.0,570.5 L 494.0,571.5 L 495.0,572.5 L 497.0,572.5 L 498.0,570.5 Z M 840.0,741.5 L 778.5,587.0 L 771.0,581.5 L 751.0,580.5 L 750.0,579.5 L 749.0,580.5 L 747.0,579.5 L 703.5,580.0 L 707.5,586.0 L 711.0,598.5 L 749.0,599.5 L 750.0,600.5 L 760.5,601.0 L 803.5,710.0 L 806.0,719.5 L 790.0,718.5 L 789.0,717.5 L 775.0,717.5 L 774.0,716.5 L 759.0,716.5 L 758.0,715.5 L 721.0,715.5 L 720.0,714.5 L 675.0,715.5 L 674.0,716.5 L 652.0,717.5 L 651.0,718.5 L 631.0,720.5 L 591.0,729.5 L 589.5,731.0 L 594.0,731.5 L 617.0,726.5 L 644.0,724.5 L 645.0,723.5 L 646.0,724.5 L 647.0,723.5 L 702.0,723.5 L 703.0,724.5 L 719.0,724.5 L 720.0,725.5 L 753.0,727.5 L 760.0,729.5 L 775.0,730.5 L 776.0,731.5 L 782.0,731.5 L 783.0,732.5 L 789.0,732.5 L 796.0,734.5 L 820.0,737.5 L 836.0,741.5 L 840.0,741.5 Z M 659.0,267.5 L 672.0,265.5 L 693.0,260.5 L 720.0,251.5 L 737.0,242.5 L 739.0,242.5 L 741.5,239.0 L 741.5,234.0 L 738.0,230.5 L 703.0,219.5 L 667.0,212.5 L 650.0,211.5 L 649.5,267.0 L 659.0,267.5 Z M 565.5,445.0 L 628.0,433.5 L 649.0,426.5 L 658.0,421.5 L 666.5,414.0 L 672.5,403.0 L 672.5,392.0 L 665.5,377.0 L 651.0,362.5 L 641.0,366.5 L 629.0,367.5 L 637.5,377.0 L 642.5,385.0 L 643.5,396.0 L 641.5,400.0 L 635.0,405.5 L 618.0,412.5 L 598.0,417.5 L 565.0,423.5 L 564.5,425.0 L 566.5,430.0 L 566.5,443.0 L 565.5,445.0 Z M 640.0,358.5 L 650.0,354.5 L 653.5,351.0 L 655.5,344.0 L 653.5,339.0 L 651.0,336.5 L 647.0,333.5 L 640.5,331.0 L 640.5,202.0 L 636.0,196.5 L 631.0,195.5 L 625.5,199.0 L 623.5,204.0 L 624.5,329.0 L 623.0,331.5 L 614.0,335.5 L 609.5,340.0 L 608.5,347.0 L 609.5,350.0 L 615.0,355.5 L 619.0,357.5 L 625.0,359.5 L 640.0,358.5 Z M 484.0,697.5 L 495.0,696.5 L 502.0,693.5 L 511.5,685.0 L 516.5,674.0 L 516.5,663.0 L 512.5,653.0 L 506.0,645.5 L 494.0,639.5 L 484.0,638.5 L 471.0,643.5 L 461.5,653.0 L 458.5,660.0 L 457.5,671.0 L 461.5,683.0 L 468.0,690.5 L 479.0,696.5 L 484.0,697.5 Z M 539.0,581.5 L 547.0,578.5 L 556.5,569.0 L 560.5,560.0 L 560.5,548.0 L 558.5,542.0 L 554.5,536.0 L 547.0,529.5 L 536.0,525.5 L 524.0,526.5 L 515.0,531.5 L 508.5,539.0 L 504.5,549.0 L 504.5,559.0 L 508.5,569.0 L 517.0,577.5 L 526.0,581.5 L 539.0,581.5 Z M 538.0,460.5 L 547.0,456.5 L 553.5,450.0 L 557.5,440.0 L 557.5,431.0 L 555.5,425.0 L 548.0,415.5 L 537.0,410.5 L 527.0,410.5 L 518.0,414.5 L 510.5,422.0 L 507.5,428.0 L 507.5,433.0 L 506.5,434.0 L 507.5,442.0 L 511.5,450.0 L 518.0,456.5 L 528.0,460.5 L 538.0,460.5 Z " fillRule="evenodd"/>
                        </svg>
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-900">LearningPath</span>
                    </Link>
                    {/*
                      Center nav pill — only rendered for logged-in visitors so a returning
                      user (e.g. with "Remember me") can jump straight into Dashboard /
                      Schedule / Account from the landing page. col-start-2 keeps it centered
                      in the grid even when sides have unequal widths.
                    */}
                    {isLoggedIn && (
                        <nav
                            className={cn(
                                "hidden md:flex items-center gap-1 rounded-full px-2 py-1.5",
                                "border border-foreground/10 bg-white/70 backdrop-blur-sm",
                                "dark:border-white/10 dark:bg-white/[0.04]",
                                "sm:col-start-2 sm:justify-self-center"
                            )}
                            aria-label="Primary"
                        >
                            {AUTH_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="rounded-full px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    )}
                    {/*
                      Right side of the landing header. Show login/signup dialogs only to logged-out
                      visitors; if a logged-in user lands back on `/`, they get a Log Out button
                      instead, since prompting them to log in again would be confusing.
                      col-start-3 pins this to the third grid column so it stays right-aligned
                      regardless of whether the center nav is rendered.
                    */}
                    {/* clear-bubble pill matching the dashboard's right-side actions:
                        transparent theme toggle + filled blue/yellow action button(s) inside
                        a frosted-glass container so the look is consistent across routes. */}
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-full px-2 py-1 sm:col-start-3 sm:justify-self-end",
                            "border border-foreground/10 bg-white/70 backdrop-blur-sm",
                            "dark:border-white/10 dark:bg-white/[0.04]"
                        )}
                    >
                        <ThemeToggle className="h-8 w-8 rounded-full border-transparent bg-transparent text-gray-700 hover:bg-gray-100 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10" />
                        {isLoggedIn ? (
                            <Button
                                onClick={handleLogOut}
                                className={cn(
                                    "h-8 rounded-full px-4 text-sm font-semibold",
                                    "bg-blue-700 text-white hover:bg-blue-800",
                                    "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
                                )}
                            >
                                Log out
                            </Button>
                        ) : (
                            <>
                                <DialogLogin
                                    open={loginOpen}
                                    onOpenChange={setLoginOpen}
                                    onSwitchToSignup={() => {
                                        setLoginOpen(false)
                                        setRegisterOpen(true)
                                    }}
                                />
                                <DialogSignin
                                    open={registerOpen}
                                    onOpenChange={setRegisterOpen}
                                    //fallback: register worked but auto-login failed
                                    //→ close signup, open login so user can retry
                                    onRegisterSuccess={() => {
                                        setRegisterOpen(false)
                                        setLoginOpen(true)
                                    }}
                                    //happy path: register + auto-login both worked
                                    //→ just close signup; navigation to /dashboard
                                    //  is handled inside the form
                                    onAutoLoginSuccess={() => setRegisterOpen(false)}
                                />
                            </>
                        )}
                    </div>
                </div>

            </header>
        );
    }
    else{
        // logged-in app shell — three rounded "pills" on a transparent strip:
        //   left  → brand
        //   center → Dashboard / Schedule / Account
        //   right → theme toggle + log out
        // header is fully transparent so the dashboard's fixed-position backdrop
        // (meteors / origami) flows continuously underneath it. relative+z-10
        // keeps the pills stacked above that backdrop.
        return (
            <header className="relative z-10 w-full bg-transparent">
                {/* same wrapper as the landing header — full-width with p-10 padding and a
                    3-col grid on sm+ — so the brand/nav/actions sit at identical viewport
                    positions when navigating between landing and dashboard (no jump). */}
                <div className="w-full h-fit p-10 flex flex-col items-center gap-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4">
                    {/* brand pill — yellow filled in dark to match the mockup, tinted glass in light.
                        href="/" so clicking the logo always takes the user back to the landing page,
                        matching standard "logo = home" convention. */}
                    <Link
                        href="/"
                        aria-label="Go to landing page"
                        className={cn(
                            "group inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ease-out active:scale-[0.98]",
                            "border border-foreground/10 bg-white/70 backdrop-blur-sm",
                            "dark:border-yellow-300/50 dark:bg-yellow-300/95 dark:backdrop-blur-none",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            "sm:col-start-1 sm:justify-self-start"
                        )}
                    >
                        <svg
                            className="h-7 w-7 fill-foreground transition-transform duration-300 ease-out group-hover:scale-110 dark:fill-gray-900"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1024 1024"
                            aria-hidden
                        >
                            <path d="M 522.0,827.5 L 537.0,824.5 L 549.0,820.5 L 565.0,811.5 L 575.0,802.5 L 910.0,802.5 L 914.0,800.5 L 917.5,796.0 L 918.5,789.0 L 860.5,673.0 L 858.5,671.0 L 842.5,637.0 L 836.0,631.5 L 829.0,631.5 L 825.0,633.5 L 815.0,635.5 L 813.5,637.0 L 826.5,669.0 L 837.5,692.0 L 839.5,699.0 L 849.5,720.0 L 851.5,727.0 L 862.5,751.0 L 863.0,754.5 L 796.0,741.5 L 752.0,736.5 L 751.0,735.5 L 743.0,735.5 L 742.0,734.5 L 719.0,733.5 L 718.0,732.5 L 717.0,733.5 L 715.0,732.5 L 699.0,732.5 L 698.0,731.5 L 695.0,732.5 L 693.0,731.5 L 638.0,732.5 L 637.0,733.5 L 621.0,734.5 L 620.0,735.5 L 593.0,739.5 L 563.0,748.5 L 535.0,762.5 L 520.0,773.5 L 512.0,781.5 L 496.0,767.5 L 487.0,761.5 L 458.0,747.5 L 443.0,742.5 L 417.0,736.5 L 398.0,734.5 L 397.0,733.5 L 373.0,732.5 L 372.0,731.5 L 327.0,731.5 L 326.0,732.5 L 322.0,731.5 L 321.0,732.5 L 306.0,732.5 L 305.0,733.5 L 271.0,735.5 L 270.0,736.5 L 254.0,737.5 L 253.0,738.5 L 214.0,743.5 L 160.0,754.5 L 166.5,737.0 L 170.5,730.0 L 172.5,723.0 L 176.5,716.0 L 178.5,709.0 L 185.5,695.0 L 187.5,688.0 L 191.5,681.0 L 209.5,638.0 L 209.0,636.5 L 202.0,633.5 L 194.0,631.5 L 187.0,631.5 L 180.5,637.0 L 105.5,787.0 L 104.5,791.0 L 105.5,796.0 L 107.5,799.0 L 114.0,802.5 L 449.0,802.5 L 463.0,814.5 L 483.0,823.5 L 503.0,827.5 L 520.0,827.5 L 521.0,826.5 L 522.0,827.5 Z M 184.0,741.5 L 214.0,735.5 L 220.0,735.5 L 226.0,733.5 L 262.0,729.5 L 270.0,727.5 L 303.0,725.5 L 304.0,724.5 L 317.0,724.5 L 318.0,723.5 L 341.0,723.5 L 342.0,722.5 L 381.0,723.5 L 382.0,724.5 L 391.0,724.5 L 392.0,725.5 L 393.0,724.5 L 394.0,725.5 L 401.0,725.5 L 402.0,726.5 L 425.0,729.5 L 447.0,735.5 L 460.0,722.5 L 470.0,715.5 L 478.0,711.5 L 483.0,710.5 L 483.5,708.0 L 477.0,707.5 L 464.0,701.5 L 454.5,693.0 L 448.5,682.0 L 446.5,675.0 L 446.5,662.0 L 448.5,656.0 L 442.0,655.5 L 436.0,657.5 L 425.0,658.5 L 399.0,664.5 L 379.0,667.5 L 310.0,684.5 L 280.0,694.5 L 277.0,694.5 L 271.0,697.5 L 265.0,698.5 L 231.0,711.5 L 219.0,717.5 L 218.5,716.0 L 228.5,689.0 L 248.5,641.0 L 262.5,603.0 L 265.0,600.5 L 288.0,599.5 L 289.0,598.5 L 307.0,598.5 L 308.0,597.5 L 372.0,597.5 L 373.0,598.5 L 393.0,598.5 L 394.0,599.5 L 395.0,598.5 L 396.0,599.5 L 421.5,601.0 L 421.0,599.5 L 417.0,597.5 L 402.0,592.5 L 388.0,584.5 L 369.0,580.5 L 362.0,580.5 L 361.0,579.5 L 296.0,578.5 L 295.0,579.5 L 277.0,579.5 L 276.0,580.5 L 252.0,581.5 L 244.5,588.0 L 243.5,593.0 L 238.5,603.0 L 237.5,608.0 L 232.5,618.0 L 221.5,648.0 L 199.5,699.0 L 196.5,709.0 L 183.5,739.0 L 184.0,741.5 Z M 525.0,686.5 L 612.0,663.5 L 648.0,650.5 L 664.0,642.5 L 679.0,631.5 L 685.5,624.0 L 689.5,617.0 L 691.5,610.0 L 691.5,600.0 L 688.5,590.0 L 681.5,580.0 L 673.0,572.5 L 664.0,566.5 L 642.0,556.5 L 605.0,547.5 L 583.0,545.5 L 582.0,544.5 L 571.0,544.5 L 571.5,561.0 L 566.0,574.5 L 599.0,579.5 L 615.0,584.5 L 625.0,589.5 L 630.5,594.0 L 633.5,600.0 L 633.5,604.0 L 631.5,608.0 L 621.0,616.5 L 599.0,626.5 L 571.0,634.5 L 567.0,634.5 L 536.0,642.5 L 522.0,644.5 L 520.5,646.0 L 526.5,656.0 L 528.5,666.0 L 527.5,667.0 L 527.5,676.0 L 523.5,685.0 L 525.0,686.5 Z M 498.0,570.5 L 496.5,569.0 L 493.5,559.0 L 493.5,549.0 L 495.5,544.0 L 495.0,541.5 L 462.0,539.5 L 447.0,536.5 L 438.0,533.5 L 431.0,529.5 L 426.5,524.0 L 424.5,518.0 L 426.5,510.0 L 430.5,503.0 L 446.0,488.5 L 474.0,472.5 L 506.5,460.0 L 499.5,450.0 L 497.5,440.0 L 496.0,438.5 L 475.0,445.5 L 444.0,458.5 L 414.0,476.5 L 395.5,494.0 L 391.5,500.0 L 386.5,511.0 L 384.5,526.0 L 387.5,537.0 L 392.5,545.0 L 404.0,555.5 L 415.0,561.5 L 436.0,567.5 L 446.0,568.5 L 447.0,569.5 L 455.0,569.5 L 456.0,570.5 L 494.0,571.5 L 495.0,572.5 L 497.0,572.5 L 498.0,570.5 Z M 840.0,741.5 L 778.5,587.0 L 771.0,581.5 L 751.0,580.5 L 750.0,579.5 L 749.0,580.5 L 747.0,579.5 L 703.5,580.0 L 707.5,586.0 L 711.0,598.5 L 749.0,599.5 L 750.0,600.5 L 760.5,601.0 L 803.5,710.0 L 806.0,719.5 L 790.0,718.5 L 789.0,717.5 L 775.0,717.5 L 774.0,716.5 L 759.0,716.5 L 758.0,715.5 L 721.0,715.5 L 720.0,714.5 L 675.0,715.5 L 674.0,716.5 L 652.0,717.5 L 651.0,718.5 L 631.0,720.5 L 591.0,729.5 L 589.5,731.0 L 594.0,731.5 L 617.0,726.5 L 644.0,724.5 L 645.0,723.5 L 646.0,724.5 L 647.0,723.5 L 702.0,723.5 L 703.0,724.5 L 719.0,724.5 L 720.0,725.5 L 753.0,727.5 L 760.0,729.5 L 775.0,730.5 L 776.0,731.5 L 782.0,731.5 L 783.0,732.5 L 789.0,732.5 L 796.0,734.5 L 820.0,737.5 L 836.0,741.5 L 840.0,741.5 Z M 659.0,267.5 L 672.0,265.5 L 693.0,260.5 L 720.0,251.5 L 737.0,242.5 L 739.0,242.5 L 741.5,239.0 L 741.5,234.0 L 738.0,230.5 L 703.0,219.5 L 667.0,212.5 L 650.0,211.5 L 649.5,267.0 L 659.0,267.5 Z M 565.5,445.0 L 628.0,433.5 L 649.0,426.5 L 658.0,421.5 L 666.5,414.0 L 672.5,403.0 L 672.5,392.0 L 665.5,377.0 L 651.0,362.5 L 641.0,366.5 L 629.0,367.5 L 637.5,377.0 L 642.5,385.0 L 643.5,396.0 L 641.5,400.0 L 635.0,405.5 L 618.0,412.5 L 598.0,417.5 L 565.0,423.5 L 564.5,425.0 L 566.5,430.0 L 566.5,443.0 L 565.5,445.0 Z M 640.0,358.5 L 650.0,354.5 L 653.5,351.0 L 655.5,344.0 L 653.5,339.0 L 651.0,336.5 L 647.0,333.5 L 640.5,331.0 L 640.5,202.0 L 636.0,196.5 L 631.0,195.5 L 625.5,199.0 L 623.5,204.0 L 624.5,329.0 L 623.0,331.5 L 614.0,335.5 L 609.5,340.0 L 608.5,347.0 L 609.5,350.0 L 615.0,355.5 L 619.0,357.5 L 625.0,359.5 L 640.0,358.5 Z M 484.0,697.5 L 495.0,696.5 L 502.0,693.5 L 511.5,685.0 L 516.5,674.0 L 516.5,663.0 L 512.5,653.0 L 506.0,645.5 L 494.0,639.5 L 484.0,638.5 L 471.0,643.5 L 461.5,653.0 L 458.5,660.0 L 457.5,671.0 L 461.5,683.0 L 468.0,690.5 L 479.0,696.5 L 484.0,697.5 Z M 539.0,581.5 L 547.0,578.5 L 556.5,569.0 L 560.5,560.0 L 560.5,548.0 L 558.5,542.0 L 554.5,536.0 L 547.0,529.5 L 536.0,525.5 L 524.0,526.5 L 515.0,531.5 L 508.5,539.0 L 504.5,549.0 L 504.5,559.0 L 508.5,569.0 L 517.0,577.5 L 526.0,581.5 L 539.0,581.5 Z M 538.0,460.5 L 547.0,456.5 L 553.5,450.0 L 557.5,440.0 L 557.5,431.0 L 555.5,425.0 L 548.0,415.5 L 537.0,410.5 L 527.0,410.5 L 518.0,414.5 L 510.5,422.0 L 507.5,428.0 L 507.5,433.0 L 506.5,434.0 L 507.5,442.0 L 511.5,450.0 L 518.0,456.5 L 528.0,460.5 L 538.0,460.5 Z " fillRule="evenodd"/>
                        </svg>
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-900">LearningPath</span>
                    </Link>

                    {/* center nav pill — hidden on mobile to keep the bar tidy.
                        col-start-2 + justify-self-center pins it to the literal viewport
                        center, matching the landing header layout. */}
                    <nav
                        className={cn(
                            "hidden md:flex items-center gap-1 rounded-full px-2 py-1.5",
                            "border border-foreground/10 bg-white/70 backdrop-blur-sm",
                            "dark:border-white/10 dark:bg-white/[0.04]",
                            "sm:col-start-2 sm:justify-self-center"
                        )}
                        aria-label="Primary"
                    >
                        {AUTH_NAV.map((item) => {
                            const active = pathname === item.href || pathname?.startsWith(item.href + "/")
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                                        // active: colored text PLUS an underline — the underline
                                        // is a non-color cue so colorblind users still see which
                                        // link is active. decoration defaults to currentColor so
                                        // the underline tracks the text color in both themes.
                                        active
                                            ? "text-primary underline underline-offset-4 decoration-2 dark:text-yellow-300"
                                            : "text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white"
                                    )}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* right-side actions pill — theme + logout.
                        col-start-3 keeps it pinned to the third grid column, matching landing. */}
                    <div
                        className={cn(
                            "flex items-center gap-2 rounded-full px-2 py-1",
                            "border border-foreground/10 bg-white/70 backdrop-blur-sm",
                            "dark:border-white/10 dark:bg-white/[0.04]",
                            "sm:col-start-3 sm:justify-self-end"
                        )}
                    >
                        <ThemeToggle className="h-8 w-8 rounded-full border-transparent bg-transparent text-gray-700 hover:bg-gray-100 dark:bg-transparent dark:text-slate-200 dark:hover:bg-white/10" />
                        {isLoggedIn && (
                            <Button
                                onClick={handleLogOut}
                                className={cn(
                                    "h-8 rounded-full px-4 text-sm font-semibold",
                                    "bg-blue-700 text-white hover:bg-blue-800",
                                    "dark:bg-yellow-300 dark:text-gray-900 dark:hover:bg-yellow-200"
                                )}
                            >
                                Log out
                            </Button>
                        )}
                    </div>
                </div>
            </header>
        );
    }

}