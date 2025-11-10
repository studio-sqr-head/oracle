import { createClient } from "@sanity/client";

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
});

export interface Interpretation {
  dimensionKey: string;
  valueKey: string;
  content?: any;
  contentRef?: string;
}

export async function fetchInterpretations(params: {
  systemKey: string;
  mapping: Array<{ dimensionKey: string; valueKey: string }>;
}): Promise<Interpretation[]> {
  const { systemKey, mapping } = params;

  const query = `
    *[_type == "dimension" && system->key == $systemKey && key in $dimensionKeys] {
      key,
      interpretations[] {
        valueKey,
        content
      }
    }
  `;

  const dimensionKeys = mapping.map((m) => m.dimensionKey);

  const dimensions = await sanityClient.fetch(query, {
    systemKey,
    dimensionKeys,
  });

  const interpretations: Interpretation[] = [];

  for (const dim of dimensions) {
    const dimKey = dim.key;
    const interp = mapping.find((m) => m.dimensionKey === dimKey);
    if (!interp) continue;

    const content = dim.interpretations?.find(
      (i: any) => i.valueKey === interp.valueKey
    );
    if (content) {
      interpretations.push({
        dimensionKey: dimKey,
        valueKey: interp.valueKey,
        content: content.content,
      });
    }
  }

  return interpretations;
}

export async function getSystem(key: string) {
  return sanityClient.fetch(`*[_type == "system" && key == $key][0]`, { key });
}

export async function getDimensions(systemKey: string) {
  return sanityClient.fetch(
    `*[_type == "dimension" && system->key == $systemKey]`,
    { systemKey }
  );
}

export async function getValueSet(key: string) {
  return sanityClient.fetch(`*[_type == "valueSet" && key == $key][0]`, {
    key,
  });
}
