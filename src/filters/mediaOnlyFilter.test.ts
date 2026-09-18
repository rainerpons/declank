import { hasEmbeddedMedia, hasMediaLinks, stripMediaUrls, isMediaOnlyComment } from "@/filters/mediaOnlyFilter";

function createBody(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div;
}

describe("mediaOnlyFilter", () => {
  describe("hasEmbeddedMedia", () => {
    it("returns true for img tag", () => {
      expect(hasEmbeddedMedia(createBody('<img src="test.jpg">'))).toBe(true);
    });

    it("returns true for video tag", () => {
      expect(hasEmbeddedMedia(createBody('<video src="test.mp4"></video>'))).toBe(true);
    });

    it("returns true for iframe", () => {
      expect(hasEmbeddedMedia(createBody('<iframe></iframe>'))).toBe(true);
    });

    it("returns false for just text", () => {
      expect(hasEmbeddedMedia(createBody('<p>Hello</p>'))).toBe(false);
    });

    it("returns false for flair emoji", () => {
      expect(hasEmbeddedMedia(createBody('<img class="flairemoji">'))).toBe(false);
    });

    it("returns false for small icon", () => {
      expect(hasEmbeddedMedia(createBody('<img width="16">'))).toBe(false);
    });
  });

  describe("hasMediaLinks", () => {
    it("detects media links", () => {
      expect(hasMediaLinks(createBody('<a href="https://giphy.com/gifs/test">link</a>'))).toBe(true);
      expect(hasMediaLinks(createBody('<a href="https://i.redd.it/test.jpg">link</a>'))).toBe(true);
      expect(hasMediaLinks(createBody('<a href="https://tenor.com/view/test">link</a>'))).toBe(true);
      expect(hasMediaLinks(createBody('<a href="https://imgur.com/a/test">link</a>'))).toBe(true);
      expect(hasMediaLinks(createBody('<a href="https://v.redd.it/test">link</a>'))).toBe(true);
      expect(hasMediaLinks(createBody('<a href="https://preview.redd.it/test.png">link</a>'))).toBe(true);
    });

    it("ignores regular links", () => {
      expect(hasMediaLinks(createBody('<a href="https://example.com">link</a>'))).toBe(false);
    });

    it("returns false for no links", () => {
      expect(hasMediaLinks(createBody('just text'))).toBe(false);
    });
  });

  describe("stripMediaUrls", () => {
    it("strips only media URLs", () => {
      expect(stripMediaUrls("https://giphy.com/gifs/test")).toBe("");
      expect(stripMediaUrls("Hello https://giphy.com/gifs/test")).toBe("Hello");
      expect(stripMediaUrls("No urls here")).toBe("No urls here");
    });
    
    it("strips multiple URLs", () => {
      expect(stripMediaUrls("Check this https://imgur.com/test and this https://tenor.com/view/test")).toBe("Check this and this");
    });
  });

  describe("isMediaOnlyComment", () => {
    it("detects GIF-only comments", () => {
      const element = createBody('<img src="test.gif">');
      expect(isMediaOnlyComment(element, "")).toBe(true);
    });

    it("returns false for GIF + meaningful text", () => {
      const element = createBody('<img src="test.gif">');
      expect(isMediaOnlyComment(element, "Here is a gif")).toBe(false);
    });

    it("returns true for media link only", () => {
      const element = createBody('<a href="https://imgur.com/test">link</a>');
      expect(isMediaOnlyComment(element, "https://imgur.com/test")).toBe(true);
    });

    it("returns false for plain text", () => {
      const element = createBody('<p>text</p>');
      expect(isMediaOnlyComment(element, "text")).toBe(false);
    });

    it("returns false for empty body", () => {
      const element = createBody('');
      expect(isMediaOnlyComment(element, "")).toBe(false);
    });

    it("returns false for null body", () => {
      expect(isMediaOnlyComment(null as any, "")).toBe(false);
    });

    it("returns true for video only", () => {
      const element = createBody('<video src="test.mp4"></video>');
      expect(isMediaOnlyComment(element, "")).toBe(true);
    });

    it("returns false for image + text", () => {
      const element = createBody('<img src="test.jpg">');
      expect(isMediaOnlyComment(element, "Here is an example:")).toBe(false);
    });
  });
});
