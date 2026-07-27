import { useEffect, useRef } from "react";
import { ArrowLeft, Ban, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { useAppContext } from "@/app/AppContext";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { useImporter } from "@/hooks/useImporter";
import { formatDuration } from "@/lib/utils";

export function ProcessingPage() {
  const navigate = useNavigate();
  const { config, dataset, startRequested, setStartRequested, setResults } = useAppContext();
  const rows = dataset?.rows ?? [];
  const importer = useImporter(config, rows);
  const didAutoStart = useRef(false);
  const logRef = useRef<HTMLDivElement | null>(null);

  useBeforeUnload(importer.isProcessing);

  useEffect(() => {
    if (startRequested && !didAutoStart.current && rows.length > 0) {
      didAutoStart.current = true;
      void importer.start();
    }
  }, [importer, rows.length, startRequested]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [importer.logs]);

  useEffect(() => {
    if (importer.status === "completed" || importer.status === "cancelled") {
      setStartRequested(false);
      setResults({ rows: importer.reportRows, elapsedMs: importer.elapsedMs });
    }
  }, [importer.elapsedMs, importer.reportRows, importer.status, setResults, setStartRequested]);

  if (!dataset) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert tone="error">Upload and validate a CSV file before processing.</Alert>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/")}>
            Back to Configuration
          </Button>
        </CardContent>
      </Card>
    );
  }

  const progressValue = importer.stats.total > 0 ? (importer.stats.processed / importer.stats.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Processing</CardTitle>
            <CardDescription>
              Processing {importer.stats.processed.toLocaleString()} of {importer.stats.total.toLocaleString()} items
            </CardDescription>
          </div>
          <Badge tone={importer.isProcessing ? "default" : importer.status === "completed" ? "success" : "muted"}>{importer.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progressValue} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{Math.round(progressValue)}%</span>
            <span>{formatDuration(importer.elapsedMs)}</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-8">
          {[
            ["Total", importer.stats.total],
            ["Processed", importer.stats.processed],
            ["Updated", importer.stats.updated],
            ["Skipped", importer.stats.skipped],
            ["Not Found", importer.stats.notFound],
            ["Multiple", importer.stats.multipleMatches],
            ["Errors", importer.stats.errors],
            ["Remaining", importer.stats.remaining]
          ].map(([label, value]) => (
            <div key={label} className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-semibold">{Number(value).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div ref={logRef} className="h-[360px] overflow-y-auto rounded-md border bg-muted/35 p-3 font-mono text-sm">
          {importer.logs.length === 0 ? (
            <p className="text-muted-foreground">Waiting to start.</p>
          ) : (
            <div className="space-y-2">
              {importer.logs.map((entry) => {
                const Icon = entry.level === "success" ? CheckCircle2 : entry.level === "error" ? XCircle : entry.level === "warning" ? Ban : Loader2;
                return (
                  <div key={entry.id} className="flex gap-2">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-muted-foreground">{entry.timestamp}</span>
                    {entry.rowNumber ? <span>row {entry.rowNumber}</span> : null}
                    <span>{entry.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" disabled={importer.isProcessing} onClick={() => navigate("/validation")}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-3">
          {importer.isProcessing ? (
            <Button variant="destructive" onClick={importer.cancel}>
              <Ban className="h-4 w-4" />
              Cancel
            </Button>
          ) : importer.status === "idle" ? (
            <Button onClick={() => void importer.start()}>
              <Loader2 className="h-4 w-4" />
              Start
            </Button>
          ) : (
            <Button onClick={() => navigate("/results")}>View Results</Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
