import WaxRecommender from "@/components/WaxRecommender";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-mf-blue mb-2">Ski Wax Guide</h1>
        <p className="text-mf-blue/60 max-w-md mx-auto">
          Get the right wax for today&#39;s conditions. Auto-detect your local
          temperature or enter it manually.
        </p>
      </div>
      <WaxRecommender />
    </main>
  );
}
