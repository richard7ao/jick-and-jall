import { describe, expect, it } from "vitest";

import { getJallCopy } from "../../../lib/copy/jall";
import { getBrandEditorsCopy } from "../../../lib/copy/brand-editors";

const keys = (v: object): string[] => Object.keys(v).sort();

describe("brand copy parity", () => {
  it("keeps Jall intake question ids equal across locales", () => {
    expect(getJallCopy("es").questions.map((q) => q.id)).toEqual(
      getJallCopy("en").questions.map((q) => q.id),
    );
  });

  it("keeps brand editor copy keys equal across locales", () => {
    expect(keys(getBrandEditorsCopy("es"))).toEqual(keys(getBrandEditorsCopy("en")));
  });
});
