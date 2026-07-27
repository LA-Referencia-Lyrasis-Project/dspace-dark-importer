import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, FileUp, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Field } from "@/components/Field";
import { useAppContext } from "@/app/AppContext";
import { parseCsvFile, validateCsvDataset } from "@/lib/csv";
import { loadRecent } from "@/lib/storage";
import { configurationSchema, type ConfigurationFormValues } from "@/lib/validators";

export function ConfigurationPage() {
  const navigate = useNavigate();
  const { config, setConfig, dataset, setDataset, setValidation } = useAppContext();
  const [csvError, setCsvError] = useState<string | null>(null);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const recent = useMemo(() => loadRecent(), []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationSchema),
    defaultValues: config
  });

  const authMethod = watch("authMethod");
  const useBackendProxy = watch("useBackendProxy");
  const handleBaseUrl = watch("handleBaseUrl");
  const csvSummary = useMemo(() => validateCsvDataset(dataset, handleBaseUrl), [dataset, handleBaseUrl]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    setCsvError(null);

    if (!file) {
      setDataset(null);
      return;
    }

    setIsParsingCsv(true);
    try {
      const parsed = await parseCsvFile(file);
      setDataset(parsed);
    } catch (error) {
      setDataset(null);
      setCsvError(error instanceof Error ? error.message : "Unable to parse the CSV file.");
    } finally {
      setIsParsingCsv(false);
    }
  }

  function onSubmit(values: ConfigurationFormValues): void {
    const validation = validateCsvDataset(dataset, values.handleBaseUrl);
    setConfig(values);
    setValidation(validation);

    if (!dataset) {
      setCsvError("Upload a CSV file before continuing.");
      return;
    }

    navigate("/validation");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Repository connection, authentication, and metadata fields.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <Field label="DSpace REST API URL" htmlFor="restApiUrl" error={errors.restApiUrl?.message}>
            <Input id="restApiUrl" list="recent-rest-urls" placeholder="https://repository.org/server" {...register("restApiUrl")} />
            <datalist id="recent-rest-urls">
              {recent.restApiUrls.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </Field>

          <Field label="Repository Handle Base URL" htmlFor="handleBaseUrl" error={errors.handleBaseUrl?.message}>
            <Input id="handleBaseUrl" list="recent-handle-urls" placeholder="https://deposita.ibict.br/handle/" {...register("handleBaseUrl")} />
            <datalist id="recent-handle-urls">
              {recent.handleBaseUrls.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </Field>

          <div className="rounded-md border p-4">
            <label className="flex items-start gap-3 text-sm">
              <input className="mt-1 h-4 w-4 accent-primary" type="checkbox" {...register("useBackendProxy")} />
              <span>
                <span className="block font-medium">Use backend proxy</span>
                <span className="mt-1 block text-muted-foreground">
                  Route DSpace API calls through a local proxy when the DSpace backend rejects browser CORS requests.
                </span>
              </span>
            </label>
            {useBackendProxy ? (
              <div className="mt-4">
                <Field label="Backend Proxy URL" htmlFor="backendProxyUrl" error={errors.backendProxyUrl?.message}>
                  <Input id="backendProxyUrl" placeholder="http://localhost:8787/api/dspace/proxy" {...register("backendProxyUrl")} />
                </Field>
              </div>
            ) : null}
          </div>

          <div className="grid gap-5">
            <Field label="Metadata Field to Update" htmlFor="metadataUpdateField" error={errors.metadataUpdateField?.message}>
              <Input id="metadataUpdateField" {...register("metadataUpdateField")} />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <Field label="Authentication" htmlFor="authMethod" error={errors.authMethod?.message}>
              <Select id="authMethod" {...register("authMethod")}>
                <option value="bearer">Bearer Token</option>
                <option value="password">Username and Password</option>
              </Select>
            </Field>

            {authMethod === "bearer" ? (
              <Field label="Bearer Token" htmlFor="bearerToken" error={errors.bearerToken?.message}>
                <Input id="bearerToken" type="password" autoComplete="off" {...register("bearerToken")} />
              </Field>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Email" htmlFor="email" error={errors.email?.message}>
                  <Input id="email" type="email" autoComplete="username" {...register("email")} />
                </Field>
                <Field label="Password" htmlFor="password" error={errors.password?.message}>
                  <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
                </Field>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Upload</CardTitle>
          <CardDescription>Required columns: oai_identifier and dark_id.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-4 py-8 text-center transition-colors hover:bg-muted">
            <FileUp className="mb-3 h-8 w-8 text-primary" />
            <span className="font-medium">{dataset ? dataset.filename : "Choose CSV file"}</span>
            <span className="mt-1 text-sm text-muted-foreground">.csv only</span>
            <Input className="sr-only" type="file" accept=".csv,text/csv" onChange={(event) => void handleFileChange(event)} />
          </label>

          {isParsingCsv ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Parsing CSV
            </div>
          ) : null}

          {csvError ? <Alert tone="error">{csvError}</Alert> : null}

          {dataset ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Rows</p>
                <p className="text-2xl font-semibold">{csvSummary.totalRows.toLocaleString()}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Valid</p>
                <p className="text-2xl font-semibold text-secondary">{csvSummary.validRows.toLocaleString()}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Invalid</p>
                <p className="text-2xl font-semibold text-destructive">{csvSummary.invalidRows.toLocaleString()}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-muted-foreground">Warnings</p>
                <p className="text-2xl font-semibold">{csvSummary.warnings.length.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <Badge tone="muted">No file selected</Badge>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || isParsingCsv}>
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
