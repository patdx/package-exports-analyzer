/** @type {import('next').NextConfig} */
module.exports = {
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
