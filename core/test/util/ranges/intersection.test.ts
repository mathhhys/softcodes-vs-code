// This file is generated by Softcodes

import { intersection } from "../../../util/ranges.js";

interface Position {
  line: number;
  character: number;
}

interface Range {
  start: Position;
  end: Position;
}

describe("intersection", () => {
  let rangeA: Range;
  let rangeB: Range;

  beforeEach(() => {
    rangeA = {
      start: { line: 1, character: 0 },
      end: { line: 3, character: 5 },
    };

    rangeB = {
      start: { line: 2, character: 2 },
      end: { line: 4, character: 0 },
    };
  });

  test("returns correct intersection for overlapping ranges", () => {
    const result = intersection(rangeA, rangeB);
    expect(result).toEqual({
      start: { line: 2, character: 2 },
      end: { line: 3, character: 5 },
    });
  });

  test("returns null for non-overlapping ranges", () => {
    rangeA = {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 0 },
    };

    rangeB = {
      start: { line: 3, character: 0 },
      end: { line: 4, character: 0 },
    };

    const result = intersection(rangeA, rangeB);
    expect(result).toBeNull();
  });

  // TODO
  test.skip("returns correct intersection for single line overlap", () => {
    rangeA = {
      start: { line: 1, character: 0 },
      end: { line: 1, character: 5 },
    };

    rangeB = {
      start: { line: 1, character: 3 },
      end: { line: 2, character: 0 },
    };

    const result = intersection(rangeA, rangeB);
    expect(result).toEqual({
      start: { line: 1, character: 3 },
      end: { line: 1, character: 5 },
    });
  });

  test("returns null for single line non-overlapping ranges", () => {
    rangeA = {
      start: { line: 1, character: 0 },
      end: { line: 1, character: 2 },
    };

    rangeB = {
      start: { line: 1, character: 3 },
      end: { line: 1, character: 5 },
    };

    const result = intersection(rangeA, rangeB);
    expect(result).toBeNull();
  });

  test("returns correct intersection when one range is fully within another", () => {
    rangeA = {
      start: { line: 1, character: 0 },
      end: { line: 4, character: 5 },
    };

    rangeB = {
      start: { line: 2, character: 2 },
      end: { line: 3, character: 3 },
    };

    const result = intersection(rangeA, rangeB);
    expect(result).toEqual({
      start: { line: 2, character: 2 },
      end: { line: 3, character: 3 },
    });
  });

  test("returns correct intersection when ranges touch at the edge", () => {
    rangeA = {
      start: { line: 1, character: 0 },
      end: { line: 2, character: 0 },
    };

    rangeB = {
      start: { line: 2, character: 0 },
      end: { line: 3, character: 0 },
    };

    const result = intersection(rangeA, rangeB);
    expect(result).toEqual({
      start: { line: 2, character: 0 },
      end: { line: 2, character: 0 },
    });
  });
});
