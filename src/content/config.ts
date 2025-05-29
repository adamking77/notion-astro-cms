import { defineCollection, z } from "astro:content";
import { notionLoader } from "notion-astro-loader";
const work = defineCollection({
  schema: z.object({
    work: z.string(),
    live: z.string(),
    title: z.string(),
    description: z.string(),
    intro: z
      .array(
        z.object({
          paragraphs: z.array(z.string()).optional(),
        })
      )
      .optional(),
    outro: z
      .array(
        z.object({
          paragraphs: z.array(z.string()).optional(),
        })
      )
      .optional(),
    highlights: z
      .array(
        z.object({
          title: z.string().optional(),
          paragraphs: z.array(z.string()).optional(),
        })
      )
      .optional(),
    projectData: z
      .array(
        z.object({
          client: z.string(),
          service: z.string(),
          sector: z.string(),
          year: z.string(),
        })
      )
      .optional(),
    credits: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
        })
      )
      .optional(),
   
    images: z.array(
      z.object({
        url: z.string(),
        alt: z.string(),
      })
    ),
    thumbnail: z.object({
      url: z.string(),
      alt: z.string(),
    }),
  }),
});

const store = defineCollection({
  schema: z.object({
    price: z.string(),
    title: z.string(),
    checkout: z.string(),
    license: z.string(),
    highlights: z.array(z.string()),
    specifications: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      )
      .optional(),
    description: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    images: z.array(
      z.object({
        url: z.string(),
        alt: z.string(),
      })
    ),
    faq: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
  }),
});

const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    authorAvatar: z.object({
      url: z.string(),
      alt: z.string()
    }),
    tags: z.array(z.string()),
  }),
});

// Define a schema for the Notion 'database' collection
const notionDBSchema = z.object({
  // The 'properties' object from Notion
  properties: z.object({
    Name: z.object({
      title: z.array(z.object({ plain_text: z.string() })).optional(),
    }).optional(),
    Date: z.object({ // User confirmed date property is named "Date"
      date: z.object({ start: z.string() }).optional(),
    }).optional(),
    Description: z.object({ // Assuming 'Description' for text content
      rich_text: z.array(z.object({ plain_text: z.string() })).optional(),
    }).optional(),
    Author: z.object({ // User confirmed Author is Person type
      people: z.array(z.object({ name: z.string().optional() })).optional(),
    }).optional(),
    Cover: z.object({ // For the 'Cover' property if it's a files/media type in Notion
      files: z.array(
        z.object({
          file: z.object({ url: z.string() }).optional(), // Uploaded to Notion
          external: z.object({ url: z.string() }).optional(), // Linked external URL
          name: z.string().optional(),
          type: z.union([z.literal("file"), z.literal("external")]).optional(),
        })
      ).optional(),
      // If the Cover property itself is just an external URL (less common for 'Files & Media')
      external: z.object({ url: z.string() }).optional(),
      type: z.string().optional(), // Type of the 'Cover' property itself
    }).optional(),
    Tags: z.object({ // Assuming 'Tags' is a multi-select
      multi_select: z.array(z.object({ name: z.string() })).optional(),
    }).optional(),
    "Featured Image URL": z.object({ // Added "Featured Image URL"
      files: z.array(
        z.object({
          file: z.object({ url: z.string() }).optional(),
          external: z.object({ url: z.string() }).optional(),
          name: z.string().optional(),
          type: z.union([z.literal("file"), z.literal("external")]).optional(),
        })
      ).optional(),
      url: z.string().optional(), // For when it's a direct URL type property
      type: z.string().optional(),
    }).optional(),
    // Add any other properties you expect from your Notion database here
    // Making them optional (e.g., .optional()) is safer
  }).optional(), // The entire 'properties' object can be optional

  // Schema for post.data.cover as potentially structured by astro-notion or Notion API for page covers
  // This is separate from a 'Cover' *property* if you use page covers
  cover: z.union([
    z.object({
      type: z.literal("external"),
      external: z.object({ url: z.string() }),
    }),
    z.object({
      type: z.literal("file"),
      file: z.object({ url: z.string(), expiry_time: z.string() }),
    })
  ]).optional().nullable(), // Allow cover to be explicitly null
  
  // astro-notion also adds other top-level fields like id, icon, parent, archived, url, last_edited_time.
  // We only strictly need to define what's causing TS errors or what we want strong typing for.
  // Zod's .passthrough() could be used if we don't want to define everything but still want some validation.
  // For now, focusing on the properties causing issues.
}).passthrough(); // Allows other properties not defined in the schema

const database = defineCollection({
  schema: notionDBSchema, // Apply the schema here
  loader: notionLoader({
    auth: import.meta.env.NOTION_TOKEN, // You need to set this environment variable
    database_id: import.meta.env.NOTION_DATABASE_ID, // You need to set this environment variable
    filter: {
      property: "Hidden",
      checkbox: { equals: false },
    },
  }),
});

export const collections = {
  work: work,
  store: store,
  posts: posts,
  database: database,
};
