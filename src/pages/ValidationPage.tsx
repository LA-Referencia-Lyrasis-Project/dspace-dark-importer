import { useEffect, useMemo } from "react";
import { ArrowLeft, Play, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAppContext } from "@/app/AppContext";
import { validateCsvDataset } from "@/lib/csv";

export function ValidationPage() {
  const navigate = useNavigate();
  const { config, dataset, setValidation, setStartRequested } = useAppContext();
  const validation = useMemo(() => validateCsvDataset(dataset, config.handleBaseUrl), [config.handleBaseUrl, dataset]);

  useEffect(() => {
    setValidation(validation);
  }, [setValidation, validation]);

  function handleStart(): void {
    const confirmed = window.confirm(`Start processing ${validation.validRows.toLocaleString()} rows?`);
    if (!confirmed) {
      return;
    }

    setStartRequested(true);
    navigate("/processing");
  }

  if (!dataset) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert tone="error">Upload a CSV file before validation.</Alert>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>
            Back to Configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  const canProcess = validation.errors.length === 0 && validation.totalRows > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Validation</CardTitle>
        <CardDescription>{dataset.filename}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{validation.totalRows.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Valid</p>
            <p className="text-2xl font-semibold text-secondary">{validation.validRows.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Invalid</p>
            <p className="text-2xl font-semibold text-destructive">{validation.invalidRows.toLocaleString()}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-sm text-muted-foreground">Warnings</p>
            <p className="text-2xl font-semibold">{validation.warnings.length.toLocaleString()}</p>
          </div>
        </div>

        {canProcess ? <Alert tone="success">Validation passed. The import is ready to run.</Alert> : <Alert tone="error">Resolve validation errors before processing.</Alert>}

        {[...validation.errors, ...validation.warnings].length > 0 ? (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Row</th>
                  <th className="px-4 py-3 font-medium">Field</th>
                  <th className="px-4 py-3 font-medium">Message</th>
                </tr>
              </thead>
              <tbody>
                {[...validation.errors, ...validation.warnings].map((issue, index) => (
                  <tr key={`${issue.message}-${index}`} className="border-t">
                    <td className="px-4 py-3">
                      <Badge tone={issue.severity === "error" ? "error" : "warning"}>{issue.severity}</Badge>
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
            No validation issues found.
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleStart} disabled={!canProcess}>
          <Play className="h-4 w-4" />
          Start Import
        </Button>
      </CardFooter>
    </Card>
  );
}
