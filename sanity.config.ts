import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./sanity/schemas";

export default defineConfig({
  name: "default",
  title: "Oracle CMS",
  projectId: "lwh8r9f1",
  dataset: "production",
  plugins: [structureTool()],
  schema: {
    types: schemaTypes,
  },
});
