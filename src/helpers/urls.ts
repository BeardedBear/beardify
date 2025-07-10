/**
 * Cleans Spotify API URLs to avoid duplicate prefixes
 * Removes the prefix https://api.spotify.com/v1/ if present to avoid 404 errors
 * @param url The URL to clean
 * @returns The cleaned URL, without the prefix if already present
 */
export function cleanUrl(url: string): string {
  // If the URL is a complete URL with the Spotify API prefix, extract the relative path
  if (url.startsWith("https://api.spotify.com/v1/")) {
    const cleanedUrl = url.substring("https://api.spotify.com/v1/".length);
    // Remove leading slash if present to ensure compatibility with ky prefixUrl
    return cleanedUrl.startsWith("/") ? cleanedUrl.substring(1) : cleanedUrl;
  }
  // Remove leading slash if present to ensure compatibility with ky prefixUrl
  return url.startsWith("/") ? url.substring(1) : url;
}
