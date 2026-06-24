import { http } from "@/helpers/http";

/**
 * A parsed EasyTimeline band-members graph (the "<timeline>" / "{{#tag:timeline}}"
 * block found on many Wikipedia band articles). This is by far the richest member
 * timeline source when present: per-member, per-role dated segments.
 */
export interface WikiTimeline {
  /** Members in display order */
  bars: WikiTimelineBar[];
  /** Role id -> color + legend label */
  colors: Record<string, WikiTimelineColor>;
  /** Album / release markers (vertical lines) */
  events: WikiTimelineEvent[];
  /** Range start, fractional year */
  from: number;
  /** Per-member role segments */
  segments: WikiTimelineSegment[];
  /** Range end, fractional year */
  till: number;
}

interface WikiTimelineBar {
  id: string;
  name: string;
}

interface WikiTimelineColor {
  color: string;
  legend: string;
}

interface WikiTimelineEvent {
  colorId: string;
  date: number;
}

interface WikiTimelineSegment {
  barId: string;
  colorId: string;
  from: number;
  /** true when the segment has no explicit end (member still active) */
  openEnded: boolean;
  /** true for thin overlay stripes (secondary roles, EasyTimeline width < default) */
  thin: boolean;
  till: number;
}

/**
 * EasyTimeline named colors mapped to CSS values tuned for a dark UI.
 */
const EASYTIMELINE_COLORS: Record<string, string> = {
  black: "#2b2b2b",
  blue: "#3b7fe2",
  brightgreen: "#5fd35f",
  claret: "#9b2d4f",
  coral: "#e2735a",
  drabgreen: "#6b8e23",
  gray: "#8a8a8a",
  green: "#2e9e4f",
  grey: "#8a8a8a",
  lightorange: "#f3b96a",
  limegreen: "#7ad13a",
  magenta: "#c0399b",
  oceanblue: "#2a6fb0",
  orange: "#e2922e",
  pink: "#f0a8be",
  powderblue: "#9ec9e2",
  purple: "#9b59b6",
  red: "#e2574c",
  redorange: "#e2562e",
  skyblue: "#6fb7e2",
  tan1: "#cdab7e",
  tan2: "#e0c9a6",
  teal: "#1f9e8a",
  white: "#d8d8d8",
  yellow: "#e2cb2e",
};

const DEFAULT_BAR_WIDTH = 13;

/**
 * Fetch and parse a Wikipedia band article's EasyTimeline members graph.
 * @param wikipediaUrl - Full Wikipedia URL (any language; English usually has the graph)
 * @returns The parsed timeline, or null when the article has no timeline block
 */
export async function getWikipediaTimeline(wikipediaUrl: string): Promise<null | WikiTimeline> {
  try {
    const urlMatch = wikipediaUrl.match(/https?:\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)/);
    if (!urlMatch) return null;

    const [, lang, encodedTitle] = urlMatch;
    const title = decodeURIComponent(encodedTitle);

    const params = new URLSearchParams({
      action: "parse",
      format: "json",
      formatversion: "2",
      origin: "*",
      page: title,
      prop: "wikitext",
    });

    const response = await http.get(`https://${lang}.wikipedia.org/w/api.php?${params.toString()}`);
    const data = await response.json<{ parse?: { wikitext?: string } }>();
    const wikitext = data.parse?.wikitext;
    if (!wikitext) return null;

    const block = extractTimelineBlock(wikitext);
    if (block) {
      const result = parseEasyTimeline(block);
      if (result) return result;
    }

    return parseBandMembersSection(wikitext);
  } catch {
    return null;
  }
}

/**
 * Extract the raw EasyTimeline DSL from either `<timeline>...</timeline>` or the
 * parser-function form `{{#tag:timeline|...}}` (brace-aware for the latter).
 */
function extractTimelineBlock(wikitext: string): null | string {
  const tagMatch = wikitext.match(/<timeline>([\s\S]*?)<\/timeline>/);
  if (tagMatch) return tagMatch[1];

  const marker = "{{#tag:timeline|";
  const start = wikitext.indexOf(marker);
  if (start === -1) return null;

  let depth = 2;
  let i = start + marker.length;
  const contentStart = i;
  while (i < wikitext.length && depth > 0) {
    if (wikitext.startsWith("{{", i)) {
      depth += 2;
      i += 2;
    } else if (wikitext.startsWith("}}", i)) {
      depth -= 2;
      i += 2;
    } else {
      i += 1;
    }
  }
  return wikitext.slice(contentStart, i - 2);
}

/**
 * Fallback parser: extract member timelines from a Wikipedia "Band members" section
 * when no EasyTimeline block is present. Handles lines like:
 *   * [[Name|Display]] – instruments (2007–present)
 *   * [[Name]] – guitar (2007–2022; died 2022)
 */
function parseBandMembersSection(wikitext: string): null | WikiTimeline {
  const sectionStart = wikitext.search(/^==\s*(?:band\s+)?members?\s*==/im);
  if (sectionStart === -1) return null;

  const rest = wikitext.slice(sectionStart);
  const nextSection = rest.match(/\n==(?!=)[^=]/);
  const section = nextSection ? rest.slice(0, nextSection.index) : rest;

  const COLOR_IDS = [
    "blue", "green", "orange", "red", "purple", "teal", "coral", "yellow", "skyblue", "limegreen",
  ] as const;

  const bars: WikiTimelineBar[] = [];
  const segments: WikiTimelineSegment[] = [];
  const roleColorMap = new Map<string, string>();
  const barRoles = new Map<string, string>();
  let colorIdx = 0;
  let minYear = Infinity;
  let maxYear = -Infinity;

  for (const rawLine of section.split("\n")) {
    if (!rawLine.startsWith("*") || rawLine.startsWith("**")) continue;

    const line = stripWikiMarkup(rawLine.slice(1).trim());

    // Name – role (YYYY–YYYY) or (YYYY–present)
    const dashIdx = line.search(/\s[–—-]\s/);
    if (dashIdx === -1) continue;
    const name = line.slice(0, dashIdx).trim();
    const rest2 = line.slice(dashIdx + 1).replace(/^[–—-]\s*/, "").trim();

    const dateMatch = rest2.match(/\((\d{4})\s*[–—-]\s*(\d{4}|present)/i);
    if (!dateMatch) continue;

    const fromYear = parseInt(dateMatch[1]);
    const openEnded = /present/i.test(dateMatch[2]);
    const tillYear = openEnded ? todayFraction() : parseInt(dateMatch[2]);

    if (isNaN(fromYear)) continue;

    // Role: text between dash and opening paren, take primary instrument (before first comma)
    const roleRaw = rest2.slice(0, rest2.indexOf("(")).trim();
    const role = roleRaw.split(/[,(]/)[0].trim().toLowerCase() || "member";
    const colorId = role.replace(/\W+/g, "_");

    const barId = `m${bars.length}`;
    const existing = bars.find((b) => b.name === name);
    const actualBarId = existing ? existing.id : barId;
    if (!existing) {
      bars.push({ id: barId, name });
      barRoles.set(barId, role);
    }

    if (!roleColorMap.has(role)) {
      roleColorMap.set(role, COLOR_IDS[colorIdx++ % COLOR_IDS.length]);
    }

    minYear = Math.min(minYear, fromYear);
    maxYear = Math.max(maxYear, tillYear);

    segments.push({ barId: actualBarId, colorId, from: fromYear, openEnded, thin: false, till: tillYear });
  }

  if (bars.length === 0 || segments.length === 0) return null;

  // Group bars by role (like EasyTimeline), sort by role then by earliest start
  const roleOrder = [...new Set(bars.map((b) => barRoles.get(b.id) ?? "member"))];
  bars.sort((a, b) => {
    const roleA = barRoles.get(a.id) ?? "member";
    const roleB = barRoles.get(b.id) ?? "member";
    const idxA = roleOrder.indexOf(roleA);
    const idxB = roleOrder.indexOf(roleB);
    if (idxA !== idxB) return idxA - idxB;
    const segsA = segments.filter((s) => s.barId === a.id);
    const segsB = segments.filter((s) => s.barId === b.id);
    return (segsA.length ? Math.min(...segsA.map((s) => s.from)) : 0)
      - (segsB.length ? Math.min(...segsB.map((s) => s.from)) : 0);
  });

  const colors: Record<string, WikiTimelineColor> = {};
  for (const [role, colorName] of roleColorMap) {
    const colorId = role.replace(/\W+/g, "_");
    colors[colorId] = { color: EASYTIMELINE_COLORS[colorName] ?? "#8a8a8a", legend: role };
  }

  return {
    bars,
    colors,
    events: [],
    from: Math.floor(minYear),
    segments,
    till: Math.ceil(maxYear),
  };
}

/**
 * Parse the EasyTimeline DSL into a structured, render-ready model.
 */
function parseEasyTimeline(block: string): null | WikiTimeline {
  const lines = block.split("\n");

  const formatMatch = block.match(/DateFormat\s*=\s*(\S+)/);
  const format = (formatMatch?.[1] ?? "mm/dd/yyyy").toLowerCase();

  // Period range (fallback to a wide span if absent)
  const periodFrom = block.match(/Period\s*=\s*from:(\S+)/)?.[1];
  const periodTill = block.match(/Period[^\n]*till:(\S+)/)?.[1];
  const range = { from: 2000, till: todayFraction() };
  range.from = periodFrom ? (toFractionalYear(periodFrom, format, range) ?? range.from) : range.from;
  range.till = periodTill ? (toFractionalYear(periodTill, format, range) ?? range.till) : range.till;

  const colors: Record<string, WikiTimelineColor> = {};
  const bars: WikiTimelineBar[] = [];
  const segments: WikiTimelineSegment[] = [];
  const events: WikiTimelineEvent[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    const colorMatch = line.match(/^id:(\S+)\s+value:(\S+(?:\([^)]*\))?)(?:\s+legend:(\S+))?/);
    if (colorMatch) {
      const [, id, value, legend] = colorMatch;
      colors[id] = { color: resolveColor(value), legend: (legend ?? id).replace(/_/g, " ") };
      continue;
    }

    const barMatch = line.match(/^bar:(\S+)\s+text:\s*"?([^"]+?)"?\s*$/);
    if (barMatch && !line.includes("from:")) {
      bars.push({ id: barMatch[1], name: barMatch[2].trim() });
      continue;
    }

    const plotMatch = line.match(/^bar:(\S+)\s+from:(\S+)\s+till:(\S+)\s+color:(\S+)(?:\s+width:(\d+))?/);
    if (plotMatch) {
      const [, barId, from, till, colorId, width] = plotMatch;
      const fromYear = toFractionalYear(from, format, range);
      const tillYear = toFractionalYear(till, format, range);
      const openEnded = till === "end" || till.includes("#time");
      if (fromYear !== null && tillYear !== null) {
        segments.push({
          barId,
          colorId,
          from: fromYear,
          openEnded,
          thin: width !== undefined && parseInt(width, 10) < DEFAULT_BAR_WIDTH,
          till: tillYear,
        });
      }
      continue;
    }

    const eventMatch = line.match(/^at:(\S+)\s+color:(\S+)/);
    if (eventMatch) {
      const date = toFractionalYear(eventMatch[1], format, range);
      if (date !== null) events.push({ colorId: eventMatch[2], date });
    }
  }

  if (bars.length === 0 || segments.length === 0) return null;

  return { bars, colors, events, from: Math.floor(range.from), segments, till: Math.ceil(range.till) };
}

/**
 * Resolve an EasyTimeline color token (e.g. "red", "gray(0.6)") to a CSS color.
 */
function resolveColor(token: string): string {
  const name = token.split("(")[0].toLowerCase();
  return EASYTIMELINE_COLORS[name] ?? "#8a8a8a";
}

/**
 * Strip Wikipedia wikitext markup, leaving plain text.
 */
function stripWikiMarkup(text: string): string {
  return text
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "")
    .replace(/<ref[^/]*\/>/g, "")
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'{2,3}/g, "")
    .replace(/{{[^}]*}}/g, "")
    .trim();
}

/**
 * Today as a fractional year.
 */
function todayFraction(): number {
  const now = new Date();
  return now.getFullYear() + now.getMonth() / 12 + (now.getDate() - 1) / 365;
}

/**
 * Convert an EasyTimeline date token to a fractional year, honoring the
 * DateFormat and the start/end keywords (and the {{#time}} = today value).
 */
function toFractionalYear(
  token: string,
  format: string,
  range: { from: number; till: number },
): null | number {
  const value = token.trim();
  if (value === "start") return range.from;
  if (value === "end") return range.till;
  if (value.includes("#time")) return todayFraction();

  // Full date with separators, e.g. mm/dd/yyyy or dd/mm/yyyy
  const parts = value.split(/[/.-]/).map((p) => parseInt(p, 10));
  if (parts.some((n) => isNaN(n))) {
    const yearOnly = parseInt(value, 10);
    return isNaN(yearOnly) ? null : yearOnly;
  }

  if (parts.length === 1) return parts[0];

  let year: number;
  let month: number;
  let day: number;
  if (format.startsWith("dd")) {
    [day, month, year] = parts;
  } else if (format.startsWith("yyyy")) {
    [year, month, day] = parts;
  } else {
    [month, day, year] = parts;
  }
  return year + (month - 1) / 12 + (day - 1) / 365;
}
