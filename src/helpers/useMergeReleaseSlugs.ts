import { Release } from "@/@types/Releases";

export function useMergeReleaseSlugs(array: Release[]): Release[] {
  return array.reduce((acc: Release[], value) => {
    if (acc.some((release) => release.id === value.id)) {
      const existingRelease = acc.find((r) => r.id === value.id);
      existingRelease?.slug.push(value.slug.join());

      return acc;
    }
    return acc.concat(value);
  }, []);
}
