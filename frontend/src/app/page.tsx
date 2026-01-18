import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-light-gray bg-off-white/60 p-8 shadow-paper sm:p-10">
        <div
          className="pointer-events-none absolute left-8 top-6 h-6 w-28 -rotate-2 rounded-sm bg-dusty-pink/70"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-10 top-10 h-5 w-24 rotate-2 rounded-sm bg-soft-blue/60"
          aria-hidden="true"
        />

        <div className="relative grid gap-10 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Nostalgic • Approachable</Badge>
              <Badge>Practice space</Badge>
            </div>

            <h1 className="script-title text-4xl leading-tight sm:text-5xl">
              Practice interviews like you’re writing in your favorite journal.
            </h1>
            <p className="max-w-xl font-typewriter text-base text-warm-gray sm:text-lg">
              Paste a job link, get a tiny stack of behavioral prompts, record out loud, and receive
              encouraging feedback you can actually use.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/interview/new">
                <Button className="w-full sm:w-auto">Start a mock interview</Button>
              </Link>
              <Link href="/interview/new" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Add job context
                </Button>
              </Link>
            </div>
            <p className="text-xs text-warm-gray">
              Tip: keep answers to ~60 seconds. Clarity beats speed.
            </p>
          </div>

          {/* Big sticky note CTA */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="grid gap-4">
              <Link
                href="/sessions"
                className="group relative w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                aria-label="Review previous sessions"
              >
                <div className="relative mx-auto -rotate-1 rounded-3xl border border-light-gray bg-butter-yellow/85 p-6 shadow-paper transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lift sm:p-8">
                  <p className="font-typewriter text-xl font-bold text-ink sm:text-2xl">
                    Review previous sessions
                  </p>
                  <p className="mt-2 max-w-[46ch] font-typewriter text-sm text-ink/75 sm:text-base">
                    Open your past practice notes, rewatch a take, and make the next one cleaner.
                  </p>
                  <p className="mt-4 inline-flex font-sans text-xs font-semibold text-ink underline decoration-ink/20 underline-offset-4">
                    Open the stack →
                  </p>
                </div>
              </Link>

              {/* Sticky note link (blue) */}
              <Link
                href="/character-profile"
                className="group relative mx-auto w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                aria-label="Character profile"
              >
                <div className="relative mx-auto rotate-[1deg] rounded-3xl border border-light-gray bg-soft-blue/28 p-6 shadow-paper transition duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lift sm:p-8">
                  <div className="pointer-events-none absolute -right-2 -top-2 h-0 w-0 border-b-[22px] border-l-[22px] border-b-transparent border-l-white/70" />
                  <p className="font-typewriter text-xl font-bold text-ink sm:text-2xl">
                    Character profile
                  </p>
                  <p className="mt-2 max-w-[46ch] font-typewriter text-sm text-ink/75 sm:text-base">
                    See your Confidence, Clarity, and Structure bars—and pick one to level up next.
                  </p>
                  <p className="mt-4 inline-flex font-sans text-xs font-semibold text-ink underline decoration-ink/20 underline-offset-4">
                    Open profile →
                  </p>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}

