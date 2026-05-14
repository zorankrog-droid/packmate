import withPWA from "next-pwa";

const isDev =
  process.env.NODE_ENV ===
  "development";

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName:
          "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);