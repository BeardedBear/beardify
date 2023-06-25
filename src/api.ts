import axios, { AxiosInstance } from "axios";
import { useAuth } from "./views/auth/AuthStore";

export const api = {
  url: "https://api.spotify.com/v1/",
  clientId: "29a0936f4c6c46399f33f6f60a0855e8",
  redirectUri:
    process.env.NODE_ENV !== "production" ? "http://localhost:3000/auth" : "http://beardify.netlify.app/auth",
  scopes:
    "user-read-private,user-modify-playback-state,user-read-playback-state,user-read-currently-playing,playlist-read-private,playlist-read-collaborative,playlist-modify-private,playlist-modify-public,user-follow-modify,user-follow-read,streaming,user-read-email,user-top-read,user-library-read,user-read-playback-position,user-read-recently-played",
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
