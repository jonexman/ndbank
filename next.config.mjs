import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/admin/config", destination: "/admin/settings/config", permanent: true },
      { source: "/admin/config/account-types", destination: "/admin/settings/config/account-types", permanent: true },
      { source: "/admin/management/currencies", destination: "/admin/settings/currencies", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);

