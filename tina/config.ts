import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  // Uncomment to allow cross-origin requests from non-localhost origins
  // during local development (e.g. GitHub Codespaces, Gitpod, Docker).
  // Use 'private' to allow all private-network IPs (WSL2, Docker, etc.)
  // server: {
  //   allowedOrigins: ['https://your-codespace.github.dev'],
  // },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "doc",
        label: "Documentation",
        path: "src/content/docs",
        format: "md",
        match: {
          exclude: "index",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content",
            isBody: true,
          },
        ],
        ui: {
          router: ({ document }) => `/${document._sys.breadcrumbs.join("/")}`,
        },
      },
      {
        name: "docsHome",
        label: "Documentation Home",
        path: "src/content/docs",
        format: "mdx",
        match: {
          include: "index",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/",
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "string",
            name: "template",
            label: "Page template",
            options: ["doc", "splash"],
          },
          {
            type: "object",
            name: "hero",
            label: "Hero",
            fields: [
              {
                type: "string",
                name: "tagline",
                label: "Tagline",
                ui: {
                  component: "textarea",
                },
              },
              {
                type: "object",
                name: "image",
                label: "Image",
                fields: [
                  {
                    type: "string",
                    name: "file",
                    label: "File path",
                  },
                ],
              },
              {
                type: "object",
                name: "actions",
                label: "Actions",
                list: true,
                fields: [
                  {
                    type: "string",
                    name: "text",
                    label: "Text",
                  },
                  {
                    type: "string",
                    name: "link",
                    label: "Link",
                  },
                  {
                    type: "string",
                    name: "icon",
                    label: "Icon",
                  },
                  {
                    type: "string",
                    name: "variant",
                    label: "Style",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "cards",
            label: "Next steps cards",
            list: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Title",
                required: true,
              },
              {
                type: "string",
                name: "icon",
                label: "Starlight icon",
                required: true,
              },
              {
                type: "string",
                name: "body",
                label: "Text",
                required: true,
                ui: {
                  component: "textarea",
                },
              },
            ],
          },
        ],
      },
    ],
  },
});
