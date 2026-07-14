import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  validateChunkSize,
  validateDisplayRate,
  validateFontSize,
} from "./display-utils";

describe("Feature: velo-read-speed-reader, Property 6: Chunk Size Validation", () => {
  /**
   * **Validates: Requirements 3.5, 3.6**
   *
   * For any value, `validateChunkSize` SHALL return the value unchanged
   * if it is an integer in the range [1, 5], and SHALL return null for
   * all other values.
   */

  it("returns valid integers in [1, 5] unchanged", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 5 }), (value) => {
        expect(validateChunkSize(value)).toBe(value);
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for integers outside [1, 5]", () => {
    const outOfRange = fc.oneof(
      fc.integer({ max: 0 }),
      fc.integer({ min: 6 })
    );
    fc.assert(
      fc.property(outOfRange, (value) => {
        expect(validateChunkSize(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for non-integer numbers (floats)", () => {
    fc.assert(
      fc.property(
        fc.double({ noInteger: true, noDefaultInfinity: true, noNaN: true }),
        (value) => {
          expect(validateChunkSize(value)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns null for non-number types (strings, booleans, null, undefined, objects, arrays)", () => {
    const nonNumber = fc.oneof(
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.dictionary(fc.string(), fc.integer()),
      fc.array(fc.integer())
    );
    fc.assert(
      fc.property(nonNumber, (value) => {
        expect(validateChunkSize(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for special numeric values (NaN, Infinity, -Infinity)", () => {
    const specialValues = fc.oneof(
      fc.constant(NaN),
      fc.constant(Infinity),
      fc.constant(-Infinity)
    );
    fc.assert(
      fc.property(specialValues, (value) => {
        expect(validateChunkSize(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 7: Display Rate Validation", () => {
  /**
   * **Validates: Requirements 4.2, 4.4**
   *
   * For any value, `validateDisplayRate` SHALL return the value unchanged
   * if it is an integer in the range [1, 1500], and SHALL return null for
   * all other values.
   */

  it("returns valid integers in [1, 1500] unchanged", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1500 }), (value) => {
        expect(validateDisplayRate(value)).toBe(value);
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for integers outside [1, 1500]", () => {
    const outOfRange = fc.oneof(
      fc.integer({ max: 0 }),
      fc.integer({ min: 1501 })
    );
    fc.assert(
      fc.property(outOfRange, (value) => {
        expect(validateDisplayRate(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for non-integer numbers (floats)", () => {
    fc.assert(
      fc.property(
        fc.double({ noInteger: true, noDefaultInfinity: true, noNaN: true }),
        (value) => {
          expect(validateDisplayRate(value)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns null for non-number types (strings, booleans, null, undefined, objects, arrays)", () => {
    const nonNumber = fc.oneof(
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.dictionary(fc.string(), fc.integer()),
      fc.array(fc.integer())
    );
    fc.assert(
      fc.property(nonNumber, (value) => {
        expect(validateDisplayRate(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for special numeric values (NaN, Infinity, -Infinity)", () => {
    const specialValues = fc.oneof(
      fc.constant(NaN),
      fc.constant(Infinity),
      fc.constant(-Infinity)
    );
    fc.assert(
      fc.property(specialValues, (value) => {
        expect(validateDisplayRate(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});

describe("Feature: velo-read-speed-reader, Property 8: Font Size Validation", () => {
  /**
   * **Validates: Requirements 5.1, 5.4**
   *
   * For any value, `validateFontSize` SHALL return the value unchanged
   * if it is an integer in the range [8, 72], and SHALL return null for
   * all other values.
   */

  it("returns valid integers in [8, 72] unchanged", () => {
    fc.assert(
      fc.property(fc.integer({ min: 8, max: 72 }), (value) => {
        expect(validateFontSize(value)).toBe(value);
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for integers outside [8, 72]", () => {
    const outOfRange = fc.oneof(
      fc.integer({ max: 7 }),
      fc.integer({ min: 73 })
    );
    fc.assert(
      fc.property(outOfRange, (value) => {
        expect(validateFontSize(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for non-integer numbers (floats)", () => {
    fc.assert(
      fc.property(
        fc.double({ noInteger: true, noDefaultInfinity: true, noNaN: true }),
        (value) => {
          expect(validateFontSize(value)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns null for non-number types (strings, booleans, null, undefined, objects, arrays)", () => {
    const nonNumber = fc.oneof(
      fc.string(),
      fc.boolean(),
      fc.constant(null),
      fc.constant(undefined),
      fc.dictionary(fc.string(), fc.integer()),
      fc.array(fc.integer())
    );
    fc.assert(
      fc.property(nonNumber, (value) => {
        expect(validateFontSize(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it("returns null for special numeric values (NaN, Infinity, -Infinity)", () => {
    const specialValues = fc.oneof(
      fc.constant(NaN),
      fc.constant(Infinity),
      fc.constant(-Infinity)
    );
    fc.assert(
      fc.property(specialValues, (value) => {
        expect(validateFontSize(value)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
