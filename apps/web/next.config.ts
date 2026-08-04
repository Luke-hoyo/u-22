import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {};

const sentryDsn = process.env.SENTRY_DSN?.trim() ?? process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

export default sentryDsn
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.CI,
      widenClientFileUpload: true,
      disableLogger: true,
      telemetry: false,
      sourcemaps: {
        disable: !process.env.SENTRY_AUTH_TOKEN?.trim()
      }
    })
  : nextConfig;
