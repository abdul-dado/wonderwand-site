import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId:
      process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID || 'b9izpb2i',
    dataset: process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || 'production',
  },
});
