"use client";

/**
 * Blackjack minigame.
 *
 * The card rendering is a TSX port of therewillbecode/react-poker
 * (https://github.com/therewillbecode/react-poker): cards start stacked on the
 * deck and spring to their seat, and each one is a 3D `rotateY` flip between a
 * back face and a front face that are stacked with `backface-visibility:
 * hidden`. The original runs on React 16 lifecycles (componentWillReceiveProps)
 * and react-motion, neither of which survives React 19, so the springs come
 * from framer-motion (already a dependency) and the faces are drawn inline
 * instead of pulling in the library's ~8MB of court-card SVGs.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion } from "framer-motion";

type Suit = "s" | "h" | "d" | "c";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

interface PlayingCard {
  rank: Rank;
  suit: Suit;
  /** Unique across reshuffles so React keys never collide between shoes. */
  id: string;
  /** Seconds to wait before this card leaves the deck. 0 for hits. */
  delay: number;
}

type Phase = "betting" | "dealing" | "player" | "dealer" | "settled";

const SUITS: Suit[] = ["s", "h", "d", "c"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const SUIT_GLYPH: Record<Suit, string> = { s: "♠", h: "♥", d: "♦", c: "♣" };

const CARD_RATIO = 0.7; // width / height, same proportion react-poker uses
const DEAL_STAGGER = 0.16; // seconds between cards in the opening deal
const FLIP_AFTER = 0.34; // let a card land before it turns over
const RESHUFFLE_AT = 15; // cards left in the shoe before a fresh one is cut
const STARTING_CREDITS = 500;
const CHIPS = [25, 50, 100];

const MONO = "Fixedsys, 'Fixedsys Excelsior', 'Courier New', Courier, monospace";

const isRed = (suit: Suit) => suit === "h" || suit === "d";

/* ---------------------------------------------------------------- shoe ---- */

let shoePass = 0;

function freshShoe(): PlayingCard[] {
  shoePass += 1;
  const cards: PlayingCard[] = [];
  for (const rank of RANKS) {
    for (const suit of SUITS) {
      cards.push({ rank, suit, id: `${rank}${suit}-${shoePass}`, delay: 0 });
    }
  }
  // Fisher-Yates. Only ever called from an event handler, so the server render
  // never sees a shuffled deck and there is nothing to mismatch on hydration.
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function handValue(cards: PlayingCard[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
    } else if (card.rank === "K" || card.rank === "Q" || card.rank === "J" || card.rank === "10") {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  let softAces = aces;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces -= 1;
  }
  return { total, soft: softAces > 0 };
}

const isBlackjack = (cards: PlayingCard[]) => cards.length === 2 && handValue(cards).total === 21;

/* --------------------------------------------------------------- faces ---- */

/** Pip coordinates as fractions of the card face, in standard deck layout. */
const PIPS: Record<string, Array<[number, number]>> = {
  "2": [[0.5, 0.17], [0.5, 0.83]],
  "3": [[0.5, 0.17], [0.5, 0.5], [0.5, 0.83]],
  "4": [[0.3, 0.17], [0.7, 0.17], [0.3, 0.83], [0.7, 0.83]],
  "5": [[0.3, 0.17], [0.7, 0.17], [0.5, 0.5], [0.3, 0.83], [0.7, 0.83]],
  "6": [[0.3, 0.17], [0.7, 0.17], [0.3, 0.5], [0.7, 0.5], [0.3, 0.83], [0.7, 0.83]],
  "7": [[0.3, 0.17], [0.7, 0.17], [0.5, 0.33], [0.3, 0.5], [0.7, 0.5], [0.3, 0.83], [0.7, 0.83]],
  "8": [[0.3, 0.17], [0.7, 0.17], [0.5, 0.33], [0.3, 0.5], [0.7, 0.5], [0.5, 0.67], [0.3, 0.83], [0.7, 0.83]],
  "9": [[0.3, 0.17], [0.7, 0.17], [0.3, 0.39], [0.7, 0.39], [0.5, 0.5], [0.3, 0.61], [0.7, 0.61], [0.3, 0.83], [0.7, 0.83]],
  "10": [[0.3, 0.17], [0.7, 0.17], [0.5, 0.29], [0.3, 0.39], [0.7, 0.39], [0.3, 0.61], [0.7, 0.61], [0.5, 0.71], [0.3, 0.83], [0.7, 0.83]],
};

function CardFace({ card, size }: { card: PlayingCard; size: number }) {
  const color = isRed(card.suit) ? "#c0223b" : "#101010";
  const glyph = SUIT_GLYPH[card.suit];
  const isCourt = card.rank === "J" || card.rank === "Q" || card.rank === "K";
  const pips = PIPS[card.rank];

  const corner = (flipped: boolean) => (
    <div
      style={{
        position: "absolute",
        top: flipped ? "auto" : size * 0.04,
        bottom: flipped ? size * 0.04 : "auto",
        left: flipped ? "auto" : size * 0.05,
        right: flipped ? size * 0.05 : "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1,
        transform: flipped ? "rotate(180deg)" : undefined,
        color,
      }}
    >
      <span style={{ fontSize: size * (card.rank === "10" ? 0.15 : 0.19), fontWeight: "bold" }}>{card.rank}</span>
      <span style={{ fontSize: size * 0.15 }}>{glyph}</span>
    </div>
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#fdfdf7",
        border: "2px solid #101010",
        borderRadius: size * 0.06,
        boxShadow: "inset 0 0 0 1px #ffffff",
        position: "relative",
        overflow: "hidden",
        fontFamily: MONO,
      }}
    >
      {corner(false)}
      {corner(true)}

      {card.rank === "A" && (
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: size * 0.42,
            color,
          }}
        >
          {glyph}
        </span>
      )}

      {isCourt && (
        <div
          style={{
            position: "absolute",
            top: "18%",
            bottom: "18%",
            left: "24%",
            right: "24%",
            border: `2px solid ${color}`,
            borderRadius: size * 0.03,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: size * 0.02,
            color,
            backgroundColor: isRed(card.suit) ? "#fdeff1" : "#f1f1f1",
          }}
        >
          <span style={{ fontSize: size * 0.13 }}>{glyph}</span>
          <span style={{ fontSize: size * 0.26, fontWeight: "bold" }}>{card.rank}</span>
          <span style={{ fontSize: size * 0.13, transform: "rotate(180deg)" }}>{glyph}</span>
        </div>
      )}

      {pips?.map(([x, y], i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            transform: `translate(-50%, -50%) rotate(${y > 0.5 ? 180 : 0}deg)`,
            fontSize: size * 0.17,
            lineHeight: 1,
            color,
          }}
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}

function CardBack({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        border: "2px solid #101010",
        borderRadius: size * 0.06,
        backgroundColor: "#1b2a6b",
        backgroundImage:
          "repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0 3px, transparent 3px 8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 0 0 3px #fdfdf7, inset 0 0 0 5px #1b2a6b",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/masterball-new.png"
        alt=""
        width={Math.round(size * 0.34)}
        height={Math.round(size * 0.34)}
        className="pixelated"
      />
    </div>
  );
}

/* ---------------------------------------------------------------- card ---- */

interface CardViewProps {
  card: PlayingCard;
  faceUp: boolean;
  size: number;
  deckRef: RefObject<HTMLDivElement | null>;
}

/**
 * One dealt card. The seat in the hand row is a plain sized box; the card
 * itself is absolutely positioned inside it and springs in from wherever the
 * deck happens to be, which is measured once before the first paint.
 */
function CardView({ card, faceUp, size, deckRef }: CardViewProps) {
  const seatRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const landed = useRef(false);

  useLayoutEffect(() => {
    const seat = seatRef.current;
    const deck = deckRef.current;
    if (!seat) return;
    if (!deck) {
      setOrigin({ x: 0, y: -size });
      return;
    }
    const seatBox = seat.getBoundingClientRect();
    const deckBox = deck.getBoundingClientRect();
    setOrigin({ x: deckBox.left - seatBox.left, y: deckBox.top - seatBox.top });
    // Measured in a layout effect, so the re-render lands before the browser
    // paints and the card is never seen sitting at its destination.
  }, [deckRef, size]);

  // A hole card turned over mid-hand should not wait on the opening stagger.
  const flipDelay = landed.current ? 0 : card.delay + FLIP_AFTER;

  return (
    <div
      ref={seatRef}
      style={{ width: Math.round(size * CARD_RATIO), height: size, position: "relative", perspective: 600 }}
    >
      {origin && (
        <motion.div
          initial={{ x: origin.x, y: origin.y, rotate: -9 }}
          animate={{ x: 0, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 30, delay: card.delay }}
          onAnimationComplete={() => {
            landed.current = true;
          }}
          style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: faceUp ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: faceUp ? flipDelay : 0 }}
            style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
          >
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>
              <CardBack size={size} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <CardFace card={card} size={size} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- controls ---- */

function RetroButton({
  children,
  onClick,
  disabled,
  accent,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: MONO,
        fontSize: 15,
        fontWeight: "bold",
        padding: "4px 12px",
        minWidth: 72,
        color: disabled ? "#808080" : "#000",
        backgroundColor: accent && !disabled ? "#ffd75e" : "#c0c0c0",
        border: "2px outset #c0c0c0",
        cursor: disabled ? "default" : "pointer",
        textShadow: disabled ? "1px 1px 0 #fff" : undefined,
        WebkitFontSmoothing: "none" as any,
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.border = "2px inset #c0c0c0";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.border = "2px outset #c0c0c0";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "2px outset #c0c0c0";
      }}
    >
      {children}
    </button>
  );
}

function Totem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "#9ef0a4", fontSize: 14 }}>{label}</span>
      <span
        style={{
          backgroundColor: "#000",
          color: "#ffd75e",
          border: "2px inset #557a55",
          padding: "0 8px",
          minWidth: 44,
          textAlign: "center",
          fontSize: 15,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- game ---- */

export default function BlackjackGame({ cardSize = 104 }: { cardSize?: number }) {
  // The shoe lives in a ref: hit(), doubleDown() and the dealer loop all need
  // the card they just drew in the same tick, and a state updater would not
  // have run yet. `shoeLeft` is the copy the counter renders from.
  const shoeRef = useRef<PlayingCard[]>([]);
  const [shoeLeft, setShoeLeft] = useState(0);
  const [player, setPlayer] = useState<PlayingCard[]>([]);
  const [dealer, setDealer] = useState<PlayingCard[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [holeRevealed, setHoleRevealed] = useState(false);
  const [credits, setCredits] = useState(STARTING_CREDITS);
  const [bet, setBet] = useState(50);
  const [message, setMessage] = useState("Place your bet, trainer.");
  const [size, setSize] = useState(cardSize);

  // The table is fixed-width by nature; shrink the cards rather than let a
  // seven-card hand run off a phone screen.
  useEffect(() => {
    const fit = () => setSize(window.innerWidth < 640 ? Math.round(cardSize * 0.72) : cardSize);
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [cardSize]);

  const deckRef = useRef<HTMLDivElement>(null);
  const dealTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (dealTimer.current !== null) window.clearTimeout(dealTimer.current);
  }, []);

  const playerValue = handValue(player);
  const dealerValue = handValue(dealer);
  const upCardValue = handValue(dealer.slice(0, 1));

  const settle = useCallback(
    (playerCards: PlayingCard[], dealerCards: PlayingCard[], wager: number) => {
      const p = handValue(playerCards).total;
      const d = handValue(dealerCards).total;
      const playerBJ = isBlackjack(playerCards);
      const dealerBJ = isBlackjack(dealerCards);

      let payout = 0;
      let text: string;

      if (p > 21) {
        text = `BUST at ${p}. The house takes it.`;
      } else if (playerBJ && !dealerBJ) {
        payout = Math.floor(wager * 2.5);
        text = `BLACKJACK! Pays 3:2 — +${payout - wager}.`;
      } else if (dealerBJ && !playerBJ) {
        text = "Dealer has blackjack. Tough luck.";
      } else if (d > 21) {
        payout = wager * 2;
        text = `Dealer busts at ${d}. You win ${wager}.`;
      } else if (p > d) {
        payout = wager * 2;
        text = `${p} beats ${d}. You win ${wager}.`;
      } else if (p < d) {
        text = `${d} beats ${p}. Dealer wins.`;
      } else {
        payout = wager;
        text = `Push at ${p}. Bet returned.`;
      }

      setCredits((c) => c + payout);
      setMessage(text);
      setHoleRevealed(true);
      setPhase("settled");
    },
    []
  );

  /** Takes the next card off the shoe, cutting a fresh one if it runs dry. */
  const drawCard = (delay = 0): PlayingCard => {
    if (shoeRef.current.length === 0) shoeRef.current = freshShoe();
    const card = shoeRef.current.shift()!;
    setShoeLeft(shoeRef.current.length);
    return { ...card, delay };
  };

  const deal = () => {
    if (phase !== "betting") return;
    if (bet <= 0 || bet > credits) return;

    if (shoeRef.current.length < RESHUFFLE_AT) shoeRef.current = freshShoe();

    // Dealt in table order: player, dealer, player, dealer hole card.
    const playerCards = [drawCard(0), drawCard(2 * DEAL_STAGGER)];
    const dealerCards = [drawCard(DEAL_STAGGER), drawCard(3 * DEAL_STAGGER)];

    setCredits((c) => c - bet);
    setPlayer(playerCards);
    setDealer(dealerCards);
    setHoleRevealed(false);
    setPhase("dealing");
    setMessage("Dealing...");

    dealTimer.current = window.setTimeout(() => {
      if (isBlackjack(playerCards) || isBlackjack(dealerCards)) {
        settle(playerCards, dealerCards, bet);
      } else {
        setPhase("player");
        setMessage("Hit or stand?");
      }
    }, (3 * DEAL_STAGGER + FLIP_AFTER + 0.45) * 1000);
  };

  const hit = () => {
    if (phase !== "player") return;
    const next = [...player, drawCard()];
    setPlayer(next);
    const total = handValue(next).total;
    if (total > 21) {
      settle(next, dealer, bet);
    } else if (total === 21) {
      setMessage("21! Standing pat.");
      setPhase("dealer");
      setHoleRevealed(true);
    } else {
      setMessage(`You have ${total}.`);
    }
  };

  const stand = () => {
    if (phase !== "player") return;
    setHoleRevealed(true);
    setPhase("dealer");
    setMessage("Dealer's turn.");
  };

  const doubleDown = () => {
    if (phase !== "player" || player.length !== 2 || credits < bet) return;
    const wager = bet * 2;
    setCredits((c) => c - bet);
    setBet(wager);
    const next = [...player, drawCard()];
    setPlayer(next);
    setMessage("Doubled down.");
    if (handValue(next).total > 21) {
      settle(next, dealer, wager);
    } else {
      setHoleRevealed(true);
      setPhase("dealer");
    }
  };

  // Dealer draws to 17, one card per beat, then the hand is scored.
  useEffect(() => {
    if (phase !== "dealer") return;
    const timer = window.setTimeout(() => {
      const total = handValue(dealer).total;
      if (total < 17) {
        const card = drawCard();
        setDealer((prev) => [...prev, card]);
      } else {
        settle(player, dealer, bet);
      }
    }, 750);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, dealer, player, bet, settle]);

  const clearTable = () => {
    setBet((b) => Math.min(b, credits));
    setPlayer([]);
    setDealer([]);
    setHoleRevealed(false);
    setPhase("betting");
    setMessage(credits > 0 ? "Place your bet, trainer." : "Out of credits. Grab a refill.");
  };

  const addChip = (amount: number) => {
    if (phase !== "betting") return;
    setBet((b) => Math.min(credits, b + amount));
  };

  const betting = phase === "betting";
  const acting = phase === "player";
  const canDouble = acting && player.length === 2 && credits >= bet;

  const hand = (cards: PlayingCard[], faceUpFor: (i: number) => boolean) => (
    <div style={{ display: "flex", gap: Math.round(size * 0.08), minHeight: size, alignItems: "center" }}>
      {cards.map((card, i) => (
        <CardView key={card.id} card={card} faceUp={faceUpFor(i)} size={size} deckRef={deckRef} />
      ))}
    </div>
  );

  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 16,
        fontWeight: "bold",
        WebkitFontSmoothing: "none" as any,
        MozOsxFontSmoothing: "unset" as any,
        backgroundColor: "#c0c0c0",
        border: "2px outset #c0c0c0",
        boxShadow:
          "inset -1px -1px 0px 0px #000000, inset 1px 1px 0px 0px #ffffff, inset -2px -2px 0px 0px #808080",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          backgroundColor: "#000080",
          color: "#fff",
          padding: "2px 6px",
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>BLACKJACK.EXE</span>
        <span style={{ fontSize: 13 }}>MASTER BALL TABLE</span>
      </div>

      <div style={{ padding: 8 }}>
        {/* Felt */}
        <div
          style={{
            position: "relative",
            backgroundColor: "#0f5132",
            backgroundImage: "radial-gradient(circle at 50% 30%, #17713f 0%, #0b3d26 100%)",
            border: "2px inset #c0c0c0",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: size * 3.1,
          }}
        >
          {/* Deck stack: also the measurement anchor every card springs from. */}
          <div
            ref={deckRef}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: Math.round(size * CARD_RATIO),
              height: size,
            }}
          >
            {[6, 3, 0].map((offset) => (
              <div key={offset} style={{ position: "absolute", top: offset, right: offset, width: "100%", height: "100%" }}>
                <CardBack size={size} />
              </div>
            ))}
            <span
              style={{
                position: "absolute",
                bottom: -20,
                right: 0,
                fontSize: 12,
                color: "#9ef0a4",
              }}
            >
              {shoeLeft} LEFT
            </span>
          </div>

          <Totem label="DEALER" value={dealer.length === 0 ? "--" : holeRevealed ? String(dealerValue.total) : `${upCardValue.total}+?`} />
          {hand(dealer, (i) => (i === 1 ? holeRevealed : true))}

          <div
            style={{
              backgroundColor: "rgba(0,0,0,0.55)",
              border: "1px solid #9ef0a4",
              color: "#ffd75e",
              padding: "2px 8px",
              fontSize: 15,
              alignSelf: "flex-start",
              maxWidth: "70%",
            }}
          >
            {message}
          </div>

          <Totem
            label="YOU"
            value={
              player.length === 0
                ? "--"
                : playerValue.soft && playerValue.total <= 21
                ? `${playerValue.total}s`
                : String(playerValue.total)
            }
          />
          {hand(player, () => true)}
        </div>

        {/* Controls */}
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            borderTop: "2px groove #fff",
            paddingTop: 8,
          }}
        >
          <span style={{ fontSize: 15 }}>
            CREDITS <span style={{ color: "#000080" }}>{credits}</span>
          </span>
          <span style={{ fontSize: 15 }}>
            BET <span style={{ color: "#a00" }}>{bet}</span>
          </span>

          {CHIPS.map((chip) => (
            <RetroButton key={chip} onClick={() => addChip(chip)} disabled={!betting || credits < bet + chip}>
              +{chip}
            </RetroButton>
          ))}
          <RetroButton onClick={() => setBet(0)} disabled={!betting || bet === 0}>
            CLEAR
          </RetroButton>

          <div style={{ flexBasis: "100%", height: 0 }} />

          {phase === "settled" ? (
            <RetroButton onClick={clearTable} accent>
              NEXT HAND
            </RetroButton>
          ) : (
            <RetroButton onClick={deal} disabled={!betting || bet <= 0 || bet > credits} accent>
              DEAL
            </RetroButton>
          )}
          <RetroButton onClick={hit} disabled={!acting}>
            HIT
          </RetroButton>
          <RetroButton onClick={stand} disabled={!acting}>
            STAND
          </RetroButton>
          <RetroButton onClick={doubleDown} disabled={!canDouble}>
            DOUBLE
          </RetroButton>
          {credits === 0 && phase !== "dealing" && phase !== "player" && phase !== "dealer" && (
            <RetroButton
              onClick={() => {
                setCredits(STARTING_CREDITS);
                setBet(50);
                setMessage("Refilled. Place your bet, trainer.");
              }}
            >
              REFILL
            </RetroButton>
          )}
        </div>

        <p style={{ marginTop: 8, fontSize: 13, color: "#333" }}>
          Dealer stands on 17 · Blackjack pays 3:2 · Double on the first two cards
        </p>
      </div>
    </div>
  );
}
