// export const next_endpoint = "http://localhost";
// export const next_port = 3000

export const endpoints = {
    next_ip_port: process.env.NEXT_PUBLIC_APP_HOST ?? "localhost:3001",
    MONGODB_URI:  process.env.MONGODB_URI ?? "mongodb://localhost:27017/",
    host_ip_route: process.env.NEXT_PUBLIC_HOST_ROUTE ?? "http://localhost:3001/",
    next_localhost: "localhost:3000",
    next_home: process.env.NEXT_PUBLIC_HOME_URL ?? "http://localhost:3001",
}