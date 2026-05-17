import withPWA from "next-pwa";

const isDev =
  process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/packmate-murex\.vercel\.app\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "packmate-start-url",
      },
    },
    {
      urlPattern: /^https:\/\/packmate-murex\.vercel\.app\/.*$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "packmate-pages",
      },
    },
  ],
})(nextConfig);