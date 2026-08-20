export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="h-16 border-b border-border animate-pulse bg-card/40" />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
        <div className="h-[280px] sm:h-[360px] w-full rounded-3xl bg-card animate-pulse" />

        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 rounded-full bg-card animate-pulse shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="aspect-[4/3] bg-background-secondary animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-background-secondary animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-background-secondary animate-pulse" />
                <div className="h-9 w-full rounded-lg bg-background-secondary animate-pulse mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
