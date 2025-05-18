/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // This is a common default, you can keep it or change it
  // Add other configurations you specifically need for your project here

  images: {
    remotePatterns: [
      {
        protocol: 'https', // Or 'http' if necessary
        hostname: 'your-first-external-hostname.com', // <-- **IMPORTANT: REPLACE THIS** with the actual hostname
        // port: '', // Optional: if the remote URL uses a specific port
        // pathname: '/path/to/images/**', // Optional: if you want to be more specific about the path
      },
      // { // You can add more remote patterns if you load images from multiple external domains
      //  protocol: 'https',
      //  hostname: 'your-second-external-hostname.com', // <-- **IMPORTANT: REPLACE THIS**
      // },
    ],
  },

  // The 'experimental' block that caused the 'allowedCrossOrigins' error
  // has been removed. If you had other valid experimental features,
  // you would keep the 'experimental' object and just remove 'allowedCrossOrigins'.
  // If 'allowedCrossOrigins' was intended for CORS, you should handle CORS
  // through Next.js API route headers or middleware instead.
  // Example of an empty experimental block if you had other features:
  // experimental: {
  //  // otherExperimentalFeature: true,
  // },
};

module.exports = nextConfig;
