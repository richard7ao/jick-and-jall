import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

type Manifest = {
  name?: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
};

function readManifest(dir: string): Manifest {
  return JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as Manifest;
}

function workspacePackageDirs(): string[] {
  const dirs: string[] = [];
  for (const group of ["packages", "apps"]) {
    const base = join(repoRoot, group);
    if (!existsSync(base)) continue;
    for (const name of readdirSync(base)) {
      const dir = join(base, name);
      if (existsSync(join(dir, "package.json"))) dirs.push(dir);
    }
  }
  return dirs;
}

describe("workspace manifests", () => {
  const dirs = workspacePackageDirs();

  it("discovers at least the shared package and the web app", () => {
    const names = dirs.map((dir) => readManifest(dir).name);
    expect(names).toContain("@jj/shared");
    expect(names).toContain("@jj/web");
  });

  it("every workspace package is a private, scoped ESM package with a build script", () => {
    for (const dir of dirs) {
      const manifest = readManifest(dir);
      expect(manifest.name, `${dir} name`).toMatch(/^@jj\//);
      expect(manifest.private, `${dir} private`).toBe(true);
      expect(manifest.type, `${dir} type`).toBe("module");
      expect(manifest.scripts?.build, `${dir} build script`).toBeTruthy();
    }
  });

  it("package names are unique across the workspace", () => {
    const names = dirs.map((dir) => readManifest(dir).name);
    expect(new Set(names).size).toBe(names.length);
  });
});
