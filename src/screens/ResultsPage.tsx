import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAppContext } from "@/state/AppContext";
import { downloadReport } from "@/lib/report";
import { formatDuration } from "@/lib/utils";

export function ResultsPage() {
  const router = useRouter();
  const { results } = useAppContext();
  const rows = results.rows;
  const updated = rows.filter((row) => row.status === "UPDATED").length;
  const skipped = rows.filter((row) => row.status === "SKIPPED").length;
  const notFound = rows.filter((row) => row.status === "NOT FOUND").length;
  const multipleMatches = rows.filter((row) => row.status === "MULTIPLE MATCHES").length;
  const errors = rows.filter((row) => ["API ERROR", "VALIDATION ERROR", "AUTHENTICATION ERROR", "NETWORK ERROR"].includes(row.status)).length;

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert tone="warning">No execution report is available yet.</Alert>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/")}>
            Back to Configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>Execution report for the latest import session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
          {[
            ["Total Rows", rows.length],
            ["Updated", updated],
            ["Skipped", skipped],
            ["Not Found", notFound],
            ["Multiple", multipleMatches],
            ["Errors", errors],
            ["Time", formatDuration(results.elapsedMs)]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-md border">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">OAI Identifier</th>
                <th className="px-4 py-3 font-medium">Generated URI</th>
                <th className="px-4 py-3 font-medium">dARK ID</th>
                <th className="px-4 py-3 font-medium">Item UUID</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Message</th>
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
                      {row.status}
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
          New Import
        </Button>
        <Button onClick={() => downloadReport(rows)}>
          <Download className="h-4 w-4" />
          Download report.csv
        </Button>
      </CardFooter>
    </Card>
  );
}
