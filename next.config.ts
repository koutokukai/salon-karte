import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client"],
  // モニター募集LP。実体は public/lp.html（marketing/lp/build.mjs が生成する）
  async rewrites() {
    return [{ source: "/lp", destination: "/lp.html" }];
  },
};

export default nextConfig;
