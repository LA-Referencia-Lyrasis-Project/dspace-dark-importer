import { z } from "zod";
import { translations, type TranslationDictionary } from "@/lib/i18n";

type ValidatorMessages = TranslationDictionary["validators"];

function metadataFieldSchema(messages: ValidatorMessages) {
  return z
    .string()
    .trim()
    .min(1, messages.metadataFieldRequired)
    .regex(/^[a-zA-Z0-9_.-]+$/, messages.invalidMetadataField);
}

export function createConfigurationSchema(messages: ValidatorMessages = translations.en.validators) {
  return z
    .object({
      restApiUrl: z.string().trim().url(messages.restApiUrl),
      handleBaseUrl: z.string().trim().url(messages.handleBaseUrl),
      bearerToken: z.string().trim().min(1, messages.bearerToken),
      metadataSearchField: metadataFieldSchema(messages).default("dc.identifier.uri"),
      metadataUpdateField: metadataFieldSchema(messages).default("dc.identifier.darkid")
    });
}

export const configurationSchema = createConfigurationSchema();

export type ConfigurationFormValues = z.infer<typeof configurationSchema>;
