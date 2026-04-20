import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@copilotkit/runtime", "@libsql/client", "libsql", "@lancedb/lancedb"],
};

export default nextConfig;
