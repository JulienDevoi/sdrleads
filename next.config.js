/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'media.licdn.com',
      'media-exp1.licdn.com',
      'media-exp2.licdn.com', 
      'media-exp3.licdn.com',
      'static.licdn.com',
      'logo.clearbit.com', // For company logos
      'cdn.apollo.io', // For Apollo images
      'zenprospect-production.s3.amazonaws.com', // Apollo/ZenProspect profile images
    ],
  },
}

module.exports = nextConfig
