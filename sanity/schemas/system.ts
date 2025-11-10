import { defineType, defineField } from "sanity";

export default defineType({
  name: "system",
  type: "document",
  title: "System",
  fields: [
    defineField({
      name: "key",
      type: "string",
      title: "Key",
      description: "e.g., astro, matrix",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "name",
      type: "string",
      title: "Name",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "active",
      type: "boolean",
      title: "Active",
      initialValue: true,
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Description",
    }),
  ],
});
