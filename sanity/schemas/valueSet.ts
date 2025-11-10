import { defineType, defineField } from "sanity";

export default defineType({
  name: "valueSet",
  type: "document",
  title: "Value Set",
  fields: [
    defineField({
      name: "key",
      type: "string",
      title: "Key",
      description: "e.g., zodiac_signs, arcana_1_22",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "values",
      type: "array",
      title: "Values",
      of: [
        {
          type: "object",
          title: "Value",
          fields: [
            defineField({
              name: "key",
              type: "string",
              title: "Key",
              description: "e.g., aries, 7",
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "title",
              type: "string",
              title: "Title",
              description: "e.g., Aries, The Chariot",
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "metadata",
              type: "object",
              title: "Metadata",
              fields: [
                defineField({
                  name: "order",
                  type: "number",
                  title: "Order",
                }),
                defineField({
                  name: "glyph",
                  type: "string",
                  title: "Glyph",
                }),
              ],
            }),
          ],
        },
      ],
    }),
  ],
});
