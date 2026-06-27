import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pipeline parsing libs are server-only; keep them out of the client bundle.
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
