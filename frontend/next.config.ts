import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  //when building the app, create a smaller self-contained server folder
  //that folder only include what app need to run
  output: "standalone",
  // Local dev only: the frontend (:3000) and backend (:8000) run as
  // separate processes, so proxy /api/* to the backend here. In a
  // container/K8s deploy this rewrite is disabled and an Ingress routes
  // /api to the backend Service instead.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
