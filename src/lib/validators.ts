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
    useBackendProxy: z.boolean(),
    backendProxyUrl: z.string().trim().url("Enter a valid backend proxy URL."),
    authMethod: z.enum(["bearer", "password"]),
    bearerToken: z.string(),
    email: z.string(),
    password: z.string(),
    metadataSearchField: metadataFieldSchema.default("dc.identifier.uri"),
    metadataUpdateField: metadataFieldSchema.default("dc.identifier.darkid")
  })
  .superRefine((value, ctx) => {
    if (value.authMethod === "bearer" && !value.bearerToken.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bearerToken"],
        message: "Bearer token is required."
      });
    }

    if (value.authMethod === "password") {
      if (!value.email.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Email is required."
        });
      }

      if (!value.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Password is required."
        });
      }
    }
  });

export type ConfigurationFormValues = z.infer<typeof configurationSchema>;
