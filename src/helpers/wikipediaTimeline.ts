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
    if (!block) return null;

    return parseEasyTimeline(block);
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
