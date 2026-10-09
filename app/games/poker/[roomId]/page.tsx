
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type PokerRoom = {
  id: string;
  room_code: string;
  max_players: number;
  status: string;
  created_at?: string;
};

type PokerPlayer = {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  is_ready: boolean;
  joined_at?: string;
};

function PokerRoomContent() {
  const { roomId } = useParams<{ roomId: string }>();
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [room, setRoom] = useState<PokerRoom | null>(null);
  const [players, setPlayers] = useState<PokerPlayer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("CONNECTING");

  const loadRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      const [roomResult, playersResult, userResult] = await Promise.all([
        supabase
          .from("poker_rooms")
          .select("*")
          .eq("id", roomId)
          .single(),

        supabase
          .from("poker_room_players")
          .select("*")
          .eq("room_id", roomId)
          .order("joined_at", { ascending: true }),

        supabase.auth.getUser(),
      ]);

      if (roomResult.error) {
        console.error("[Poker] Room query:", roomResult.error);
        setError("Could not find this poker room.");
        return;
      }

      if (playersResult.error) {
        console.error("[Poker] Players query:", playersResult.error);
        setError(playersResult.error.message);
        return;
      }

      setRoom(roomResult.data as PokerRoom);
      setPlayers((playersResult.data ?? []) as PokerPlayer[]);
      setCurrentUserId(userResult.data.user?.id ?? null);
      setError("");
    } catch (err) {
      console.error("[Poker] Loading failed:", err);
      setError("Could not load the poker room. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [roomId, supabase]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!roomId) return;

    let active = true;

    const channel = supabase
      .channel(`poker-room-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poker_room_players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (active) void loadRoom();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poker_rooms",
          filter: `id=eq.${roomId}`,
        },
        () => {
          if (active) void loadRoom();
        },
      )
      .subscribe((status, err) => {
        console.log("[Poker Realtime] Status:", status);

        if (!active) return;

        setRealtimeStatus(status);

        if (err) {
          console.error("[Poker Realtime] Error:", err);
        }

        if (status === "SUBSCRIBED") {
          void loadRoom();
        }

        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setError("Live updates are unavailable. Check Supabase Realtime.");
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId, supabase, loadRoom]);

  const me = players.find((p) => p.user_id === currentUserId);

  // The first player to join is treated as the host.
  const isHost = Boolean(
    currentUserId &&
    players.length > 0 &&
    players[0].user_id === currentUserId
  );

  const readyCount = players.filter((p) => p.is_ready).length;

  const canStart =
    isHost &&
    players.length >= 2 &&
    readyCount === players.length &&
    room?.status !== "playing";

  // If the host has started the game, other lobby members
  // automatically navigate when they receive the room update.
  useEffect(() => {
    if (room?.status === "playing" && roomId) {
      router.push(`/games/poker/${roomId}/play`);
    }
  }, [room?.status, roomId, router]);

  async function copyRoomCode() {
    if (!room?.room_code) return;

    try {
      await navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the room code. Please copy it manually.");
    }
  }

  async function toggleReady() {
    if (!room || !me || busy) return;

    setBusy(true);
    setError("");

    try {
      const { error: rpcError } = await supabase.rpc(
        "set_poker_ready" as never,
        {
          p_room_id: room.id,
          p_is_ready: !me.is_ready,
        } as never,
      );

      if (rpcError) throw rpcError;

      await loadRoom();
    } catch (err) {
      console.error("[Poker] Ready update failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not update your ready status.",
      );
    } finally {
      setBusy(false);
    }
  }

async function startGame() {
  if (!room) return;

  setError("");

  const { error: rpcError } = await supabase.rpc(
    "start_poker_game" as never,
    { p_room_id: room.id } as never
  );

  if (rpcError) {
    console.error("start_poker_game failed:", rpcError);

    const details = rpcError as unknown as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    setError(
      [
        details.message,
        details.details,
        details.hint,
        details.code ? `Code: ${details.code}` : "",
      ]
        .filter(Boolean)
        .join(" — ")
    );

    return;
  }

  router.push(`/games/poker/${room.id}/play`);
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-emerald-400" />
          <p className="text-slate-400">Loading poker room...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="mb-3 text-4xl">♠</div>
          <h1 className="text-2xl font-bold">Room unavailable</h1>
          <p className="mt-3 text-sm text-slate-400">
            {error || "This room may have been deleted or the link may be invalid."}
          </p>
          <button
            onClick={() => router.push("/games/poker")}
            className="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
          >
            Back to Poker
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/games/poker")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Poker
        </button>

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Poker Lobby
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Texas Hold&apos;em
            </h1>
            <p className="mt-2 text-slate-400">
              Invite your friends and get the table ready.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:min-w-52">
            <p className="text-xs uppercase tracking-widest text-slate-500">
              Room code
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-[0.2em] text-emerald-300">
                {room.room_code}
              </span>
              <button
                onClick={copyRoomCode}
                aria-label="Copy room code"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Share this code with your friends.
            </p>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-7">
              <div>
                <h2 className="text-lg font-semibold">Players</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {players.length} of {room.max_players} seats occupied
                </p>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                {readyCount} ready
              </span>
            </div>

            <div className="space-y-3 p-4 sm:p-6">
              {Array.from({ length: room.max_players }, (_, index) => {
                const player = players[index];

                return (
                  <div
                    key={player?.id ?? `empty-${index}`}
                    className={`flex items-center justify-between rounded-2xl border p-4 ${
                      player
                        ? "border-white/10 bg-white/[0.04]"
                        : "border-dashed border-white/10"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                          player
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-white/5 text-slate-600"
                        }`}
                      >
                        {player ? "♠" : "+"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {player?.display_name ?? "Empty seat"}
                          {player?.user_id === currentUserId && (
                            <span className="ml-2 text-xs text-slate-500">
                              You
                            </span>
                          )}
                          {player?.user_id === players[0]?.user_id && (
                            <span className="ml-2 text-xs text-emerald-300">
                              Host
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {player
                            ? player.is_ready
                              ? "Ready to play"
                              : "Waiting to get ready"
                            : "Waiting for a player"}
                        </p>
                      </div>
                    </div>

                    {player && (
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                          player.is_ready
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {player.is_ready ? "Ready" : "Not ready"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Your status</h2>
                <span
                  title={`Realtime: ${realtimeStatus}`}
                  className={`h-2.5 w-2.5 rounded-full ${
                    realtimeStatus === "SUBSCRIBED"
                      ? "bg-emerald-400"
                      : realtimeStatus === "CONNECTING"
                        ? "bg-amber-400"
                        : "bg-red-400"
                  }`}
                />
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {me
                  ? isHost
                    ? "You're the host. Start the game when everyone is ready."
                    : "Let everyone know when you're ready. The host will start the game."
                  : "Your player session could not be matched to this room. Try joining again."}
              </p>

              {me && (
                <button
                  onClick={toggleReady}
                  disabled={busy || starting || room.status === "playing"}
                  className={`mt-5 w-full rounded-xl px-4 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    me.is_ready
                      ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                      : "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  }`}
                >
                  {busy
                    ? "Updating..."
                    : me.is_ready
                      ? "I'm not ready"
                      : "I'm ready"}
                </button>
              )}

              {isHost && canStart && (
                <button
                  onClick={startGame}
                  disabled={starting}
                  className="mt-3 w-full rounded-xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
                >
                  {starting ? "Starting..." : "Start Game →"}
                </button>
              )}

              {isHost && !canStart && room.status !== "playing" && (
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  {players.length < 2
                    ? "At least two players are needed to start."
                    : readyCount < players.length
                      ? "Everyone must be ready before you can start."
                      : "The game cannot be started yet."}
                </p>
              )}

              {!isHost && (
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Only the host can start the game.
                </p>
              )}

              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Players ready</span>
                  <span className="font-medium">
                    {readyCount}/{players.length}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                    style={{
                      width:
                        players.length > 0
                          ? `${(readyCount / players.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="font-semibold">How to join</h3>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
                <li className="flex gap-3">
                  <span className="font-semibold text-emerald-300">01</span>
                  Share the room code with your friends.
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-emerald-300">02</span>
                  Everyone joins through the Poker page.
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-emerald-300">03</span>
                  Mark yourself ready when you're set.
                </li>
              </ol>
            </section>
          </aside>
        </div>

        <p className="mt-8 text-center text-xs text-slate-600">
          Party Hub · Poker Lobby
        </p>
      </div>
    </main>
  );
}

export default function PokerRoomPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
          <p className="text-slate-400">Loading poker room...</p>
        </main>
      }
    >
      <PokerRoomContent />
    </Suspense>
  );
}