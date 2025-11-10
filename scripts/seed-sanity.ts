import "dotenv/config";
import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

const ZODIAC_TITLES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const ARCANA = Array.from({ length: 22 }, (_, i) => i + 1);
const ARCANA_TITLES: Record<number, string> = {
  1: "The Magician",
  2: "The High Priestess",
  3: "The Empress",
  4: "The Emperor",
  5: "The Hierophant",
  6: "The Lovers",
  7: "The Chariot",
  8: "Strength",
  9: "The Hermit",
  10: "Wheel of Fortune",
  11: "Justice",
  12: "The Hanged Man",
  13: "Death",
  14: "Temperance",
  15: "The Devil",
  16: "The Tower",
  17: "The Star",
  18: "The Moon",
  19: "The Sun",
  20: "Judgement",
  21: "The World",
  22: "The Fool",
};

async function seed() {
  console.log("🌙 Seeding Oracle CMS...\n");

  try {
    // 1. Create Systems
    console.log("📚 Creating systems...");
    const systems = [
      {
        _type: "system",
        key: "astro",
        name: "Astrology",
        active: true,
        description: "Natal astrology readings based on Sun, Moon, and Rising signs",
      },
      {
        _type: "system",
        key: "matrix",
        name: "Destiny Matrix",
        active: true,
        description:
          "Destiny Matrix readings based on numerical calculations from birth date",
      },
    ];

    const createdSystems: any[] = [];
    for (const system of systems) {
      const existing = await sanityClient.fetch(
        `*[_type == "system" && key == $key][0]`,
        { key: system.key }
      );
      if (!existing) {
        const doc = await sanityClient.create(system);
        createdSystems.push(doc);
        console.log(`  ✓ Created system: ${doc.key}`);
      } else {
        createdSystems.push(existing);
        console.log(`  ✓ System already exists: ${existing.key}`);
      }
    }

    // 2. Create Value Sets
    console.log("\n🎴 Creating value sets...");
    const valueSets = [
      {
        _type: "valueSet",
        key: "zodiac_signs",
        values: ZODIAC_SIGNS.map((sign, i) => ({
          key: sign,
          title: ZODIAC_TITLES[i],
          metadata: {
            order: i + 1,
            glyph: String.fromCharCode(9800 + i),
          },
        })),
      },
      {
        _type: "valueSet",
        key: "arcana_1_22",
        values: ARCANA.map((num) => ({
          key: String(num),
          title: ARCANA_TITLES[num],
          metadata: {
            order: num,
          },
        })),
      },
    ];

    const createdValueSets: any[] = [];
    for (const vs of valueSets) {
      const existing = await sanityClient.fetch(
        `*[_type == "valueSet" && key == $key][0]`,
        { key: vs.key }
      );
      if (!existing) {
        const doc = await sanityClient.create(vs);
        createdValueSets.push(doc);
        console.log(`  ✓ Created value set: ${doc.key}`);
      } else {
        createdValueSets.push(existing);
        console.log(`  ✓ Value set already exists: ${existing.key}`);
      }
    }

    // 3. Create Dimensions for Astrology
    console.log("\n⭐ Creating Astrology dimensions...");
    const zodiacVS = createdValueSets.find((vs) => vs.key === "zodiac_signs");
    const astroDimensions = [
      {
        _type: "dimension",
        system: { _type: "reference", _ref: createdSystems[0]._id },
        key: "sun_sign",
        name: "Sun Sign",
        code: "sun_sign",
        valueSet: { _type: "reference", _ref: zodiacVS._id },
        category: "core",
        interpretations: ZODIAC_SIGNS.map((sign, i) => ({
          valueKey: sign,
          content: [
            {
              _type: "block",
              style: "normal",
              _key: `sun_${i}`,
              markDefs: [],
              children: [
                {
                  _type: "span",
                  _key: `sun_${i}_text`,
                  text: `Your Sun in ${ZODIAC_TITLES[i]} radiates core identity and vital energy. [Placeholder interpretation for ${ZODIAC_TITLES[i]}]`,
                  marks: [],
                },
              ],
            },
          ],
        })),
      },
      {
        _type: "dimension",
        system: { _type: "reference", _ref: createdSystems[0]._id },
        key: "moon_sign",
        name: "Moon Sign",
        code: "moon_sign",
        valueSet: { _type: "reference", _ref: zodiacVS._id },
        category: "emotional",
        interpretations: ZODIAC_SIGNS.map((sign, i) => ({
          valueKey: sign,
          content: [
            {
              _type: "block",
              style: "normal",
              _key: `moon_${i}`,
              markDefs: [],
              children: [
                {
                  _type: "span",
                  _key: `moon_${i}_text`,
                  text: `Your Moon in ${ZODIAC_TITLES[i]} governs emotional nature and inner world. [Placeholder interpretation for ${ZODIAC_TITLES[i]}]`,
                  marks: [],
                },
              ],
            },
          ],
        })),
      },
      {
        _type: "dimension",
        system: { _type: "reference", _ref: createdSystems[0]._id },
        key: "rising_sign",
        name: "Rising Sign",
        code: "rising_sign",
        valueSet: { _type: "reference", _ref: zodiacVS._id },
        category: "external",
        interpretations: ZODIAC_SIGNS.map((sign, i) => ({
          valueKey: sign,
          content: [
            {
              _type: "block",
              style: "normal",
              _key: `rising_${i}`,
              markDefs: [],
              children: [
                {
                  _type: "span",
                  _key: `rising_${i}_text`,
                  text: `Your Rising in ${ZODIAC_TITLES[i]} is your outward mask and first impression. [Placeholder interpretation for ${ZODIAC_TITLES[i]}]`,
                  marks: [],
                },
              ],
            },
          ],
        })),
      },
    ];

    for (const dim of astroDimensions) {
      const existing = await sanityClient.fetch(
        `*[_type == "dimension" && key == $key][0]`,
        { key: dim.key }
      );
      if (!existing) {
        await sanityClient.create(dim);
        console.log(`  ✓ Created dimension: ${dim.key}`);
      } else {
        console.log(`  ✓ Dimension already exists: ${dim.key}`);
      }
    }

    // 4. Create Dimensions for Destiny Matrix
    console.log("\n🔢 Creating Destiny Matrix dimensions...");
    const arcanaVS = createdValueSets.find((vs) => vs.key === "arcana_1_22");
    const matrixDimensions = [
      {
        key: "xy0_core",
        name: "Core Energy",
        code: "XY(0)",
        category: "core",
      },
      {
        key: "x_neg4_outer_self",
        name: "Outer Self",
        code: "X(-4)",
        category: "self",
      },
      {
        key: "y_neg1_entrance_to_relationship",
        name: "Entrance to Relationship",
        code: "Y(-1)",
        category: "relationships",
      },
      {
        key: "z_neg1_ideal_partner",
        name: "Ideal Partner",
        code: "Z(-1)",
        category: "relationships",
      },
      {
        key: "z1_financial_flow",
        name: "Financial Flow",
        code: "Z(1)",
        category: "material",
      },
      {
        key: "x5_material_karma",
        name: "Material Karma",
        code: "X(5)",
        category: "material",
      },
      {
        key: "n3_purpose",
        name: "Purpose",
        code: "N(3)",
        category: "purpose",
      },
      {
        key: "c1_health_root",
        name: "Health - Root",
        code: "C(1)",
        category: "health",
      },
    ];

    for (const dim of matrixDimensions) {
      const existing = await sanityClient.fetch(
        `*[_type == "dimension" && key == $key][0]`,
        { key: dim.key }
      );
      if (!existing) {
        const dimDoc = {
          _type: "dimension",
          system: { _type: "reference", _ref: createdSystems[1]._id },
          ...dim,
          valueSet: { _type: "reference", _ref: arcanaVS._id },
          interpretations: ARCANA.map((num) => ({
            valueKey: String(num),
            content: [
              {
                _type: "block",
                style: "normal",
                _key: `matrix_${dim.key}_${num}`,
                markDefs: [],
                children: [
                  {
                    _type: "span",
                    _key: `matrix_${dim.key}_${num}_text`,
                    text: `${dim.name} = ${ARCANA_TITLES[num]} (${num}). [Placeholder interpretation]`,
                    marks: [],
                  },
                ],
              },
            ],
          })),
        };
        await sanityClient.create(dimDoc);
        console.log(`  ✓ Created dimension: ${dim.key}`);
      } else {
        console.log(`  ✓ Dimension already exists: ${dim.key}`);
      }
    }

    console.log("\n✨ Seed complete! Your CMS is ready.");
  } catch (error) {
    console.error("❌ Error seeding Sanity:", error);
    process.exit(1);
  }
}

seed();
