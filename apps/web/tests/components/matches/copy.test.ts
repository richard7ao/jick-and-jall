import { describe, expect, it } from "vitest";

import { getMatchesCopy } from "../../../lib/copy/matches";
import { getChatCopy } from "../../../lib/copy/chat";

const keys = (v: object): string[] => Object.keys(v).sort();

describe("matches & chat copy parity", () => {
  it("keeps matches copy keys equal across locales", () => {
    expect(keys(getMatchesCopy("es"))).toEqual(keys(getMatchesCopy("en")));
  });

  it("keeps chat copy keys equal across locales", () => {
    expect(keys(getChatCopy("es"))).toEqual(keys(getChatCopy("en")));
  });
});
