/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental:{
        serverActions: true,
        serverComponentsExternalPackages:['mongoose']
    },
    images:{
        // domains:['m.media-amazon.com','www.flipkart.com', 'rukminim2.flixcart.com']
        domains:['m.media-amazon.com']
    },
};
export default nextConfig;
