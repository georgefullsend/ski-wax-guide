import WaxRecommender from "@/components/WaxRecommender";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-3 sm:px-4 py-6 sm:py-12 relative">
      <div className="w-full max-w-xl mx-auto bg-black/40 backdrop-blur-md rounded-[22px] sm:rounded-[28px] p-4 sm:p-8 border border-white/[0.12] liquid-card">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white text-glow mb-2 sm:mb-3">
            Ski Wax Guide
          </h1>
          <p className="text-sm sm:text-lg tracking-wide text-white/60 max-w-md mx-auto">
            Maximize each run with the best wax for the conditions.
          </p>
        </div>
        <WaxRecommender />
      </div>
    </main>
  );
}
