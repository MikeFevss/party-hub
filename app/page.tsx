
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Crown,
  Gamepad2,
  Grid2X2,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { AuthButton } from "@/components/auth-button";

type Category = "All Games" | "Party" | "Strategy" | "Cards";

type Game = {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, "All Games">;
  players: string;
  status: "Available" | "Coming Soon";
  icon: "bingo" | "poker" | "chess" | "quiz";
  accent: string;
  href: string;
};

const games: Game[] = [

  {
    id: "bingo",
    name: "Party Bingo",
    description:
      "Turn everyday moments into a competition. Create a game and play with your group.",
    category: "Party",
    players: "2–50+ players",
    status: "Available",
    icon: "bingo",
    accent: "violet",
    href: "/games/bingo",
  },

  {
    id: "poker",
    name: "Texas Hold'em",
    description:
      "Build your stack, read the table and outplay your friends in private poker rooms.",
    category: "Cards",
    players: "2–9 players",
    status: "Coming Soon",
    icon: "poker",
    accent: "emerald",
    href: "/games/poker",
  },
  {
    id: "chess",
    name: "Chess",
    description:
      "Challenge a friend to a match of strategy, tactics and patience.",
    category: "Strategy",
    players: "2 players",
    status: "Coming Soon",
    icon: "chess",
    accent: "blue",
    href: "/games/chess",
  },
  {
    id: "quiz",
    name: "Quiz Battle",
    description:
      "Put your knowledge to the test. Race your friends to the right answer.",
    category: "Party",
    players: "2–20 players",
    status: "Coming Soon",
    icon: "quiz",
    accent: "amber",
    href: "/games/quiz",
  },
];

const categories: Category[] = [
  "All Games",
  "Party",
  "Strategy",
  "Cards",
];

function GameArtwork({ game }: { game: Game }) {
  switch (game.icon) {
    case "bingo":
      return (
        <div className="bingo-art" aria-label="Bingo board preview">
          <div className="bingo-letters">
            {["B", "I", "N", "G", "O"].map((letter) => (
              <span key={letter}>{letter}</span>
            ))}
          </div>

          <div className="bingo-grid">
            {Array.from({ length: 25 }, (_, i) => (
              <span
                key={i}
                className={`bingo-cell ${
                  [2, 6, 12, 18, 22].includes(i)
                    ? "bingo-marked"
                    : ""
                }`}
              >
                {i === 12 ? "★" : ((i * 7 + 11) % 25) + 1}
              </span>
            ))}
          </div>
        </div>
      );

    case "poker":
      return (
        <div className="poker-art" aria-label="Poker card preview">
          <div className="playing-card playing-card-back">
            <span>♠</span>
          </div>

          <div className="playing-card playing-card-front">
            <span className="card-corner">A</span>
            <span className="card-suit">♥</span>
          </div>

          <div className="poker-chip poker-chip-one" />
          <div className="poker-chip poker-chip-two" />
        </div>
      );

    case "chess":
      return (
        <div className="chess-art" aria-label="Chess board preview">
          <div className="chess-board">
            {Array.from({ length: 64 }, (_, i) => (
              <span
                key={i}
                className={
                  (Math.floor(i / 8) + (i % 8)) % 2
                    ? "dark-square"
                    : ""
                }
              />
            ))}
          </div>

          <span className="chess-piece">♞</span>
        </div>
      );

    case "quiz":
      return (
        <div className="quiz-art" aria-label="Quiz preview">
          <div className="quiz-question">?</div>

          <div className="quiz-options">
            <span>A</span>
            <span className="quiz-option-correct">B</span>
            <span>C</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="game-art-fallback" aria-label="Game preview">
          <span>?</span>
        </div>
      );
  }
}

function GameCard({ game }: { game: Game }) {
  const available = game.status === "Available";

  return (
    <article className="game-card" data-game-id={game.id}>
      <div className={`game-art-wrap accent-${game.accent}`}>
        <GameArtwork game={game} />

        <span
          className={`status-pill ${
            available ? "status-live" : ""
          }`}
        >
          {game.status}
        </span>

        <span className="game-category">{game.category}</span>
      </div>

      <div className="game-card-body">
        <div className="game-card-title-row">
          <h3>{game.name}</h3>

          <span className="player-count">
            <Users size={14} />
            {game.players}
          </span>
        </div>

        <p>{game.description}</p>

        <button
          type="button"
          className={`game-action ${
            available ? "game-action-live" : ""
          }`}
          disabled={!available}
          onClick={() => {
            if (available) {
              window.location.href = game.href;
            }
          }}
        >
          {available ? "Play now" : "Coming soon"}
          {available && <ArrowRight size={16} />}
        </button>
      </div>
    </article>
  );
}
export default function Home() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("All Games");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    return games.filter((game) => {
      const matchesCategory =
        activeCategory === "All Games" ||
        game.category === activeCategory;

      const matchesSearch =
        !query ||
        game.name.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const displayedGames = showAll
    ? filteredGames
    : filteredGames.slice(0, 3);

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">
            <Gamepad2 size={22} />
          </span>

          <span>
            party<span className="brand-accent">hub</span>
          </span>

          <span className="brand-tagline">PLAY TOGETHER</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a
            className="nav-link nav-link-active"
            href="#games"
          >
            Games
          </a>

          <a className="nav-link" href="#how-it-works">
            How it works
          </a>
        </nav>

        <div className="topbar-actions">
          <AuthButton />
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={14} />
            YOUR NEXT GAME NIGHT STARTS HERE
          </div>

          <h1>
            Good friends.
            <br />
            <span>Great games.</span>
            <br />
            One place.
          </h1>

          <p className="hero-description">
            Bring your people together. Create a room, share a link
            and let the games begin — wherever everyone is.
          </p>

          <div className="hero-actions">
            <a href="#games" className="primary-button">
              Explore games <ArrowRight size={17} />
            </a>

            <a
              href="#how-it-works"
              className="secondary-button"
            >
              How it works
            </a>
          </div>

          <div className="hero-proof">
            <span className="proof-icon">
              <Users size={17} />
            </span>

            <span>
              <strong>Made for your group</strong>
              <small>Same room or miles apart</small>
            </span>
          </div>
        </div>

        <div
          className="hero-visual"
          aria-label="Preview of the game library"
        >
          <div className="hero-orbit hero-orbit-outer" />
          <div className="hero-orbit hero-orbit-inner" />

          <div className="floating-card float-card-top">
            <span className="floating-icon purple-icon">
              <Trophy size={19} />
            </span>

            <span>
              <strong>Game night</strong>
              <small>Just got better</small>
            </span>
          </div>

          <div className="hero-controller">
            <Gamepad2 size={116} strokeWidth={1.2} />

            <span className="controller-spark controller-spark-one">
              ✦
            </span>

            <span className="controller-spark controller-spark-two">
              ✦
            </span>
          </div>

          <div className="floating-card float-card-bottom">
            <span className="floating-icon green-icon">
              <Users size={19} />
            </span>

            <span>
              <strong>Your people</strong>
              <small>Your private room</small>
            </span>

            <span className="online-indicator" />
          </div>

          <div className="hero-caption">
            <span className="caption-line" />
            <span>ONE LINK. EVERYONE IN.</span>
          </div>
        </div>
      </section>

      <section
        className="feature-strip"
        aria-label="Platform features"
      >
        <div className="feature-item">
          <span className="feature-icon">
            <Users size={19} />
          </span>

          <span>
            <strong>Play with anyone</strong>
            <small>Invite your friends</small>
          </span>
        </div>

        <div className="feature-item">
          <span className="feature-icon">
            <ShieldCheck size={19} />
          </span>

          <span>
            <strong>Your own rooms</strong>
            <small>Play with your group</small>
          </span>
        </div>

        <div className="feature-item">
          <span className="feature-icon">
            <Swords size={19} />
          </span>

          <span>
            <strong>Every kind of player</strong>
            <small>Party to strategy</small>
          </span>
        </div>
      </section>

      <section className="games-section" id="games">
        <div className="section-heading">
          <div>
            <div className="eyebrow section-eyebrow">
              <Grid2X2 size={14} />
              THE GAME LIBRARY
            </div>

            <h2>
              Pick your next <span>challenge.</span>
            </h2>

            <p>
              Quick laughs, friendly rivalries and rematches to
              settle.
            </p>
          </div>

          <div className="library-count">
            <span className="count-number">
              {games.length.toString().padStart(2, "0")}
            </span>

            <span>
              GAMES
              <br />
              IN LIBRARY
            </span>
          </div>
        </div>

        <div className="game-toolbar">
          <div
            className="category-tabs"
            role="group"
            aria-label="Filter games"
          >
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={`category-tab ${
                  activeCategory === category
                    ? "category-tab-active"
                    : ""
                }`}
                onClick={() => {
                  setActiveCategory(category);
                  setShowAll(false);
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <label className="search-box">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShowAll(true);
              }}
              placeholder="Find a game..."
              aria-label="Find a game"
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </label>
        </div>

        {displayedGames.length > 0 ? (
          <div className="games-grid">
            {displayedGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <CircleHelp size={28} />

            <h3>No games found</h3>
            <p>Try another search or category.</p>

            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All Games");
                setShowAll(false);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!search && filteredGames.length > 3 && (
          <button
            type="button"
            className="view-all-button"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show fewer games" : "View all games"}

            <ChevronDown
              size={17}
              className={showAll ? "chevron-up" : ""}
            />
          </button>
        )}
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-intro">
          <div className="eyebrow section-eyebrow">
            <Sparkles size={14} />
            NO COMPLICATED SETUP
          </div>

          <h2>
            From invite to <span>game on.</span>
          </h2>

          <p>Less organising. More playing.</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <span className="step-icon">
              <Grid2X2 size={22} />
            </span>

            <h3>Choose a game</h3>
            <p>Pick something your whole group will enjoy.</p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <span className="step-icon">
              <Users size={22} />
            </span>

            <h3>Bring your friends</h3>
            <p>
              Create a room and invite everyone with a link.
            </p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <span className="step-icon">
              <Crown size={22} />
            </span>

            <h3>Make it a night</h3>
            <p>Play, compete and come back for a rematch.</p>
          </div>
        </div>
      </section>

      <section className="bottom-cta">
        <div className="cta-decoration">✳</div>

        <div>
          <div className="eyebrow">
            <Sparkles size={14} />
            YOUR PEOPLE ARE WAITING
          </div>

          <h2>
            Got a group? <span>You're all set.</span>
          </h2>

          <p>
            More games are on the way. Pick your crew and stay
            tuned.
          </p>
        </div>

        <a href="#games" className="primary-button">
          Browse games <ArrowRight size={17} />
        </a>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="/">
          <span className="brand-icon">
            <Gamepad2 size={20} />
          </span>

          <span>
            party<span className="brand-accent">hub</span>
          </span>
        </a>

        <span className="footer-copy">
          Made for good times with good people.
        </span>

        <span className="footer-legal">
          © {currentYear ?? 2026} Party Hub
        </span>
      </footer>
    </main>
  );
}