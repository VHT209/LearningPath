//for authentication protected pages

"use client";

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";

export default function AuthLayout({ children }: { children: React.ReactNode }) {

    //State to check authentication status
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    //router for redirection
    const router = useRouter();

    //check authentication immediately when component mounts
    //if failed, redirect to landing page
    useEffect(() => {
        async function checkAuth(){
            const token = getToken();

            if(!token){
                router.replace("/")
                return;
            }

            try {
                const res = await fetch("/api/users/me", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json"
                    },
                });

                if(!res.ok){
                    clearToken();
                    router.replace("/");
                    return;
                }

                setIsAuthenticated(true);
            } catch (error){
                clearToken();
                router.replace("/");
            } finally {
                setLoading(false);
            }

        }
        
        checkAuth();
        // setLoading(false) lives in checkAuth's `finally` — calling it here
        // would race ahead of the /users/me fetch and flash the unauth UI
    }, [router]);
    
    //Consider removing this in real implementation
    if(loading) {
        return <div>Checking authentication...</div>;
    }

    if(!isAuthenticated){
        return null;
    }

    return <>{children}</>
}
