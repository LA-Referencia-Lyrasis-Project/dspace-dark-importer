import { CheckCircle2, FileText, Search, Settings, TableProperties } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useI18n } from "@/state/I18nContext";

const icons = [Settings, FileText, CheckCircle2, Search, TableProperties];

export function HowItWorksPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal">{t.pages.howItWorks.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{t.pages.howItWorks.description}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.pages.howItWorks.stepsTitle}</CardTitle>
          <CardDescription>{t.pages.howItWorks.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {t.pages.howItWorks.steps.map((step, index) => {
            const Icon = icons[index] ?? CheckCircle2;

            return (
              <article key={step.title} className="flex gap-4 rounded-md border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-semibold">{step.title}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
                  {step.details ? (
                    <ol className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                      {step.details.map((detail) => (
                        <li key={detail}>{detail}</li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              </article>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.pages.howItWorks.csvExampleTitle}</CardTitle>
            <CardDescription>{t.pages.howItWorks.csvExampleDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-sm">
              <code>{`oai_identifier,dark_id
oai:deposita.ibict.br:deposita/635,dark:abcd123
oai:repositorio.bc.ufg.br:tede/10757,dark:efgh456`}</code>
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.pages.howItWorks.reportTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-muted-foreground">{t.pages.howItWorks.reportBody}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
