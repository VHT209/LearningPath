"use client";

import * as React from "react";
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {Button, buttonVariants } from "@/components/ui/button";
import { NavigationMenuList } from '@base-ui/react';
import { cn } from '@/lib/utils';
import { getToken } from "@/lib/auth";


//creating the list of the navbar items
const NavItems = [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Schedule", link: "/schedule" },
    { label: "Account", link: "/account" },
];

export function Navbar() {
    //get current path so we can re-check the token after every navigation
    //(login redirects from / to /dashboard, logout redirects from any route back to /)
    const pathname = usePathname();

    //mirror the Header pattern: track auth state in a useState so we can hide
    //the whole navbar for logged-out visitors. Without this, the Dashboard/
    //Schedule/Account links sit on the landing page but bounce back via
    //AuthLayout the moment anyone clicks them — confusing and pointless.
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    React.useEffect(() => {
        const sync = () => setIsLoggedIn(!!getToken());
        sync();
        //storage event covers cross-tab logout; same-tab login/logout flows
        //change the pathname which is in this effect's deps
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, [pathname]);

    if (!isLoggedIn) return null;

    return(
        <>
            <DesktopNavbar />
            <MobileNavbar/>
        </>

    )
}

function DesktopNavbar() {
    return (
        <div className="hidden border-separate border-b bg-background md:block bg-primary text-foreground">
            <nav className="w-full h-fit flex items-center justify-between p-5 bg-black-100">
                {/* loop through the nav items and create a new navbar item for each link */}
                {NavItems.map((item) => (
                    <NavbarItem 
                        key={item.label} 
                        link={item.link} 
                        label={item.label} 
                />
                ))}
            </nav>
        </div>

    );
}

{/*code from professor*/}
function MobileNavbar() {
  return (
    <div className="block border-separate bg-background md:hidden">
      <nav className="w-full h-fit flex items-center justify-between p-5 bg-black-100">
        <Sheet>
          {/* Important: Ensure {...props} is applied to the Button */}
          <SheetTrigger
            render={(props) => (
              <Button {...props} variant="ghost" className="p-0">
                <Menu className="w-6 h-6" />
              </Button>
            )}
          />
          {/* Add a side so the component knows where to slide in from */}
          <SheetContent side="left" className="w-[300px]">
            <div className="flex flex-col gap-4 pt-10">
              {NavItems.map((item) => (
                <NavbarItem 
                  key={item.label} 
                  link={item.link} 
                  label={item.label} 
                />
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
}

{/*code from professor*/}
//connecting the nav items to the navbar
interface navItemsProps {
    label: string;
    link: string;
    clickCallBack?: () => void;
}
{/*code from professor*/}
//function to create individual navbar items for each page accordingly
//change css base on current path of the user, to show where they are
function NavbarItem({ link, label, clickCallBack }: Readonly<navItemsProps>) {
    //get current user path
    const pathname = usePathname();
    //confirm if the current path is the same as the link of the navbar item, if so, add animation to it
    const isActive = pathname === link;
    return (
        <div className="relative flex items-center">
            <Link
                href={link}
                className={cn(
                    buttonVariants({variant: "ghost" }),
                        "w-full justify-start text-xl text-foreground hover:text-foreground",
                    isActive && "text-foreground",
                )}
                onClick={() => {
                    if (clickCallBack) clickCallBack();
                }}
            >
                {label}
            </Link>
            {isActive && (
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-foreground rounded" />
            )}
        </div>
    );
}