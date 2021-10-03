import axios, { AxiosInstance } from "axios";
import { useAuth } from "./views/auth/AuthStore";

export const api = {
  url: "https://api.spotify.com/v1/",
  clientId: "29a0936f4c6c46399f33f6f60a0855e8",
  redirectUri:
    process.env.NODE_ENV !== "production" ? "http://localhost:3000/auth" : "http://beardify.netlify.app/auth",
  scopes:
    "user-read-private%20user-modify-playback-state%20user-read-playback-state%20user-read-currently-playing%20playlist-read-private%20playlist-read-collaborative%20playlist-modify-private%20playlist-modify-public%20user-follow-modify%20user-follow-read%20streaming%20user-read-email%20user-top-read",
};

export function instance(): AxiosInstance {
  const authStore = useAuth();

  return axios.create({
    baseURL: api.url,
    timeout: 5000,
    headers: {
      Authorization: `Bearer ${authStore.accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

// on intercepte les requetes pour mettre à jour `Authorization` depuis le refresh token
// instance().interceptors.request.use(
//   async (config) => {
//     console.log("test");

//     const authStore = useAuth();
//     config.headers = { Authorization: `Bearer ${authStore.auth.accessToken}` };
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// instance().interceptors.request.use(
//   async (config) => {
//     const authStore = useAuth();
//     config.headers = { Authorization: `Bearer ${authStore.auth.accessToken}` };
//     return config;
//   },
//   (error) => Promise.reject(error),
// );
