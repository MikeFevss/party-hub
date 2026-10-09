
"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";

type Room = {
  id: string;
  room_code: string;
  status: string;
};

type GameState = {
  hand_number: number;
  phase: string;
  dealer_position: number;
  current_turn_user_id: string | null;
  pot: number;
  community_cards: string[];
  current_bet: number;
  min_raise: number;
};

type PlayerState = {
  user_id: string;
  seat_position: number;
  stack: number;
  current_bet: number;
  folded: boolean;
  all_in: boolean;
};

type RoomPlayer = {
  user_id: string;
  display_name: string;
  is_ready: boolean;
};

type PrivateCards = {
  card_one: string;
  card_two: string;
};

type PokerAction = "fold" | "check" | "call" | "raise";

const suitSymbols: Record<string, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

function formatCard(card: string) {
  if (!card || card.length < 2) {
    return { rank: "?", suit: "?", red: false };
  }

  const rawRank = card.slice(0, -1);
  const suit = card.slice(-1);

  return {
    rank: rawRank === "T" ? "10" : rawRank,
    suit: suitSymbols[suit] ?? suit,
    red: suit === "H" || suit === "D",
  };
}

function PlayingCard({
  card,
  hidden = false,
}: {
  card?: string;
  hidden?: boolean;
}) {
  if (hidden) {
    return (
      <div className="flex h-24 w-[68px] items-center justify-center rounded-xl border-2 border-white/30 bg-gradient-to-br from-indigo-600 to-violet-950 shadow-lg sm:h-28 sm:w-[78px]">
        <div className="flex h-[85%] w-[85%] items-center justify-center rounded-lg border border-white/30 text-3xl text-white/80">
          ♠
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="h-24 w-[68px] rounded-xl border border-dashed border-white/25 bg-black/10 sm:h-28 sm:w-[78px]" />
    );
  }

  const parsed = formatCard(card);

  return (
    <div
      className={`relative flex h-24 w-[68px] flex-col items-start justify-between rounded-xl bg-white p-2 shadow-lg sm:h-28 sm:w-[78px] ${
        parsed.red ? "text-red-600" : "text-slate-950"
      }`}
    >
      <span className="text-lg font-black leading-none">{parsed.rank}</span>
      <span className="self-center text-4xl leading-none">
        {parsed.suit}
      </span>
    </div>
  );
}

function PlayerSeat({
  player,
  roomPlayer,
  currentUserId,
  currentTurnUserId,
  dealerPosition,
}: {
  player: PlayerState;
  roomPlayer?: RoomPlayer;
  currentUserId: string;
  currentTurnUserId: string | null;
  dealerPosition: number;
}) {
  const isYou = player.user_id === currentUserId;
  const isTurn = player.user_id === currentTurnUserId;

  return (
    <div
      className={`min-w-0 rounded-2xl border p-3 transition sm:p-4 ${
        isTurn
          ? "border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-500/10"
          : "border-white/10 bg-slate-950/70"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 font-bold text-white">
          {(roomPlayer?.display_name ?? "?").charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {roomPlayer?.display_name ?? "Player"}
            {isYou ? " (You)" : ""}
          </p>
          <p className="text-xs text-slate-400">
            Seat {player.seat_position}
            {player.seat_position === dealerPosition ? " · Dealer" : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-emerald-300">
          {player.stack.toLocaleString()} chips
        </span>

        {player.folded && (
          <span className="rounded-full bg-red-500/15 px-2 py-1 text-xs text-red-300">
            Folded
          </span>
        )}

        {player.all_in && (
          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
            All-in
          </span>
        )}

        {isTurn && (
          <span className="rounded-full bg-amber-400/15 px-2 py-1 text-xs text-amber-300">
            Your turn
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400">
        Current bet: {player.current_bet.toLocaleString()}
      </p>
    </div>
  );
}

function PokerTableContent() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;
  const router = useRouter();
  const supabase = getSupabaseClient();

  const [room, setRoom] = useState<Room | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [privateCards, setPrivateCards] = useState<PrivateCards | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [raiseAmount, setRaiseAmount] = useState("20");

  const loadTable = useCallback(async () => {
    if (!roomId) return;

    const db = supabase as any;

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.replace("/");
        return;
      }

      setCurrentUserId(user.id);

      const [
        roomResult,
        gameResult,
        playerStateResult,
        roomPlayersResult,
        privateCardsResult,
      ] = await Promise.all([
        db
          .from("poker_rooms")
          .select("id, room_code, status")
          .eq("id", roomId)
          .maybeSingle(),

        db
          .from("poker_game_state")
          .select(
            "hand_number, phase, dealer_position, current_turn_user_id, pot, community_cards, current_bet, min_raise"
          )
          .eq("room_id", roomId)
          .maybeSingle(),

        db
          .from("poker_player_state")
          .select(
            "user_id, seat_position, stack, current_bet, folded, all_in"
          )
          .eq("room_id", roomId)
          .order("seat_position", { ascending: true }),

        db
          .from("poker_room_players")
          .select("user_id, display_name, is_ready")
          .eq("room_id", roomId),

        db
          .from("poker_private_cards")
          .select("card_one, card_two")
          .eq("room_id", roomId)
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      const firstError =
        roomResult.error ??
        gameResult.error ??
        playerStateResult.error ??
        roomPlayersResult.error ??
        privateCardsResult.error;

      if (firstError) throw firstError;

      if (!roomResult.data) {
        throw new Error("This Poker room could not be found.");
      }

      setRoom(roomResult.data);
      setGame(gameResult.data);
      setPlayers(playerStateResult.data ?? []);
      setRoomPlayers(roomPlayersResult.data ?? []);
      setPrivateCards(privateCardsResult.data);
      setError("");
    } catch (err) {
      console.error("Failed to load Poker table:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the Poker table."
      );
    } finally {
      setLoading(false);
    }
  }, [roomId, router, supabase]);

  // Keep the selected raise at or above the current minimum.
  useEffect(() => {
    if (!game) return;

    const minimum = game.current_bet + game.min_raise;

    setRaiseAmount((current) =>
      Number(current) < minimum ? String(minimum) : current
    );
  }, [game?.current_bet, game?.min_raise]);

  // Submit actions through the secured Supabase RPC.
  const runAction = useCallback(
    async (action: PokerAction, amount = 0) => {
      if (!roomId || actionLoading) return;

      setActionLoading(true);
      setActionError("");

      try {
        const db = supabase as any;

        const { error: rpcError } = await db.rpc("act_poker", {
          p_room_id: roomId,
          p_action: action,
          p_amount: amount,
        });

        if (rpcError) throw rpcError;

        await loadTable();
      } catch (err) {
        console.error("Poker action failed:", err);

        setActionError(
          err instanceof Error
            ? err.message
            : "Your action could not be completed."
        );

        // Refresh in case another player acted before this request arrived.
        await loadTable();
      } finally {
        setActionLoading(false);
      }
    },
    [actionLoading, loadTable, roomId, supabase]
  );

  useEffect(() => {
    let active = true;

    void loadTable();

    const channel = supabase
      .channel(`poker-table-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poker_game_state",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (active) void loadTable();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poker_player_state",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (active) void loadTable();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poker_room_players",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          if (active) void loadTable();
        }
      )
      .subscribe((status) => {
        console.log("Poker table realtime:", status);
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId, supabase, loadTable]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-emerald-400" />
          <p className="text-slate-300">Setting up the table...</p>
        </div>
      </main>
    );
  }

  if (error || !room || !game) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8 text-center">
          <div className="mb-4 text-4xl">🃏</div>
          <h1 className="text-2xl font-bold">Unable to load the table</h1>
          <p className="mt-3 break-words text-sm text-red-300">
            {error || "The game has not been initialized yet."}
          </p>
          <button
            onClick={() => router.push(`/games/poker/${roomId}`)}
            className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            Return to lobby
          </button>
          <button
            onClick={() => {
              setLoading(true);
              void loadTable();
            }}
            className="ml-2 mt-6 rounded-xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/5"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const myCards = privateCards
    ? [privateCards.card_one, privateCards.card_two]
    : [];

  const myPlayer = players.find(
    (player) => player.user_id === currentUserId
  );

  const isMyTurn = game.current_turn_user_id === currentUserId;
  const isShowdown = game.phase === "showdown";

  const canAct =
    Boolean(myPlayer) &&
    isMyTurn &&
    room.status === "playing" &&
    !isShowdown &&
    !myPlayer?.folded &&
    !myPlayer?.all_in;

  const amountToCall = myPlayer
    ? Math.max(0, game.current_bet - myPlayer.current_bet)
    : 0;

  const checkCallAction: PokerAction =
    amountToCall > 0 ? "call" : "check";

  const callWouldRequireAllIn =
    Boolean(myPlayer) &&
    amountToCall > 0 &&
    amountToCall >= myPlayer.stack;

  const minimumRaiseTotal = game.current_bet + game.min_raise;

  const maximumRaiseTotal = myPlayer
    ? myPlayer.current_bet + myPlayer.stack - 1
    : 0;

  const selectedRaise = Number(raiseAmount);

  const raiseIsValid =
    Number.isInteger(selectedRaise) &&
    selectedRaise >= minimumRaiseTotal &&
    selectedRaise <= maximumRaiseTotal;

  const actionButtonClass =
    "rounded-xl px-3 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              onClick={() => router.push(`/games/poker/${roomId}`)}
              className="mb-3 text-sm text-slate-400 transition hover:text-white"
            >
              ← Back to lobby
            </button>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Texas <span className="text-emerald-400">Hold’em</span>
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Room {room.room_code} · Hand #{game.hand_number}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live table
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-emerald-900 to-emerald-950 p-4 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-emerald-300/15 sm:inset-5" />

          <div className="relative flex min-h-[430px] flex-col items-center justify-center py-8">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200/70">
              Community cards
            </div>

            <div className="flex min-h-28 flex-wrap items-center justify-center gap-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <PlayingCard
                  key={index}
                  card={game.community_cards?.[index]}
                />
              ))}
            </div>

            <div className="mt-7 rounded-2xl border border-amber-200/20 bg-black/25 px-8 py-4 text-center shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200/70">
                Total pot
              </p>
              <p className="mt-1 text-3xl font-black text-amber-300">
                {game.pot.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-100/60">chips</p>
            </div>

            <div className="mt-5 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-emerald-100">
              {game.phase === "preflop"
                ? "Pre-flop"
                : game.phase === "flop"
                  ? "The Flop"
                  : game.phase === "turn"
                    ? "The Turn"
                    : game.phase === "river"
                      ? "The River"
                      : "Showdown"}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">Players</h2>
              <span className="text-sm text-slate-400">
                {players.length} at the table
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {players.map((player) => (
                <PlayerSeat
                  key={player.user_id}
                  player={player}
                  roomPlayer={roomPlayers.find(
                    (rp) => rp.user_id === player.user_id
                  )}
                  currentUserId={currentUserId}
                  currentTurnUserId={game.current_turn_user_id}
                  dealerPosition={game.dealer_position}
                />
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-3xl border border-white/10 bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold">Your hand</h2>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-300">
                {myPlayer
                  ? `${myPlayer.stack.toLocaleString()} chips`
                  : "Player"}
              </span>
            </div>

            <div className="mt-5 flex justify-center gap-3">
              {myCards.length === 2 ? (
                myCards.map((card, index) => (
                  <PlayingCard key={`${card}-${index}`} card={card} />
                ))
              ) : (
                <>
                  <PlayingCard hidden />
                  <PlayingCard hidden />
                </>
              )}
            </div>

            {!privateCards && (
              <p className="mt-3 text-center text-xs text-amber-300">
                Your private cards aren't available yet. Try refreshing.
              </p>
            )}

            <div className="mt-6 rounded-2xl bg-black/20 p-4">
              <p className="text-sm font-semibold text-slate-200">
                {isShowdown
                  ? "Hand complete"
                  : !myPlayer
                    ? "You are not seated in this hand"
                    : myPlayer.folded
                      ? "You folded this hand"
                      : myPlayer.all_in
                        ? "You are all-in"
                        : isMyTurn
                          ? "It's your turn"
                          : "Waiting for the next action"}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {isShowdown
                  ? "The hand has reached showdown. Hand evaluation and payouts are not implemented yet."
                  : isMyTurn
                    ? amountToCall > 0
                      ? `You need ${amountToCall.toLocaleString()} chips to call.`
                      : "You can check, raise, or fold."
                    : "The table updates automatically when the game state changes."}
              </p>
            </div>

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200"
              >
                {actionError}
              </div>
            )}

            {actionLoading && (
              <p className="mt-3 text-center text-xs text-amber-300">
                Processing your action…
              </p>
            )}

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => void runAction("fold")}
                disabled={!canAct || actionLoading}
                className={`${actionButtonClass} border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20`}
              >
                Fold
              </button>

              <button
                onClick={() => void runAction(checkCallAction)}
                disabled={
                  !canAct || actionLoading || callWouldRequireAllIn
                }
                title={
                  callWouldRequireAllIn
                    ? "All-in calls are not supported yet"
                    : checkCallAction === "call"
                      ? `Call ${amountToCall} chips`
                      : "Check"
                }
                className={`${actionButtonClass} border border-white/10 bg-white/10 text-white hover:bg-white/15`}
              >
                {callWouldRequireAllIn
                  ? "All-in"
                  : checkCallAction === "call"
                    ? `Call ${amountToCall.toLocaleString()}`
                    : "Check"}
              </button>

              <button
                onClick={() =>
                  void runAction("raise", selectedRaise)
                }
                disabled={
                  !canAct ||
                  actionLoading ||
                  !raiseIsValid
                }
                className={`${actionButtonClass} bg-amber-400 text-slate-950 hover:bg-amber-300`}
              >
                Raise
              </button>
            </div>

            <div className="mt-4">
              <label
                htmlFor="raise-amount"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Raise total bet to
              </label>

              <input
                id="raise-amount"
                type="number"
                min={minimumRaiseTotal}
                max={maximumRaiseTotal}
                step={1}
                value={raiseAmount}
                onChange={(event) => setRaiseAmount(event.target.value)}
                disabled={!canAct || actionLoading}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-amber-400 disabled:opacity-50"
              />

              <div className="mt-2 flex justify-between gap-3 text-xs text-slate-500">
                <span>
                  Minimum: {minimumRaiseTotal.toLocaleString()}
                </span>
                <span>
                  Your maximum: {Math.max(0, maximumRaiseTotal).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                Enter your total bet for this round, not the additional
                chips. All-in raises are not supported yet.
              </p>
            </div>
          </aside>
        </section>

        <footer className="mt-8 border-t border-white/10 py-5 text-center text-xs text-slate-500">
          Party Hub Poker · Play responsibly with your friends
        </footer>
      </div>
    </main>
  );
}

export default function PokerPlayPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
          Loading Poker table...
        </main>
      }
    >
      <PokerTableContent />
    </Suspense>
  );
}