import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA({
  dest: "public",
  disable: isDev,
})(nextConfig);