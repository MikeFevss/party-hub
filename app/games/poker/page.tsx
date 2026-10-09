
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import {
  ArrowLeft,
  CircleHelp,
  Clock3,
  Dices,
  LockKeyhole,
  Plus,
  Spade,
  Users,
} from "lucide-react";

export default function PokerPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("8");
  const [roomCode, setRoomCode] = useState("");
  const [dialog, setDialog] = useState<"create" | "join" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getUserAndName() {
    const supabase = getSupabaseClient();
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user) {
      throw new Error("Please sign in with Google before creating or joining a room.");
    }

    const name =
      displayName.trim() ||
      data.user.user_metadata?.full_name ||
      data.user.user_metadata?.name ||
      data.user.email?.split("@")[0] ||
      "Player";

    return { supabase, name: String(name).slice(0, 24) };
  }

  async function createRoom() {
    setLoading(true);
    setError("");

    try {
      const { supabase, name } = await getUserAndName();

     const { data, error: rpcError } = await supabase.rpc(
        "create_poker_room" as never,
        {
            p_display_name: name,
            p_max_players: Number(maxPlayers),
        } as never,
        );

        if (rpcError) throw rpcError;

        const room = data as unknown as
        | { room_id: string; room_code: string }[]
        | { room_id: string; room_code: string }
        | null;

        const createdRoom = Array.isArray(room) ? room[0] : room;

        if (!createdRoom?.room_id) {
        throw new Error("The room was created, but its ID was not returned.");
        }

        router.push(`/games/poker/${createdRoom.room_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the room.");
    } finally {
      setLoading(false);
    }
  }

  async function joinRoom() {
    setLoading(true);
    setError("");

    try {
      const { supabase, name } = await getUserAndName();

      if (!roomCode.trim()) {
        throw new Error("Enter a room code.");
      }

    const { data, error: rpcError } = await supabase.rpc(
    "join_poker_room" as never,
    {
        p_room_code: roomCode.trim().toUpperCase(),
        p_display_name: name,
    } as never,
    );

    if (rpcError) throw rpcError;

    const result = data as unknown as
    | { room_id: string }[]
    | { room_id: string }
    | null;

    const joinedRoom = Array.isArray(result) ? result[0] : result;

    if (!joinedRoom?.room_id) {
    throw new Error("The room ID was not returned.");
    }

    router.push(`/games/poker/${joinedRoom.room_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not join the room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090f] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Dices size={22} />
            </span>
            <span>party<span className="text-violet-400">hub</span></span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/[0.06]"
          >
            <ArrowLeft size={16} /> All games
          </Link>
        </header>

        <section className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3.5 py-2 text-sm text-emerald-300">
              <Spade size={15} /> Multiplayer lobby
            </div>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
              Texas Hold&apos;em
              <span className="mt-2 block bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Play your hand.
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-7 text-gray-400">
              Create a private table or join your friends with a room code.
              This version sets up the lobby; the actual poker rounds come next.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setError("");
                  setDialog("create");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 font-semibold text-[#06140e] hover:bg-emerald-400"
              >
                <Plus size={18} /> Create a table
              </button>
              <button
                onClick={() => {
                  setError("");
                  setDialog("join");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 font-semibold hover:bg-white/[0.08]"
              >
                <Users size={18} /> Join a table
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Virtual chips only. No real-money betting.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#12131b] p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                <LockKeyhole size={22} />
              </div>
              <div>
                <h2 className="font-bold">Private tables</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Play with people you invite.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <Users className="mb-3 text-emerald-300" size={20} />
                <p className="font-bold">2–8 players</p>
                <p className="mt-1 text-xs text-gray-500">Choose table size</p>
              </div>
              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
                <Clock3 className="mb-3 text-emerald-300" size={20} />
                <p className="font-bold">Live lobby</p>
                <p className="mt-1 text-xs text-gray-500">See who joins</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="flex items-center gap-3">
                <CircleHelp size={20} className="text-gray-400" />
                <p className="text-sm leading-6 text-gray-400">
                  Sign in with Google to create or join a room. You can use
                  your Google profile name or enter a nickname.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141d] p-6">
            <h2 className="text-xl font-bold">
              {dialog === "create" ? "Create a table" : "Join a table"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Sign in is required. Enter an optional nickname to use at the table.
            </p>

            <label htmlFor="display-name" className="mb-2 mt-5 block text-sm text-gray-300">
              Nickname (optional)
            </label>
            <input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value.slice(0, 24))}
              placeholder="Your name"
              maxLength={24}
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-emerald-400/50"
            />

            {dialog === "create" ? (
              <>
                <label htmlFor="max-players" className="mb-2 mt-4 block text-sm text-gray-300">
                  Maximum players
                </label>
                <select
                  id="max-players"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#191922] px-4 py-3 outline-none"
                >
                  {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} players</option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <label htmlFor="room-code" className="mb-2 mt-4 block text-sm text-gray-300">
                  Room code
                </label>
                <input
                  id="room-code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                  placeholder="Enter room code"
                  maxLength={8}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 uppercase outline-none focus:border-emerald-400/50"
                />
              </>
            )}

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDialog(null)}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/10 px-4 py-3 font-semibold text-gray-300 hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                onClick={dialog === "create" ? createRoom : joinRoom}
                disabled={loading || (dialog === "join" && !roomCode.trim())}
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-[#06140e] hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading ? "Please wait..." : dialog === "create" ? "Create room" : "Join room"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}