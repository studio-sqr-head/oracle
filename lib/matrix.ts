/** Reduce any integer into 1..22; 0 ⇒ 22; handles negatives safely. */
export function arcana(n: number): number {
  let m = n % 22;
  if (m === 0) m = 22;
  return m < 0 ? ((m + 22) % 22) || 22 : m;
}

/** Sum digits of a number */
const sumDigits = (n: number) =>
  n
    .toString()
    .split("")
    .reduce((a, b) => a + +b, 0);

/** Extract base primitives from ISO date YYYY-MM-DD */
function baseFromDob(iso: string) {
  const [Yfull, Mfull, Dfull] = iso.split("-").map(Number);
  const D = sumDigits(Dfull); // day sum
  const M = Mfull; // month (1..12)
  const Y = sumDigits(Yfull); // year sum
  const Y4 = Y * 4; // material karma seed
  return { D, M, Y, Y4 };
}

export type MatrixNodes = Record<string, number>;

/** Calculate all Destiny Matrix nodes from ISO birth date */
export function calculateMatrix(isoDate: string): MatrixNodes {
  const { D, M, Y, Y4 } = baseFromDob(isoDate);
  const nodes: MatrixNodes = {};
  const a = (n: number) => arcana(n);

  // Bases
  nodes["X(-4)"] = a(D + D); // Outer Self
  nodes["Y(4)"] = a(M); // Higher Self
  nodes["X(5)"] = a(Y4); // Material Karma seed

  // Provisional tail for center calculation (finalize after XY(0))
  let Ym1 = a(nodes["Y(4)"] + nodes["X(-4)"]);
  let Ym3 = a(Ym1 + nodes["Y(4)"]);

  // Center
  nodes["XY(0)"] = a(
    nodes["X(-4)"] + nodes["Y(4)"] + nodes["X(5)"] + Ym3
  );

  // Finalize tail with XY(0)
  Ym1 = a(nodes["XY(0)"] + nodes["Y(4)"]);
  Ym3 = a(Ym1 + nodes["Y(4)"]);
  nodes["Y(-1)"] = Ym1; // Entrance to Relationship (program input)
  nodes["Y(-3)"] = Ym3;

  // Recompute center with finalized tail
  nodes["XY(0)"] = a(
    nodes["X(-4)"] + nodes["Y(4)"] + nodes["X(5)"] + nodes["Y(-3)"]
  );

  // Paternal diagonal A (NW/SE)
  nodes["A(3)"] = a(nodes["X(-4)"] + nodes["Y(4)"]);
  nodes["A(-4)"] = a(nodes["X(5)"] + nodes["Y(-3)"]);
  nodes["A(1)"] = a(nodes["XY(0)"] + nodes["A(3)"]);
  nodes["A(2)"] = a(nodes["A(3)"] + nodes["A(1)"]);
  nodes["A(-2)"] = a(nodes["XY(0)"] + nodes["A(-4)"]);
  nodes["A(-3)"] = a(nodes["A(-4)"] + nodes["A(-2)"]);

  // Maternal diagonal B (NE/SW)
  nodes["B(3)"] = a(nodes["Y(4)"] + nodes["X(5)"]);
  nodes["B(-3)"] = a(nodes["Y(-3)"] + nodes["X(-4)"]);
  nodes["B(1)"] = a(nodes["XY(0)"] + nodes["B(3)"]);
  nodes["B(2)"] = a(nodes["B(3)"] + nodes["B(1)"]);
  nodes["B(-1)"] = a(nodes["XY(0)"] + nodes["B(-3)"]);
  nodes["B(-2)"] = a(nodes["B(-3)"] + nodes["B(-1)"]);

  // X-chain neighbors for programs (Material Karma & Sexuality)
  nodes["X(3)"] = a(nodes["XY(0)"] + nodes["X(5)"]);
  nodes["X(1)"] = a(nodes["A(-3)"] + nodes["A(3)"]); // consistent scaffold
  nodes["X(2)"] = a(nodes["XY(0)"] + nodes["X(1)"]);

  // Channels / bridges (program inputs)
  nodes["A(-1)"] = a(nodes["X(3)"] + nodes["Y(-1)"]); // Crossroad (love-money)

  // Z line placeholders (consistent sacral line neighbors; safe to compute now)
  nodes["Z(1)"] = a(nodes["Y(4)"] + nodes["X(3)"]);
  nodes["Z(-1)"] = a(nodes["Y(-3)"] + nodes["X(-4)"]);

  // Health table C(1..7) + aggregates (C8, C10)
  nodes["C(1)"] = a(nodes["X(5)"] + nodes["Y(-3)"]);
  nodes["C(2)"] = a(nodes["X(3)"] + nodes["Y(-1)"]);
  nodes["C(3)"] = a(nodes["XY(0)"] + nodes["XY(0)"]);
  nodes["C(4)"] = a(
    (nodes["X(-1)"] || nodes["X(-4)"]) + (nodes["Y(1)"] || nodes["Y(4)"])
  );
  nodes["C(5)"] = a(
    (nodes["X(-2)"] || nodes["X(-4)"]) + (nodes["Y(2)"] || nodes["Y(4)"])
  );
  nodes["C(6)"] = a(
    (nodes["X(-3)"] || nodes["X(-4)"]) + (nodes["Y(3)"] || nodes["Y(4)"])
  );
  nodes["C(7)"] = a(nodes["X(-4)"] + nodes["Y(4)"]);
  nodes["C(8)"] = a(
    nodes["C(1)"] +
      nodes["C(2)"] +
      nodes["C(3)"] +
      nodes["C(4)"] +
      nodes["C(5)"]
  );
  nodes["C(10)"] = a(
    (nodes["Y(4)"] || 0) +
      (nodes["Y(3)"] || 0) +
      (nodes["Y(2)"] || 0) +
      (nodes["Y(1)"] || 0) +
      nodes["XY(0)"] +
      nodes["Y(-1)"] +
      nodes["Y(-3)"]
  );

  // Purpose table N(1..3)
  nodes["N(1)"] = a(nodes["X(-4)"] + nodes["X(5)"]);
  nodes["N(2)"] = a(nodes["Y(4)"] + nodes["Y(-3)"]);
  nodes["N(3)"] = a(nodes["N(1)"] + nodes["N(2)"]);

  return nodes;
}
