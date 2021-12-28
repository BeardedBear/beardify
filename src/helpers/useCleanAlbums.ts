export function useCheckLiveAlbum(albumName: string): boolean {
  const cleanedName = albumName.toLowerCase().trim();
  const matches = [
    "live in",
    "live on",
    "live at",
    "live from",
    "live over",
    "in live",
    "on live",
    "\\(live",
    "\\[live",
    "official live",
    "live olympia",
    "live series",
    "live session",
    "live performance",
    "live anthology",
    "live bootleg",
    "\\- live",
    "live\\!",
    "\\…live",
    "live \\'",
    "live 1",
    "live\\, 1",
    "live 2",
    "live\\, 2",
    "\\.\\.\\.live",
    "live\\;",
    "\\: live",
    "world tour",
    "in concert",
    "concert",
    "royal albert hall",
    "wacken",
    "mtv unplugged",
    "live & unplugged",
    "live and unplugged",
    "bbc",
  ];
  return new RegExp(`(${matches.join("|")})`).test(cleanedName) || cleanedName.split(" ").pop() === "live)";
}

export function useCheckReissueAlbum(albumName: string): boolean {
  const cleanedName = albumName.toLowerCase().trim();
  const matches = ["\\(reissue"];
  return new RegExp(`(${matches.join("|")})`).test(cleanedName);
}
