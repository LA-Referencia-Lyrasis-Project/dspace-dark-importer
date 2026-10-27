import { CirclePlay, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useI18n } from "@/state/I18nContext";

const youtubeUrl = "https://youtu.be/8vY6Cqbvbzg";
const youtubeEmbedUrl = "https://www.youtube-nocookie.com/embed/8vY6Cqbvbzg";

export function TutorialPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-normal">{t.pages.tutorial.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{t.pages.tutorial.description}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.pages.tutorial.prerequisiteTitle}</CardTitle>
          <CardDescription>{t.pages.tutorial.prerequisiteBody}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
            {t.pages.tutorial.workflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CirclePlay className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{t.pages.tutorial.title}</CardTitle>
              <CardDescription>{t.pages.tutorial.videoLabel}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            aria-label={t.pages.tutorial.videoLabel}
            className="aspect-video w-full rounded-md border bg-muted"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            src={youtubeEmbedUrl}
            title={t.pages.tutorial.videoLabel}
          />
          <a
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={youtubeUrl}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
            {t.pages.tutorial.openOnYoutube}
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
