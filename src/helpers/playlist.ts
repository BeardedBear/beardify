import { PublicUser } from "../@types/PublicUser";
import { useAuth } from "../views/auth/AuthStore";

export function isPlaylistOwner(owner: PublicUser): boolean {
  return owner.id === useAuth().me?.id;
}
