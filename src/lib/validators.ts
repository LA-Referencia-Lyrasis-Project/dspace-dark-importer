import { z } from "zod";

const metadataFieldSchema = z
  .string()
  .trim()
  .min(1, "Metadata field is required.")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Use a valid DSpace metadata field, such as dc.identifier.uri.");

export const configurationSchema = z
  .object({
    restApiUrl: z.string().trim().url("Enter a valid DSpace REST API URL."),
    handleBaseUrl: z.string().trim().url("Enter a valid Handle Base URL."),
    bearerToken: z.string().trim().min(1, "Bearer token is required."),
    metadataSearchField: metadataFieldSchema.default("dc.identifier.uri"),
    metadataUpdateField: metadataFieldSchema.default("dc.identifier.darkid")
  });

export type ConfigurationFormValues = z.infer<typeof configurationSchema>;
