import { describe, expect, it } from "vitest";

import { cleanWikipediaHtml } from "@/helpers/wikidata";

/** MediaWiki's `action=parse` heading shape, as shipped today. */
function heading(level: number, title: string): string {
  return `<div class="mw-heading mw-heading${level}"><h${level} id="${title}">${title}</h${level}></div>`;
}

describe("cleanWikipediaHtml", () => {
  it("drops an excluded section and everything under it, up to the next same-level heading", () => {
    const html = `<div class="mw-parser-output">
      ${heading(2, "History")}<p>kept</p>
      ${heading(2, "Discography")}<p>dropped</p><ul><li>dropped</li></ul>
      ${heading(2, "Legacy")}<p>also kept</p>
    </div>`;

    const result = cleanWikipediaHtml(html);

    expect(result).toContain("kept");
    expect(result).toContain("also kept");
    expect(result).not.toContain("dropped");
    expect(result).not.toContain("Discography");
  });

  it("keeps a deeper heading that follows an excluded one inside the removed range", () => {
    const html = `<div class="mw-parser-output">
      ${heading(2, "References")}${heading(3, "Notes")}<p>gone</p>
      ${heading(2, "Style")}<p>survives</p>
    </div>`;

    const result = cleanWikipediaHtml(html);

    expect(result).not.toContain("gone");
    expect(result).toContain("survives");
  });

  it("matches the prefix patterns, not just exact titles", () => {
    const html = `<div class="mw-parser-output">${heading(2, "Discographie studio")}<p>gone</p></div>`;

    expect(cleanWikipediaHtml(html)).not.toContain("gone");
  });

  it("turns article links into data-wiki-title and keeps their text", () => {
    const html = `<div class="mw-parser-output"><p>Produced by <a href="/wiki/Nigel_Godrich">Nigel Godrich</a>.</p></div>`;

    const result = cleanWikipediaHtml(html);

    expect(result).toContain("data-wiki-title=\"Nigel Godrich\"");
    expect(result).toContain("Nigel Godrich");
    expect(result).not.toContain("href");
  });

  it("unwraps links that do not point at an article subject", () => {
    const html = `<div class="mw-parser-output"><p>`
      + `<a href="/wiki/File:Cover.jpg">file</a>`
      + `<a href="/wiki/Missing" class="new">red</a>`
      + `<a href="https://example.com">external</a>`
      + `</p></div>`;

    const result = cleanWikipediaHtml(html);

    expect(result).not.toContain("<a");
    expect(result).toContain("file");
    expect(result).toContain("red");
    expect(result).toContain("external");
  });

  it("removes chrome and inline styles that fight the app theme", () => {
    const html = `<div class="mw-parser-output">`
      + `<table class="infobox"><tr><td>infobox</td></tr></table>`
      + `<div class="hatnote">hatnote</div>`
      + `<p class="mw-empty-elt"></p>`
      + `<sup class="reference">[1]</sup>`
      + `<p style="color:#ff0000">body</p>`
      + `</div>`;

    const result = cleanWikipediaHtml(html);

    expect(result).not.toContain("infobox");
    expect(result).not.toContain("hatnote");
    expect(result).not.toContain("mw-empty-elt");
    expect(result).not.toContain("[1]");
    expect(result).not.toContain("style=");
    expect(result).toContain("body");
  });
});
