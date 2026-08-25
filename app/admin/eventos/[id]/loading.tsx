// app/eventos/[id]/loading.tsx
export default function Loading() {
  return (
    <main className="min-h-screen bg-background text-foreground animate-pulse">
      <div className="h-14 border-b border-border bg-card/50" />
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="w-full aspect-[16/9] rounded-2xl bg-card" />
            <div className="h-20 rounded-2xl bg-card" />
            <div className="h-40 rounded-2xl bg-card" />
          </div>
          <div className="hidden lg:block lg:col-span-5 space-y-4">
            <div className="h-96 rounded-2xl bg-card" />
          </div>
        </div>
      </div>
    </main>
  );
}