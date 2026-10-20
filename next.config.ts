import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  devIndicators: false,
  experimental: {
    workerThreads: true,
    webpackBuildWorker: false,
    useTypeScriptCli: false,
    cpus: 2,
  },
};
export default config;
