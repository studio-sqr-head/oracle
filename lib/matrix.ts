type NodeMap = Record<string, number>;

/** Sum digits until <= 22 (mod-22 numerological reduction) */
function sumDigits(n: number): number {
  return Math.abs(n)
    .toString()
    .split("")
    .reduce((a, b) => a + Number(b), 0);
}

function reduce22(n: number): number {
  if (n === 0) return 22;
  if (n <= 22) return n;

  // sum digits once
  const first = sumDigits(n);
  if (first <= 22) return first;

  // sum a second time only if still >22
  const second = sumDigits(first);
  return second === 0 ? 22 : second;
}

/** -------------------------------------------------------------------
 * calculateMatrix()
 * Builds the full Destiny Matrix using UTC-safe date parsing
 * and reduction rules that match the third-party output exactly.
 * ------------------------------------------------------------------- */
export function calculateMatrix(dob: Date): NodeMap {
  const nodes: NodeMap = {};

const day = dob.getUTCDate();              // 19
const month = dob.getUTCMonth() + 1;       // 5
const year = dob.getUTCFullYear();         // 1993

const D = day;
const M = month;

// preserve master number 22
const Ysum = sumDigits(year); // 1+9+9+3 = 22
const Y = Ysum === 22 ? 22 : reduce22(Ysum);      // 1993 → 22

  console.log({ day: D, month: M, year, D, M, Y }); // should log 19, 5, 22

  // ── Base nodes ─────────────────────────────────────────────────────────
  nodes["X(-4)"] = D;     // Outer Self
  nodes["Y(4)"]  = M;     // Higher Self
  nodes["X(5)"]  = Y;     // Year / Material Karma

  // ── Core & karmic tail ────────────────────────────────────────────────
  nodes["Y(-3)"] = reduce22(nodes["X(-4)"] + nodes["Y(4)"] + nodes["X(5)"]);
  nodes["XY(0)"] = reduce22(
    nodes["X(-4)"] + nodes["Y(4)"] + nodes["X(5)"] + nodes["Y(-3)"]
  );

  // ── Sacral / material branches ────────────────────────────────────────
  nodes["X(3)"]  = reduce22(nodes["XY(0)"] + nodes["X(5)"]);
  nodes["Y(-1)"] = reduce22(nodes["XY(0)"] + nodes["Y(-3)"]);
  nodes["Y(-2)"] = reduce22(nodes["Y(-3)"] + nodes["Y(-1)"]);
  nodes["X(4)"]  = reduce22(nodes["X(5)"] + nodes["X(3)"]);
  nodes["A(-1)"] = reduce22(nodes["X(3)"] + nodes["Y(-1)"]);
  nodes["Z(-1)"] = reduce22(nodes["A(-1)"] + nodes["Y(-1)"]);
  nodes["Z(1)"]  = reduce22(nodes["A(-1)"] + nodes["X(3)"]);

  // ── Throat / heart / eye lines ─────────────────────────────────────────
  nodes["X(-2)"] = reduce22(nodes["XY(0)"] + nodes["X(-4)"]);
  nodes["Y(2)"]  = reduce22(nodes["XY(0)"] + nodes["Y(4)"]);
  nodes["X(-1)"] = reduce22(nodes["XY(0)"] + nodes["X(-2)"]);
  nodes["Y(1)"]  = reduce22(nodes["XY(0)"] + nodes["Y(2)"]);
  nodes["X(-3)"] = reduce22(nodes["X(-4)"] + nodes["X(-2)"]);
  nodes["Y(3)"]  = reduce22(nodes["Y(4)"] + nodes["Y(2)"]);

  // ── Paternal (A-line) ────────────────────────────────────────────────
  nodes["A(3)"]  = reduce22(nodes["X(-4)"] + nodes["Y(4)"]);
  nodes["A(-4)"] = reduce22(nodes["X(5)"] + nodes["Y(-3)"]);
  nodes["A(1)"]  = reduce22(nodes["XY(0)"] + nodes["A(3)"]);
  nodes["A(2)"]  = reduce22(nodes["A(3)"] + nodes["A(1)"]);
  nodes["A(-2)"] = reduce22(nodes["XY(0)"] + nodes["A(-4)"]);
  nodes["A(-3)"] = reduce22(nodes["A(-4)"] + nodes["A(-2)"]);

  // ── Maternal (B-line) ────────────────────────────────────────────────
  nodes["B(3)"]  = reduce22(nodes["Y(4)"] + nodes["X(5)"]);
  nodes["B(-3)"] = reduce22(nodes["Y(-3)"] + nodes["X(-4)"]);
  nodes["B(1)"]  = reduce22(nodes["XY(0)"] + nodes["B(3)"]);
  nodes["B(2)"]  = reduce22(nodes["B(3)"] + nodes["B(1)"]);
  nodes["B(-1)"] = reduce22(nodes["XY(0)"] + nodes["B(-3)"]);
  nodes["B(-2)"] = reduce22(nodes["B(-3)"] + nodes["B(-1)"]);

  // ── Sexuality chain ───────────────────────────────────────────────────
  nodes["X(1)"] = reduce22(
    nodes["A(-3)"] + nodes["A(-4)"] + nodes["B(-3)"] + nodes["B(3)"]
  );
  nodes["X(2)"] = reduce22(nodes["XY(0)"] + nodes["X(1)"]);

  // ── Purpose (N-line) ──────────────────────────────────────────────────
  nodes["N(1)"] = reduce22(nodes["X(-4)"] + nodes["X(5)"]);
  nodes["N(2)"] = reduce22(nodes["Y(4)"] + nodes["Y(-3)"]);
  nodes["N(3)"] = reduce22(nodes["N(1)"] + nodes["N(2)"]);
  nodes["N(4)"] = reduce22(nodes["A(3)"] + nodes["A(-4)"]);
  nodes["N(5)"] = reduce22(nodes["B(3)"] + nodes["B(-3)"]);
  nodes["N(6)"] = reduce22(nodes["N(4)"] + nodes["N(5)"]);
  nodes["N(7)"] = reduce22(nodes["N(3)"] + nodes["N(6)"]);

  // ── Health / Chakra (C-line) ──────────────────────────────────────────
  nodes["C(1)"]  = reduce22(nodes["X(5)"] + nodes["Y(-3)"]);
  nodes["C(2)"]  = reduce22(nodes["X(3)"] + nodes["Y(-1)"]);
  nodes["C(3)"]  = reduce22(nodes["XY(0)"] + nodes["XY(0)"]);
  nodes["C(4)"]  = reduce22(nodes["X(-1)"] + nodes["Y(1)"]);
  nodes["C(5)"]  = reduce22(nodes["X(-2)"] + nodes["Y(2)"]);
  nodes["C(6)"]  = reduce22(nodes["X(-3)"] + nodes["Y(3)"]);
  nodes["C(7)"]  = reduce22(nodes["X(-4)"] + nodes["Y(4)"]);
  nodes["C(8)"]  = reduce22(
    nodes["C(1)"] + nodes["C(2)"] + nodes["C(3)"] + nodes["C(4)"] +
    nodes["C(5)"] + nodes["C(6)"] + nodes["C(7)"]
  );
  nodes["C(9)"]  = reduce22(
    nodes["X(-4)"] + nodes["X(-3)"] + nodes["X(-2)"] + nodes["X(-1)"] +
    nodes["XY(0)"] + nodes["X(3)"] + nodes["X(5)"]
  );
  nodes["C(10)"] = reduce22(
    nodes["Y(4)"] + nodes["Y(3)"] + nodes["Y(2)"] + nodes["Y(1)"] +
    nodes["XY(0)"] + nodes["Y(-1)"] + nodes["Y(-3)"]
  );

  return nodes;
}
