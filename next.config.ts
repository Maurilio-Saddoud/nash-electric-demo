import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isProjectPage = Boolean(repository) && !repository.endsWith(".github.io");
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH ?? (process.env.GITHUB_ACTIONS && isProjectPage ? `/${repository}` : "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath || undefined
};

export default nextConfig;
