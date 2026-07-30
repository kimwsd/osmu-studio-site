const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

test("the all-projects link leads the project controls and cards", () => {
  for (const file of ["home.html", "index.html"]) {
    const html = read(file);
    const heading = html.indexOf('class="work-heading');
    const more = html.indexOf('class="work-more');
    const filters = html.indexOf('class="work-filters');
    const list = html.indexOf('id="workList"');

    assert.ok(heading >= 0, `${file}: work heading is missing`);
    assert.ok(more > heading, `${file}: all-projects link should follow the heading`);
    assert.ok(more < filters, `${file}: all-projects link should precede filters`);
    assert.ok(more < list, `${file}: all-projects link should precede project cards`);
  }
});

test("the promoted all-projects link has intentional desktop and mobile spacing", () => {
  const css = read("osmu.css");

  assert.match(
    css,
    /body\.home-brandcenter #work \.work-more\s*\{\s*margin:\s*0 0 38px;\s*\}/
  );
  assert.match(
    css,
    /@media\(max-width:\s*560px\)[\s\S]*body\.home-brandcenter #work \.work-more\s*\{\s*margin:\s*0 14px 28px;\s*\}/
  );
});
