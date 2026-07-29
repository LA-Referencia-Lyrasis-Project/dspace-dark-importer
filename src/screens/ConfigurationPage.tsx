import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Field } from "@/components/Field";
import { useAppContext } from "@/state/AppContext";
import { useI18n } from "@/state/I18nContext";
import { parseCsvFile, validateCsvDataset } from "@/lib/csv";
import { loadRecent } from "@/lib/storage";
import { createConfigurationSchema, type ConfigurationFormValues } from "@/lib/validators";

export function ConfigurationPage() {
  const router = useRouter();
  const { config, setConfig, dataset, setDataset, setValidation } = useAppContext();
  const { language, t } = useI18n();
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const recent = useMemo(() => loadRecent(), []);
  const configurationSchema = useMemo(() => createConfigurationSchema(t.validators), [t.validators]);
  const numberLocale = language === "pt" ? "pt-BR" : "en-US";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationSchema),
    defaultValues: config
  });

  const handleBaseUrl = watch("handleBaseUrl");
  const csvSummary = useMemo(() => validateCsvDataset(dataset, handleBaseUrl, t.csv, t.oai), [dataset, handleBaseUrl, t.csv, t.oai]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    setCsvError(null);

    if (!file) {
      setDataset(null);
      return;
    }

    setIsParsingCsv(true);
    try {
      const parsed = await parseCsvFile(file, t.csv);
      setDataset(parsed);
    } catch (error) {
      setDataset(null);
      setCsvError(error instanceof Error ? error.message : t.configuration.unableToParseCsv);
    } finally {
      setIsParsingCsv(false);
    }
  }

  function onSubmit(values: ConfigurationFormValues): void {
    const validation = validateCsvDataset(dataset, values.handleBaseUrl, t.csv, t.oai);
    setConfig(values);
    setValidation(validation);

    if (!dataset) {
      setCsvError(t.configuration.uploadBeforeContinuing);
      return;
    }

    router.push("/validation");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t.configuration.title}</CardTitle>
          <CardDescription>{t.configuration.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field label={t.configuration.restApiUrl} htmlFor="restApiUrl" error={errors.restApiUrl?.message}>
            <Input id="restApiUrl" list="recent-rest-urls" placeholder="https://deposita.ibict.br/server" {...register("restApiUrl")} />
            <datalist id="recent-rest-urls">
              {recent.restApiUrls.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </Field>

          <Field label={t.configuration.handleBaseUrl} htmlFor="handleBaseUrl" error={errors.handleBaseUrl?.message}>
            <Input id="handleBaseUrl" list="recent-handle-urls" placeholder="https://deposita.ibict.br/handle/" {...register("handleBaseUrl")} />
            <datalist id="recent-handle-urls">
              {recent.handleBaseUrls.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </Field>

          <div className="grid gap-4">
            <Field label={t.configuration.metadataFieldToUpdate} htmlFor="metadataUpdateField" error={errors.metadataUpdateField?.message}>
              <Input id="metadataUpdateField" {...register("metadataUpdateField")}  placeholder="dc.identifier.dark"/>
            </Field>
          </div>

          <Field label={t.configuration.bearerToken} htmlFor="bearerToken" error={errors.bearerToken?.message}>
            <Input id="bearerToken" type="password" autoComplete="off" {...register("bearerToken")} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.configuration.csvUploadTitle}</CardTitle>
          <CardDescription>{t.configuration.csvUploadDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-4 py-6 text-center transition-colors hover:bg-muted">
            <FileUp className="mb-3 h-8 w-8 text-primary" />
            <span className="font-medium">{dataset ? dataset.filename : t.configuration.chooseCsvFile}</span>
            <span className="mt-1 text-sm text-muted-foreground">{t.configuration.csvOnly}</span>
            <Input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => void handleFileChange(event)} />
          </label>

          {isParsingCsv ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.configuration.parsingCsv}
            </div>
          ) : null}

          {csvError ? <Alert tone="error">{csvError}</Alert> : null}

          {dataset ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">{t.common.rows}</p>
                <p className="text-2xl font-semibold">{csvSummary.totalRows.toLocaleString(numberLocale)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">{t.common.valid}</p>
                <p className="text-2xl font-semibold text-secondary">{csvSummary.validRows.toLocaleString(numberLocale)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">{t.common.invalid}</p>
                <p className="text-2xl font-semibold text-destructive">{csvSummary.invalidRows.toLocaleString(numberLocale)}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">{t.common.warnings}</p>
                <p className="text-2xl font-semibold">{csvSummary.warnings.length.toLocaleString(numberLocale)}</p>
              </div>
            </div>
          ) : (
            <Badge tone="muted">{t.configuration.noFileSelected}</Badge>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || isParsingCsv}>
            {t.common.continue}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
