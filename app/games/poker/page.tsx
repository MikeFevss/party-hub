
"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Clock3,
  Copy,
  Crown,
  Dices,
  LockKeyhole,
  Plus,
  Spade,
  Users,
  X,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Play with friends",
    description: "Bring your group together at a private poker table.",
  },
  {
    icon: LockKeyhole,
    title: "Private rooms",
    description: "Use a room code to keep your games among friends.",
  },
  {
    icon: Clock3,
    title: "Your pace, your game",
    description: "Casual Texas Hold'em with no real-money betting.",
  },
];

const CARDS = [
  { rank: "A", suit: "♠", red: false },
  { rank: "K", suit: "♥", red: true },
  { rank: "Q", suit: "♣", red: false },
  { rank: "J", suit: "♦", red: true },
  { rank: "10", suit: "♠", red: false },
];

export default function PokerPage() {
  const [dialog, setDialog] = useState<"create" | "join" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [notice, setNotice] = useState("");

  function handleAction() {
    setNotice(
      dialog === "create"
        ? "Poker rooms are not available yet. The multiplayer engine is the next development milestone."
        : `Joining room ${roomCode.trim().toUpperCase()} will be available when multiplayer rooms are implemented.`,
    );
    setDialog(null);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-emerald-500/[0.12] blur-[130px]" />
        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-violet-600/[0.10] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 transition hover:opacity-80"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300 ring-1 ring-violet-400/20">
              <Dices size={22} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              party<span className="text-violet-400">hub</span>
            </span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.08]"
          >
            <ArrowLeft size={16} />
            All games
          </Link>
        </header>

        <section className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.07] px-3.5 py-2 text-sm text-amber-200">
              <Clock3 size={15} />
              In development
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Card game
            </p>

            <h1 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              Texas Hold&apos;em
              <span className="mt-2 block bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Play your hand.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-gray-400 sm:text-lg">
              Gather your friends around a virtual poker table. Read the board,
              make your move and see who takes the pot. Designed for casual
              games with friends, using virtual chips only.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setNotice("");
                  setDialog("create");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-[#06140e] transition hover:bg-emerald-400"
              >
                <Plus size={18} />
                Create a table
              </button>

              <button
                onClick={() => {
                  setNotice("");
                  setDialog("join");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold text-gray-200 transition hover:bg-white/[0.08]"
              >
                <Users size={18} />
                Join a table
              </button>
            </div>

            {notice && (
              <div
                role="status"
                className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100"
              >
                {notice}
              </div>
            )}

            <p className="mt-4 text-xs leading-5 text-gray-500">
              No real-money betting. Table creation and joining will be enabled
              when the multiplayer engine is ready.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-6 rounded-full bg-emerald-500/15 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/10 bg-[#11131a] p-4 shadow-2xl shadow-black/50 sm:p-6">
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Table preview
                  </p>
                  <h2 className="mt-1 text-lg font-bold">The High Rollers</h2>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-emerald-300">
                  <Spade size={22} />
                </div>
              </div>

              <div className="relative flex aspect-[1.15/1] items-center justify-center overflow-hidden rounded-[50%] border-[10px] border-[#34251d] bg-[#124a37] shadow-inner sm:border-[14px]">
                <div className="absolute inset-2 rounded-[50%] border border-white/15" />

                <div className="relative flex flex-col items-center">
                  <div className="mb-2 flex gap-2">
                    {CARDS.map((card, index) => (
                      <div
                        key={`${card.rank}-${card.suit}`}
                        className={`flex h-16 w-11 flex-col items-center justify-center rounded-md bg-[#f7f4ed] shadow-lg sm:h-20 sm:w-14 ${
                          card.red ? "text-red-600" : "text-slate-900"
                        }`}
                        style={{
                          transform: `rotate(${(index - 2) * 4}deg)`,
                        }}
                      >
                        <span className="text-sm font-black sm:text-base">
                          {card.rank}
                        </span>
                        <span className="text-lg leading-none sm:text-xl">
                          {card.suit}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/70">
                    Community cards
                  </p>

                  <div className="mt-4 rounded-full border border-amber-300/30 bg-black/20 px-5 py-2 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-100/60">
                      Pot
                    </p>
                    <p className="text-lg font-black text-amber-200">
                      2,400 chips
                    </p>
                  </div>
                </div>

                <div className="absolute left-[8%] top-[20%] rounded-xl border border-white/10 bg-[#14151c]/90 px-3 py-2 text-center shadow-lg">
                  <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
                    <Crown size={14} />
                  </div>
                  <p className="text-[10px] font-semibold">Player 1</p>
                </div>

                <div className="absolute right-[8%] top-[20%] rounded-xl border border-white/10 bg-[#14151c]/90 px-3 py-2 text-center shadow-lg">
                  <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-sky-200">
                    <Users size={14} />
                  </div>
                  <p className="text-[10px] font-semibold">Player 2</p>
                </div>

                <div className="absolute bottom-[7%] left-1/2 -translate-x-1/2 rounded-xl border border-emerald-300/30 bg-[#0d2119]/95 px-4 py-2 text-center shadow-lg">
                  <p className="text-xs font-bold text-emerald-200">Your seat</p>
                  <p className="mt-0.5 text-[10px] text-emerald-100/60">
                    1,200 chips
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {[
                  { label: "Players", value: "2–8" },
                  { label: "Game", value: "Hold'em" },
                  { label: "Currency", value: "Virtual" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-center"
                  >
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="mt-1 text-sm font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/[0.08] py-8 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </section>

        <section className="border-t border-white/[0.08] py-10">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white/[0.05] p-3 text-gray-300">
              <CircleHelp size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">New to Texas Hold&apos;em?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Each player receives two private cards. Five community cards
                are revealed over several betting rounds. The goal is to make
                the best five-card hand, or convince everyone else to fold.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/[0.08] py-6 text-center text-xs text-gray-500">
          Party Hub · Play together, have fun.
        </footer>
      </div>

      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDialog(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="poker-dialog-title"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141d] p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="poker-dialog-title" className="text-xl font-bold">
                {dialog === "create" ? "Create a table" : "Join a table"}
              </h2>
              <button
                onClick={() => setDialog(null)}
                aria-label="Close dialog"
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            {dialog === "create" ? (
              <>
                <p className="text-sm leading-6 text-gray-400">
                  Private poker tables are coming soon. You&apos;ll be able to
                  configure a table and invite friends with a room code.
                </p>
                <button
                  onClick={handleAction}
                  className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-[#06140e] transition hover:bg-emerald-400"
                >
                  Got it
                </button>
              </>
            ) : (
              <>
                <label
                  htmlFor="room-code"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  Room code
                </label>
                <input
                  id="room-code"
                  value={roomCode}
                  onChange={(event) =>
                    setRoomCode(event.target.value.toUpperCase().slice(0, 8))
                  }
                  placeholder="e.g. POKER123"
                  maxLength={8}
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/50"
                />
                <button
                  onClick={handleAction}
                  disabled={!roomCode.trim()}
                  className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-[#06140e] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}