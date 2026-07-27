export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-4 w-16 rounded bg-card animate-pulse" />
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-card animate-pulse" />
          <div className="h-4 w-64 rounded bg-card animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="clubber-card p-5 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-40 rounded bg-background-secondary animate-pulse" />
                <div className="h-5 w-16 rounded-full bg-background-secondary animate-pulse" />
              </div>
              <div className="h-3 w-24 rounded bg-background-secondary animate-pulse" />
              <div className="h-9 w-full rounded-lg bg-background-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
