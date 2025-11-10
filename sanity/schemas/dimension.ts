import { defineType, defineField } from "sanity";

export default defineType({
  name: "dimension",
  type: "document",
  title: "Dimension",
  fields: [
    defineField({
      name: "system",
      type: "reference",
      title: "System",
      to: [{ type: "system" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "key",
      type: "string",
      title: "Key",
      description: "e.g., sun_sign, x_neg4_outer_self",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "code",
      type: "string",
      title: "Code",
      description: "formula id e.g., X(-4), sun_sign",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "valueSet",
      type: "reference",
      title: "Value Set",
      to: [{ type: "valueSet" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Category",
      description: "e.g., core, relationships",
    }),
    defineField({
      name: "interpretations",
      type: "array",
      title: "Interpretations",
      of: [
        {
          type: "object",
          title: "Interpretation",
          fields: [
            defineField({
              name: "valueKey",
              type: "string",
              title: "Value Key",
              description: "matches a valueSet.values.key",
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "content",
              type: "array",
              title: "Content",
              of: [{ type: "block" }],
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
  ],
});
