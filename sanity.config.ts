import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes, SINGLETONS } from './sanity/schemaTypes';
import { structure } from './sanity/structure';

const projectId =
  import.meta.env?.PUBLIC_SANITY_PROJECT_ID ||
  process.env.PUBLIC_SANITY_PROJECT_ID ||
  process.env.SANITY_STUDIO_PROJECT_ID ||
  '';
const dataset =
  import.meta.env?.PUBLIC_SANITY_DATASET ||
  process.env.PUBLIC_SANITY_DATASET ||
  process.env.SANITY_STUDIO_DATASET ||
  'production';

const singletons = new Set<string>(SINGLETONS);

export default defineConfig({
  name: 'wonderwand',
  title: 'Wonder Wand',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
    // Singletons can't be created/deleted from the "+" menu.
    templates: (prev) => prev.filter((t) => !singletons.has(t.schemaType)),
  },
  document: {
    actions: (prev, { schemaType }) =>
      singletons.has(schemaType)
        ? prev.filter(({ action }) =>
            ['publish', 'discardChanges', 'restore'].includes(action ?? ''),
          )
        : prev,
  },
});
