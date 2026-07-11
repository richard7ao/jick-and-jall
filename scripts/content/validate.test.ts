import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { validateContent } from "./validate.ts";

const repoRoot = process.cwd();
const dir = mkdtempSync(join(tmpdir(), "jj-content-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const schema = {
  type: "object",
  properties: {
    meta: {
      type: "object",
      properties: { locale: { type: "string" } },
      required: ["locale"],
    },
    hero: {
      type: "object",
      properties: { title: { type: "string" } },
      required: ["title"],
    },
  },
  required: ["meta", "hero"],
};

function writeFixture(locale: string, data: unknown) {
  writeFileSync(join(dir, `${locale}.json`), JSON.stringify(data));
}

describe("validateContent (committed content)", () => {
  it("passes for the real en/es content", () => {
    expect(validateContent(join(repoRoot, "content"))).toEqual([]);
  });
});

describe("validateContent (fault injection)", () => {
  it("flags a missing required key", () => {
    writeFileSync(join(dir, "schema.json"), JSON.stringify(schema));
    writeFixture("en", { meta: { locale: "en" }, hero: { title: "Hi" } });
    writeFixture("es", { meta: { locale: "es" } }); // missing hero
    const problems = validateContent(dir);
    expect(problems.some((p) => p.includes("hero") && p.includes("missing"))).toBe(true);
  });

  it("flags an empty-string leaf", () => {
    writeFileSync(join(dir, "schema.json"), JSON.stringify(schema));
    writeFixture("en", { meta: { locale: "en" }, hero: { title: "Hi" } });
    writeFixture("es", { meta: { locale: "es" }, hero: { title: "  " } });
    expect(validateContent(dir).some((p) => p.includes("non-empty string"))).toBe(true);
  });

  it("flags a parity gap between locales", () => {
    writeFileSync(join(dir, "schema.json"), JSON.stringify(schema));
    writeFixture("en", { meta: { locale: "en" }, hero: { title: "Hi" } });
    writeFixture("es", { meta: { locale: "en" }, hero: { title: "Hola" } });
    expect(validateContent(dir).some((p) => p.includes('meta.locale must equal "es"'))).toBe(true);
  });
});
