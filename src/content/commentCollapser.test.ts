import { collapseComment, hasCollapsedAncestor } from "@/content/commentCollapser";

describe("commentCollapser", () => {
  describe("collapseComment", () => {
    it("toggles the collapsed and noncollapsed classes", () => {
      const comment = document.createElement("div");
      comment.className = "comment noncollapsed";

      const result = collapseComment(comment, "testuser", "testfilter");
      expect(result).toBe(true);
      expect(comment.classList.contains("collapsed")).toBe(true);
      expect(comment.classList.contains("noncollapsed")).toBe(false);
    });

    it("returns false for already collapsed comment", () => {
      const comment = document.createElement("div");
      comment.className = "comment collapsed";
      
      const result = collapseComment(comment, "testuser", "testfilter");
      expect(result).toBe(false);
    });
  });

  describe("hasCollapsedAncestor", () => {
    it("returns false if no collapsed ancestor", () => {
      const el = document.createElement("div");
      document.body.appendChild(el);
      expect(hasCollapsedAncestor(el)).toBe(false);
      el.remove();
    });

    it("returns true if direct parent is collapsed .comment", () => {
      const parent = document.createElement("div");
      parent.className = "comment collapsed";
      const child = document.createElement("div");
      parent.appendChild(child);
      expect(hasCollapsedAncestor(child)).toBe(true);
    });

    it("returns true if grandparent is collapsed .comment", () => {
      const gp = document.createElement("div");
      gp.className = "comment collapsed";
      const p = document.createElement("div");
      gp.appendChild(p);
      const child = document.createElement("div");
      p.appendChild(child);
      expect(hasCollapsedAncestor(child)).toBe(true);
    });

    it("returns false if sibling is collapsed but not ancestor", () => {
      const parent = document.createElement("div");
      const sib = document.createElement("div");
      sib.className = "comment collapsed";
      const child = document.createElement("div");
      parent.appendChild(sib);
      parent.appendChild(child);
      expect(hasCollapsedAncestor(child)).toBe(false);
    });

    it("returns false if element itself is collapsed", () => {
      const el = document.createElement("div");
      el.className = "comment collapsed";
      expect(hasCollapsedAncestor(el)).toBe(false);
    });
  });
});
