import { parseUsername, parseCommentBody, normalizeText, parseComment } from "@/content/commentParser";

function createCommentElement(username: string, bodyHtml: string): HTMLElement {
  const comment = document.createElement("div");
  comment.className = "comment";
  comment.innerHTML = `
    <div class="entry">
      <p class="tagline">
        <a class="author" href="/user/${username}">${username}</a>
      </p>
      <div class="usertext-body">
        <div class="md">${bodyHtml}</div>
      </div>
    </div>
  `;
  return comment;
}

function createNestedComments(): HTMLElement {
  const parent = createCommentElement("ParentUser", "<p>Parent text</p>");
  const child = createCommentElement("ChildUser", "<p>Child text</p>");
  const childContainer = document.createElement("div");
  childContainer.className = "child";
  childContainer.appendChild(child);
  parent.appendChild(childContainer);
  return parent;
}

describe("commentParser", () => {
  it("extracts username from author link", () => {
    const el = createCommentElement("TestUser", "<p>body</p>");
    expect(parseUsername(el)).toBe("TestUser");
  });

  it("extracts comment body text", () => {
    const el = createCommentElement("TestUser", "<p>hello</p>");
    const body = parseCommentBody(el);
    expect(body?.rawText?.trim()).toBe("hello");
  });

  it("returns null for missing entry element", () => {
    const el = document.createElement("div");
    expect(parseComment(el)).toBeNull();
  });

  it("returns null for missing author", () => {
    const el = createCommentElement("TestUser", "<p>body</p>");
    const author = el.querySelector(".author");
    author?.remove();
    expect(parseComment(el)).toBeNull();
  });

  it("scoped selector doesn't read nested reply username", () => {
    const parent = createNestedComments();
    const ctx = parseComment(parent);
    expect(ctx?.username).toBe("ParentUser");
    expect(ctx?.rawText.trim()).toBe("Parent text");
  });

  it("normalizeText collapses whitespace", () => {
    expect(normalizeText("hello \n \t world")).toBe("hello world");
  });
});
