import { z } from "zod";
import { translations, type TranslationDictionary } from "@/lib/i18n";

type ValidatorMessages = TranslationDictionary["validators"];

export function createConfigurationSchema(messages: ValidatorMessages = translations.en.validators) {
  return z
    .object({
      restApiUrl: z.string().trim().url(messages.restApiUrl),
      handleBaseUrl: z.string().trim().url(messages.handleBaseUrl)
    });
}

export const configurationSchema = createConfigurationSchema();

export type ConfigurationFormValues = z.infer<typeof configurationSchema>;
