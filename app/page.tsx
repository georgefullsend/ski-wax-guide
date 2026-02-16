import WaxRecommender from "@/components/WaxRecommender";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-mf-blue to-blue-300 bg-clip-text text-transparent text-glow mb-3">
          Ski Wax Guide
        </h1>
        <p className="text-lg tracking-wide text-mf-blue/60 max-w-md mx-auto">
          Get the right wax for today&#39;s conditions. Auto-detect your local
          temperature or enter it manually.
        </p>
      </div>
      <WaxRecommender />
    </main>
  );
}
