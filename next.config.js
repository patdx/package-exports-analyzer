/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  redirects() {
    return [
      {
        source: '/',
        destination: '/exports-test',
        permanent: false,
      },
    ];
  },
};
