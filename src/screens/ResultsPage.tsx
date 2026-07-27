import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAppContext } from "@/state/AppContext";
import { useI18n } from "@/state/I18nContext";
import { downloadReport } from "@/lib/report";
import { formatDuration } from "@/lib/utils";

export function ResultsPage() {
  const router = useRouter();
  const { results } = useAppContext();
  const { language, t } = useI18n();
  const rows = results.rows;
  const numberLocale = language === "pt" ? "pt-BR" : "en-US";
  const updated = rows.filter((row) => row.status === "UPDATED").length;
  const skipped = rows.filter((row) => row.status === "SKIPPED").length;
  const notFound = rows.filter((row) => row.status === "NOT FOUND").length;
  const multipleMatches = rows.filter((row) => row.status === "MULTIPLE MATCHES").length;
  const errors = rows.filter((row) => ["API ERROR", "VALIDATION ERROR", "AUTHENTICATION ERROR", "NETWORK ERROR"].includes(row.status)).length;

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert tone="warning">{t.results.noReport}</Alert>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
            {t.validation.backToConfiguration}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.results.title}</CardTitle>
        <CardDescription>{t.results.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            [t.common.totalRows, rows.length],
            [t.common.updated, updated],
            [t.common.skipped, skipped],
            [t.common.notFound, notFound],
            [t.common.multiple, multipleMatches],
            [t.common.errors, errors],
            [t.common.time, formatDuration(results.elapsedMs)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold">{typeof value === "number" ? value.toLocaleString(numberLocale) : value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-md border">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t.results.columns.oaiIdentifier}</th>
                <th className="px-4 py-3 font-medium">{t.results.columns.generatedUri}</th>
                <th className="px-4 py-3 font-medium">{t.results.columns.darkId}</th>
                <th className="px-4 py-3 font-medium">{t.results.columns.itemUuid}</th>
                <th className="px-4 py-3 font-medium">{t.results.columns.status}</th>
                <th className="px-4 py-3 font-medium">{t.results.columns.message}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.oai_identifier}-${index}`} className="border-t align-top">
                  <td className="max-w-[220px] px-4 py-3 overflow-x-auto">{row.oai_identifier}</td>
                  <td className="max-w-[260px] px-4 py-3 overflow-x-auto">{row.generated_uri}</td>
                  <td className="px-4 py-3 overflow-x-auto">{row.dark_id}</td>
                  <td className="px-4 py-3 overflow-x-auto">{row.item_uuid || "-"}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        row.status === "UPDATED"
                          ? "success"
                          : row.status === "SKIPPED"
                            ? "muted"
                            : row.status === "NOT FOUND" || row.status === "MULTIPLE MATCHES"
                              ? "warning"
                              : "error"
                      }
                    >
                      {t.statuses[row.status]}
                    </Badge>
                  </td>
                  <td className="max-w-[260px] px-4 py-3">{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="h-4 w-4" />
          {t.results.newImport}
        </Button>
        <Button onClick={() => downloadReport(rows)}>
          <Download className="h-4 w-4" />
          {t.results.downloadReport}
        </Button>
      </CardFooter>
    </Card>
  );
}
