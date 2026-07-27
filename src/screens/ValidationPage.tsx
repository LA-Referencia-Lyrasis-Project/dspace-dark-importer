import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, DatabaseZap, Play, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useAppContext } from "@/state/AppContext";
import { useI18n } from "@/state/I18nContext";
import { validateCsvDataset } from "@/lib/csv";

export function ValidationPage() {
  const router = useRouter();
  const { config, dataset, setValidation, setStartRequested } = useAppContext();
  const { language, t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const validation = useMemo(() => validateCsvDataset(dataset, config.handleBaseUrl, t.csv, t.oai), [config.handleBaseUrl, dataset, t.csv, t.oai]);
  const numberLocale = language === "pt" ? "pt-BR" : "en-US";

  useEffect(() => {
    setValidation(validation);
  }, [setValidation, validation]);

  function handleStart(): void {
    setConfirmOpen(true);
  }

  function handleConfirmStart(): void {
    setConfirmOpen(false);
    setStartRequested(true);
    router.push("/processing");
  }

  if (!dataset) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert tone="error">{t.validation.uploadBeforeValidation}</Alert>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
            {t.validation.backToConfiguration}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canProcess = validation.errors.length === 0 && validation.totalRows > 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t.validation.title}</CardTitle>
          <CardDescription>{dataset.filename}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{t.common.total}</p>
              <p className="text-2xl font-semibold">{validation.totalRows.toLocaleString(numberLocale)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{t.common.valid}</p>
              <p className="text-2xl font-semibold text-secondary">{validation.validRows.toLocaleString(numberLocale)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{t.common.invalid}</p>
              <p className="text-2xl font-semibold text-destructive">{validation.invalidRows.toLocaleString(numberLocale)}</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-sm text-muted-foreground">{t.common.warnings}</p>
              <p className="text-2xl font-semibold">{validation.warnings.length.toLocaleString(numberLocale)}</p>
            </div>
          </div>

          {canProcess ? <Alert tone="success">{t.validation.validationPassed}</Alert> : <Alert tone="error">{t.validation.resolveValidationErrors}</Alert>}

          {[...validation.errors, ...validation.warnings].length > 0 ? (
            <div className="overflow-hidden rounded-md border">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t.common.severity}</th>
                    <th className="px-4 py-3 font-medium">{t.common.row}</th>
                    <th className="px-4 py-3 font-medium">{t.common.field}</th>
                    <th className="px-4 py-3 font-medium">{t.common.message}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...validation.errors, ...validation.warnings].map((issue, index) => (
                    <tr key={`${issue.message}-${index}`} className="border-t">
                      <td className="px-4 py-3">
                        <Badge tone={issue.severity === "error" ? "error" : "warning"}>{t.validation.issueSeverity[issue.severity]}</Badge>
                      </td>
                      <td className="px-4 py-3">{issue.rowNumber ?? "-"}</td>
                      <td className="px-4 py-3">{issue.field ?? "-"}</td>
                      <td className="px-4 py-3">{issue.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border p-4 text-sm text-muted-foreground">
              <TriangleAlert className="h-4 w-4" />
              {t.validation.noValidationIssues}
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="h-4 w-4" />
            {t.common.back}
          </Button>
          <Button onClick={handleStart} disabled={!canProcess}>
            <Play className="h-4 w-4" />
            {t.validation.startImport}
          </Button>
        </CardFooter>
      </Card>

      <Modal
        open={confirmOpen}
        title={t.validation.modalTitle}
        description={t.validation.modalDescription}
        onOpenChange={setConfirmOpen}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleConfirmStart}>
              <Play className="h-4 w-4" />
              {t.validation.startProcessing}
            </Button>
          </>
        }
      >
        <div className="flex gap-3 rounded-md border border-accent/40 bg-accent/10 p-4 text-sm">
          <DatabaseZap className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div className="space-y-2">
            <p className="font-medium">{t.validation.modalWarningTitle}</p>
            <p className="text-muted-foreground">
              {t.validation.modalWarningText(
                validation.validRows.toLocaleString(numberLocale),
                validation.validRows === 1 ? t.common.row : t.common.rows,
                config.metadataUpdateField
              )}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
