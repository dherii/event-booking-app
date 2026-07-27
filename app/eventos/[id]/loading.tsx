export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="h-56 sm:h-72 bg-card animate-pulse" />
      <div className="max-w-3xl mx-auto px-4 sm:px-8 -mt-10 relative">
        <div className="clubber-card p-6 sm:p-8 space-y-4">
          <div className="h-4 w-24 rounded-full bg-background-secondary animate-pulse" />
          <div className="h-8 w-2/3 rounded bg-background-secondary animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-background-secondary animate-pulse" />
          <div className="h-20 w-full rounded bg-background-secondary animate-pulse" />
          <div className="h-16 w-full rounded-xl bg-background-secondary animate-pulse" />
          <div className="h-16 w-full rounded-xl bg-background-secondary animate-pulse" />
        </div>
      </div>
    </main>
  );
}
