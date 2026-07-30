const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("replaces the header inquiry CTA with one menu button", () => {
  for (const file of ["home.html", "index.html"]) {
    const html = read(file);
    const header = html.match(/<header id="header"[\s\S]*?<\/header>/)?.[0] || "";

    assert.doesNotMatch(header, /header-inquiry/);
    assert.doesNotMatch(header, />문의하기</);
    assert.equal((header.match(/id="menuBtn"/g) || []).length, 1);
    assert.match(header, /aria-label="메뉴 열기">Menu<\/button>/);
  }
});

test("keeps the shared subpage menu button without injecting an inquiry CTA", () => {
  const script = read("osmu.js");
  const navSetup = script.match(/const menuButton = header\.querySelector\('#menuBtn'\);[\s\S]*?(?=\s*const overlay =)/)?.[0] || "";

  assert.match(navSetup, /actions\.append\(menuButton\)/);
  assert.doesNotMatch(navSetup, /createElement\('a'\)/);
  assert.doesNotMatch(navSetup, /header-inquiry|문의하기/);
});
