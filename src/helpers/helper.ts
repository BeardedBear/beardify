export function transformUriToid(uri: string | undefined): string {
  if (!uri) return "";
  return uri.split(":").pop() || uri;
}
