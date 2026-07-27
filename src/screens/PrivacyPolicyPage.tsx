import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useI18n } from "@/state/I18nContext";

export function PrivacyPolicyPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal">{t.pages.privacy.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{t.pages.privacy.description}</p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{t.pages.privacy.title}</CardTitle>
              <CardDescription>{t.pages.privacy.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          {t.pages.privacy.sections.map((section) => (
            <section key={section.title} className="rounded-md border p-4">
              <h2 className="font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
