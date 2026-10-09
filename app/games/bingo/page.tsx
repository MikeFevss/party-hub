
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const BINGO_URL = "https://bingo-mike-bca1.vercel.app";

export default function BingoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#09090f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl transition hover:opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
              <Gamepad2 size={22} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              party<span className="text-violet-400">hub</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            <ArrowLeft size={16} />
            <span>All games</span>
          </Link>
        </header>

        <section className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-2 text-sm text-emerald-300">
              <CheckCircle2 size={15} />
              Available to play
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
              Party game
            </p>

            <h1 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Party Bingo
              <span className="mt-2 block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Let the fun begin.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-400 sm:text-lg">
              Turn the moments happening around you into a competition.
              Create a game, invite your friends and see who gets Bingo first.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={BINGO_URL}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400"
              >
                Play Party Bingo
                <ExternalLink size={17} />
              </a>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-gray-200 transition hover:bg-white/[0.08]"
              >
                Explore other games
                <ArrowRight size={17} />
              </Link>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Party Bingo opens in its own website. Your game and its saved
              data remain in the existing service.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-8 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative rotate-1 rounded-3xl border border-white/10 bg-[#12121c]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                    Game preview
                  </p>
                  <h2 className="mt-1 text-lg font-bold">Your next win</h2>
                </div>
                <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[
                  "B", "I", "N", "G", "O",
                  "01", "08", "FREE", "11", "24",
                  "04", "16", "22", "07", "19",
                  "13", "02", "FREE", "21", "06",
                  "18", "10", "05", "14", "25",
                ].map((cell, index) => {
                  const isHeader = index < 5;
                  const isMarked = [6, 8, 11, 13, 16, 18, 20, 22, 24].includes(index);

                  return (
                    <div
                      key={`${cell}-${index}`}
                      className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold sm:text-sm ${
                        isHeader
                          ? "bg-violet-500/20 text-violet-300"
                          : isMarked
                            ? "border border-violet-400/30 bg-violet-500/25 text-violet-200"
                            : "border border-white/[0.06] bg-white/[0.035] text-gray-400"
                      }`}
                    >
                      {cell}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-400/10 p-2 text-emerald-300">
                    <Users size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Bring your group</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Friends, family and more
                    </p>
                  </div>
                </div>
                <ShieldCheck size={20} className="text-gray-500" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Ready when you are
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 rounded-2xl border border-white/10 bg-[#181522] px-4 py-3 shadow-xl sm:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">Bingo!</p>
                  <p className="text-xs text-gray-500">Let the celebrations begin</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/[0.08] py-8 sm:grid-cols-3">
          {[
            {
              title: "Create a game",
              description: "Start a new Bingo session for your group.",
            },
            {
              title: "Invite your friends",
              description: "Share the game so everyone can join in.",
            },
            {
              title: "Play to win",
              description: "Mark the moments and aim for Bingo.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
            >
              <p className="mb-3 text-xs font-bold text-violet-300">
                0{index + 1}
              </p>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </section>

        <footer className="border-t border-white/[0.08] py-6 text-center text-xs text-gray-500">
          Party Hub · More games, more memories.
        </footer>
      </div>
    </main>
  );
}