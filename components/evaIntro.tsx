"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { evaFontVars } from "./evaFonts";
import "./evaIntro.css";

// Evangelion-style boot sequence. Plays once per browser tab (sessionStorage);
// call replayEvaIntro() from anywhere to play it again.

const SEEN_KEY = "eva-boot-seen";
const REPLAY_EVENT = "eva-boot:replay";
const GIF_SPEED = 2; // playback rate for the sync-graph clip (original is 2.75s)

export function replayEvaIntro() {
  window.dispatchEvent(new Event(REPLAY_EVENT));
}

export default function EvangelionBoot() {
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // layout effect so a first visit shows the intro before the homepage is ever painted
  useLayoutEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    if (!seen) setPlaying(true);
    else document.documentElement.classList.remove("eva-boot-pending");

    const onReplay = () => setPlaying(true);
    window.addEventListener(REPLAY_EVENT, onReplay);
    return () => window.removeEventListener(REPLAY_EVENT, onReplay);
  }, []);

  useEffect(() => {
    if (!playing || !rootRef.current) return;
    return runBoot(rootRef.current, () => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}
      document.documentElement.classList.remove("eva-boot-pending");
      setPlaying(false);
    });
  }, [playing]);

  if (!playing) return null;

  return (
    <div ref={rootRef} className={`eva-boot ${evaFontVars}`} aria-hidden="true">
      <div className="corner tl">PTHAMBUNDIT.DEV // CENTRAL DOGMA</div>
      <div className="corner tr" data-eb="clock">T+00.00s</div>
      <div className="corner bl">EVA UNIT-02.6 / PILOT: P.THAMBUNDIT</div>
      <div className="corner br">第3新東京市</div>

      {/* terminal */}
      <div className="phase" id="eb-term">
        <div className="term" data-eb="term" />
        <div className="hexdump" data-eb="hexdump" />
        <div className="termload">
          <div className="row"><span>SYSTEM LOAD</span><span data-eb="loadval">000%</span></div>
          <div className="meterbar"><i data-eb="loadbar" /></div>
        </div>
      </div>

      {/* MAGI */}
      <div className="phase" id="eb-magi">
        <div className="magi">
          <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet">
            <g data-eb="magibg" />
            <rect className="line" x="20" y="30" width="180" height="62" rx="10" />
            <text className="jp" x="110" y="72" textAnchor="middle">提訴</text>
            <text className="lbl" x="22" y="132">CODE : 473</text>
            <text className="lbl" x="22" y="160">FILE : PORTFOLIO_SYS</text>
            <text className="lbl" x="22" y="188">EXTENSION : 0260</text>
            <text className="lbl" x="22" y="216">EX_MODE : OFF</text>
            <text className="lbl" x="22" y="244">PRIORITY : AAA</text>
            <rect className="line" x="800" y="30" width="180" height="62" rx="10" />
            <text className="jp" x="890" y="72" textAnchor="middle">決議</text>
            <rect className="line" id="eb-resbox" x="800" y="104" width="180" height="84" rx="10" />
            <text id="eb-result" x="890" y="162">審議中</text>
            <text className="lbl" x="980" y="218" textAnchor="end">DATA ANALYZED BY MAGI</text>
            <line className="bar" x1="500" y1="160" x2="270" y2="460" />
            <line className="bar" x1="500" y1="160" x2="730" y2="460" />
            <line className="bar" x1="270" y1="460" x2="730" y2="460" />
            <text className="title" x="500" y="398" textAnchor="middle">MAGI</text>
            <g className="blk" data-eb="balthasar">
              <polygon points="360,50 640,50 640,200 590,250 410,250 360,200" />
              <text className="nm" x="500" y="90">BALTHASAR · 2</text>
              <text className="vd" x="500" y="190">承認</text>
            </g>
            <g className="blk" data-eb="casper">
              <polygon points="110,330 370,330 430,390 430,590 110,590" />
              <text className="nm" x="270" y="374">CASPER · 3</text>
              <text className="vd" x="270" y="510">承認</text>
            </g>
            <g className="blk" data-eb="melchior">
              <polygon points="570,390 630,330 890,330 890,590 570,590" />
              <text className="nm" x="730" y="374">MELCHIOR · 1</text>
              <text className="vd" x="730" y="510">承認</text>
            </g>
            <rect className="line" x="20" y="632" width="330" height="44" rx="10" />
            <text className="lbl" x="34" y="662">SUBJECT : PORTFOLIO DEPLOYMENT</text>
            <rect className="line" x="365" y="632" width="270" height="44" rx="10" />
            <text className="lbl" x="500" y="662" textAnchor="middle">VOTE : MAJORITY REQUIRED</text>
            <rect className="line" x="650" y="632" width="330" height="44" rx="10" />
            <text className="lbl" x="966" y="662" textAnchor="end">S.C. MAGI SYSTEM</text>
          </svg>
        </div>
      </div>

      {/* sync graph (the original evawave.gif, re-encoded as video) */}
      <div className="phase" id="eb-sync">
        <div className="syncwrap">
          <video data-eb="wave" muted playsInline preload="auto">
            <source src="/images/evawave.webm" type="video/webm" />
            <source src="/images/evawave.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="synctag">SYNCHRO GRAPH<small>シンクロ率</small></div>
        <div className="syncdone" data-eb="syncdone">SYNCHRONIZED</div>
        <div className="synchud" data-eb="synchud">
          <div className="row"><span>PILOT: P.THAMBUNDIT</span><span data-eb="syncval">000.0%</span></div>
          <div className="meterbar"><i data-eb="syncbar" /></div>
        </div>
      </div>

      {/* berserk */}
      <div className="phase" id="eb-berserk">
        <svg className="psy" data-eb="psysvg" viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid meet" />
        <div className="psy-l"><div className="lbox">PSYCHOGRAPHIC DISPLAY</div><span className="lsub">Phase 4&nbsp;&nbsp;LINK A″</span></div>
        <div className="psy-r"><div className="lbox"><span>EVA-02.6 PILOT :</span><b>PETE THAMBUNDIT</b></div><span className="lsub">DATA ANALYZED BY CASPER</span></div>
        <div className="corrupt" data-eb="corrupt" />
        <div className="ber-over" data-eb="berover">
          <div className="ber-kanji">暴走</div>
          <div className="lbox red">SYNC RATIO : <span data-eb="berval">100.0%</span></div>
          <div className="lbox red">制御不能 — CONTROL LOST</div>
        </div>
      </div>

      {/* PATTERN BLUE: energy observational data, then the honeycomb */}
      <div className="phase" id="eb-blue">
        <div className="eo">
          <div className="eo-tl"><div className="lbox">ENERGY OBSERVATIONAL DATA</div></div>
          <div className="eo-tr">
            <div className="lbox" id="eb-bt">BLOOD TYPE : <span data-eb="btval">ANALYZING</span></div>
            <div className="lbox red sm">RADIOACTIVITY : NEGATIVE</div>
            <div className="lbox red sm">RADIANT HEAT : NEGATIVE</div>
          </div>
          <div className="eo-dash" style={{ top: "22vh" }} />
          <div className="eo-band"><svg data-eb="eosvg" viewBox="0 0 2560 360" preserveAspectRatio="none" /></div>
          <div className="eo-dash" style={{ top: "74vh" }} />
          <div className="eo-base" />
          <div className="botrow">
            <div className="lbox">HIGH LEVEL ENERGY FIELD APPROACHING</div>
            <div className="lbox">GENERATING POINT : SECTOR 06</div>
            <div className="lbox">OBSERVED BY MAGI</div>
          </div>
        </div>
        <div className="hexalert">
          <div className="bluehead lbox red">BLOOD TYPE : BLUE</div>
          <div className="honey" data-eb="honey" />
          <div className="bluesub">パターン<span>青</span>　使徒確認</div>
        </div>
      </div>

      {/* tactical map */}
      <div className="phase" id="eb-map">
        <div className="mapwrap">
          <div className="mapplane">
            <svg viewBox="0 0 1000 620" data-eb="mapsvg" />
            <div className="sweep" />
          </div>
        </div>
        <div className="ruler-l" />
        <div className="ruler-b" />
        <div className="map-tl"><div className="lbox">TACTICAL DISPLAY</div><span className="lsub">第3新東京市 作戦図 — SECTOR 06</span></div>
        <div className="mapinfo">
          <div className="lbox">TARGET : 使徒 / ANGEL</div>
          <div className="lbox red">DISTANCE : <span data-eb="mapdist">14.0 KM</span></div>
          <div className="lbox red">ETA : <span data-eb="mapeta">00:14</span></div>
          <div className="lbox red st">STATUS : APPROACHING</div>
        </div>
        <div className="botrow">
          <div className="lbox">INTERCEPT COURSE : CALCULATED</div>
          <div className="lbox">OBSERVED BY MAGI</div>
        </div>
      </div>

      {/* launch */}
      <div className="phase" id="eb-band">
        <div className="speed" data-eb="speed" />
        <div className="band">
          <div className="stripes" />
          <div className="msg small" data-eb="bandmsg" />
          <div className="stripes" />
        </div>
      </div>

      {/* rapid text cuts */}
      <div className="phase" id="eb-cuts"><div className="cut" data-eb="cut" /></div>

      {/* title card */}
      <div className="phase" id="eb-card">
        <div className="card" data-eb="card">
          <div className="ep">EPISODE:02.6</div>
          <div className="big">PETE</div>
          <div className="big">THAMBUNDIT</div>
          <div className="jp">ポートフォリオ、起動</div>
          <div className="en">PORTFOLIO, ONLINE</div>
        </div>
      </div>

      {/* text that is only injected later, laid out invisibly so its font files load up front */}
      <span className="warmup">逃げちゃダメだ I MUSTN&apos;T RUN AWAY. SO I BUILT THIS. 最終安全装置解除 発進 否定 可決</span>
      <div className="grain" />
      <div className="skip">CLICK TO SKIP</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animation engine: drives the overlay's DOM directly. Returns a cleanup.

type Done = () => void;
type Scene = { id: string; run: (done: Done) => void };

const BOOT_LINES: [string, string][] = [
  ["NERV OS v2.6 // TERMINAL DOGMA BIOS", "head"],
  ["(C) GEHIRN — AUTHORIZED PERSONNEL ONLY", "head"],
  ["BOOT SEQUENCE INITIATED", ""],
  ["CHECKING MEMORY ............... ", "640 PB OK"],
  ["LOADING KERNEL ................ ", "OK"],
  ["MOUNTING /dev/terminal_dogma .. ", "OK"],
  ["主電源接続 — MAIN POWER CONNECTED", "jp"],
  ["UMBILICAL CABLE ............... ", "CONNECTED"],
  ["LCL PRESSURE .................. ", "NOMINAL"],
  ["A10 NERVE CONNECTION .......... ", "OK"],
  ["LOADING PILOT PROFILE ......... ", "P.THAMBUNDIT"],
  ["POKEMON_PARTY.DAT ............. ", "6/6"],
  ["CAFFEINE RESERVES ............. ", "!LOW"],
  ["全システム正常 — ALL SYSTEMS NOMINAL", "jp"],
  ["CONNECTING TO MAGI ............ ", "..."],
];
const TERM_MS = 1900;

const CUTS: [string, string, number][] = [
  ["vert long", "<span>逃げちゃダメだ</span>", 200],
  ["vert long r inv", "<span>逃げちゃダメだ</span>", 200],
  ["vert long", "<span>逃げちゃダメだ</span>", 200],
  ["left", "<span>I MUSTN'T</span><span>RUN AWAY.</span>", 420],
  ["left inv", "<span>SO I</span><span>BUILT THIS.</span>", 520],
];

const SVGNS = "http://www.w3.org/2000/svg";
const pad = (n: number | string, l = 2) => String(n).padStart(l, "0");

function runBoot(root: HTMLElement, onDone: () => void): () => void {
  let timers: number[] = [];
  let running = true;
  let finished = false;

  const at = (ms: number, fn: () => void) => {
    timers.push(window.setTimeout(fn, ms));
  };
  // rAF loop that stops when the intro ends; return false to stop early.
  // performance.now() rather than the rAF timestamp, which can predate a start time taken in a timer
  const loop = (fn: (now: number) => boolean | void) => {
    const f = () => {
      if (running && fn(performance.now()) !== false) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };
  const q = <T extends Element = HTMLElement>(name: string) => root.querySelector(`[data-eb="${name}"]`) as T;
  const phases = Array.from(root.querySelectorAll<HTMLElement>(".phase"));
  const show = (id: string) => {
    phases.forEach((p) => p.classList.remove("on"));
    void root.offsetWidth; // restart CSS animations
    root.querySelector("#eb-" + id)?.classList.add("on");
    root.classList.toggle("no-grain", id === "sync");
  };
  const flicker = (ms = 400) => {
    root.classList.add("flicker");
    at(ms, () => root.classList.remove("flicker"));
  };
  const typeLine = (box: HTMLElement, text: string, status: string) => {
    const div = document.createElement("div");
    div.textContent = "> " + text;
    if (status === "jp" || status === "head") div.className = status;
    else if (status) {
      const s = document.createElement("span");
      s.className = status[0] === "!" ? "warn" : "ok";
      s.textContent = status.replace(/^!/, "");
      div.appendChild(s);
    }
    box.querySelector(".cursor")?.classList.remove("cursor");
    div.classList.add("cursor");
    box.appendChild(div);
  };
  const svg = (tag: string, attrs: Record<string, string | number>, parent: Element) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    parent.appendChild(e);
    return e;
  };

  // ---------- generated pieces ----------
  const honey = q("honey");
  honey.innerHTML = "";
  [5, 4].forEach((n, r) => {
    const row = document.createElement("div");
    row.className = "rw";
    for (let i = 0; i < n; i++) {
      const center = r === 0 && i === 2;
      const hx = document.createElement("div");
      hx.className = "hx" + (center ? " solid" : "");
      hx.style.setProperty("--d", (center ? 0 : 0.05 + Math.random() * 0.4).toFixed(2) + "s");
      hx.innerHTML = `<i>${center ? "使徒" : "EMERGENCY"}</i>`;
      row.appendChild(hx);
    }
    honey.appendChild(row);
  });

  const speed = q("speed");
  speed.innerHTML = "";
  for (let i = 0; i < 40; i++) {
    const l = document.createElement("i");
    l.style.cssText = `left:${Math.random() * 100}%;height:${20 + Math.random() * 40}vh;opacity:${0.3 + Math.random() * 0.7};width:${1 + Math.round(Math.random() * 2)}px;--t:${0.25 + Math.random() * 0.3}s;--d:-${Math.random()}s`;
    speed.appendChild(l);
  }

  const map = q<SVGSVGElement>("mapsvg");
  map.innerHTML = "";
  for (let x = 0; x <= 1000; x += 50) svg("line", { class: "grid", x1: x, y1: 0, x2: x, y2: 620 }, map);
  for (let y = 0; y <= 620; y += 50) svg("line", { class: "grid", x1: 0, y1: y, x2: 1000, y2: y }, map);
  svg("path", { class: "coast", d: "M0,520 C120,480 220,560 330,530 S540,590 650,545 S870,590 1000,530" }, map);
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 200;
    const w = 8 + Math.random() * 18, h = 8 + Math.random() * 18;
    svg("rect", { class: "bld", x: 500 + Math.cos(a) * r - w / 2, y: 320 + Math.sin(a) * r * 0.8 - h / 2, width: w, height: h }, map);
  }
  const cross = (x: number, y: number, r: number, parent: Element) => {
    svg("line", { class: "xh", x1: x - r, y1: y, x2: x + r, y2: y }, parent);
    svg("line", { class: "xh", x1: x, y1: y - r, x2: x, y2: y + r }, parent);
  };
  for (let x = 100; x < 1000; x += 100) for (let y = 100; y < 620; y += 100) cross(x, y, 7, map);
  [90, 170, 250].forEach((r, i) => svg("circle", { class: "ring" + (i === 1 ? " dash" : ""), cx: 500, cy: 320, r }, map));
  svg("polygon", { class: "hq", points: "500,306 514,320 500,334 486,320" }, map);
  svg("text", { x: 522, y: 314 }, map).textContent = "NERV HQ";
  const trail = svg("polyline", { class: "trail", points: "" }, map);
  const angel = svg("g", {}, map);
  svg("circle", { class: "angel-ring", r: 28 }, angel);
  svg("polygon", { class: "angel", points: "0,-16 14,10 -14,10" }, angel);
  svg("text", { x: 34, y: 6, style: "fill:#ff2a2a" }, angel).textContent = "ANGEL";

  // MAGI background: green verticals + crosshair grid, like the show's display screens
  const magibg = q<SVGGElement>("magibg");
  magibg.innerHTML = "";
  [300, 700].forEach((x) => svg("line", { class: "vr", x1: x, y1: 0, x2: x, y2: 620 }, magibg));
  for (let x = 100; x < 1000; x += 100) for (let y = 120; y < 620; y += 100) cross(x, y, 8, magibg);

  // psychographic display frame (berserk). x(v): -10..120 across, y(u): 0..12 up
  const psy = q<SVGSVGElement>("psysvg");
  psy.innerHTML = "";
  const px = (v: number) => 120 + v * 9.4, py = (u: number) => 663 - u * 53.6;
  [0, 30, 60, 90].forEach((v) => svg("line", { class: "vr", x1: px(v), y1: 0, x2: px(v), y2: 663 }, psy));
  for (let v = 15; v <= 120; v += 15) {
    for (let u = 1; u <= 11; u += 2) {
      if (v % 30 === 0) {
        svg("line", { class: "xh", x1: px(v) - 12, y1: py(u), x2: px(v) + 12, y2: py(u) }, psy);
        svg("line", { class: "xh", x1: px(v) - 6, y1: py(u) - 8, x2: px(v) - 6, y2: py(u) + 8 }, psy);
        svg("line", { class: "xh", x1: px(v) + 6, y1: py(u) - 8, x2: px(v) + 6, y2: py(u) + 8 }, psy);
      } else cross(px(v), py(u), 8, psy);
    }
  }
  svg("line", { class: "ax", x1: 26, y1: 0, x2: 26, y2: 668 }, psy);
  svg("line", { class: "ax", x1: 0, y1: 666, x2: 1280, y2: 666 }, psy);
  for (let u = 0; u <= 12.01; u += 0.25) svg("line", { class: "tk", x1: 26, y1: py(u), x2: u % 1 ? 34 : 40, y2: py(u) }, psy);
  for (let u = 1; u <= 12; u++) svg("text", { x: 46, y: py(u) + 8 }, psy).textContent = "+" + pad(u);
  for (let v = -10; v <= 120; v += 2) svg("line", { class: "tk", x1: px(v), y1: 666, x2: px(v), y2: v % 10 ? 674 : 682 }, psy);
  for (let v = -10; v <= 110; v += 10) svg("text", { x: px(v) - 14, y: 708 }, psy).textContent = (v < 0 ? "" : "+") + v;
  const traceEl = svg("polyline", { class: "trace", points: "" }, psy);
  // the trace: ramp up, a knot of loops, a jittery descent, low squiggles — then it blows off the scale
  const tracePts: string[] = [];
  const tp = (v: number, u: number) => tracePts.push(px(v).toFixed(1) + "," + py(u).toFixed(1));
  for (let v = 0; v <= 31; v += 0.5) tp(v, 11.6 * Math.pow(v / 31, 1.7));
  let cv = 44, cu = 6, ang = 0;
  for (let i = 0; i < 420; i++) {
    ang += 0.35 + Math.random() * 0.25;
    cv = Math.min(52, Math.max(40, cv + (Math.random() - 0.5) * 1.2));
    cu = Math.min(7.5, Math.max(4, cu + (Math.random() - 0.5) * 0.8));
    const rv = 4 + Math.random() * 7, ru = 1.5 + Math.random() * 3.6;
    tp(Math.min(60, Math.max(33, cv + rv * Math.cos(ang))), Math.min(11.2, Math.max(0.6, cu + ru * Math.sin(ang))));
  }
  for (let v = 60; v <= 90; v += 0.25) tp(v + Math.sin(v * 3) * 0.8, Math.max(0.4, 10.2 - ((v - 60) / 30) * 9.6 + Math.sin(v * 2.1) * Math.random() * 1.6));
  for (let v = 90; v <= 118; v += 0.3) tp(v, 0.35 + (Math.random() < 0.12 ? Math.random() * 1.8 : Math.random() * 0.4));
  for (let i = 0; i < 30; i++) tp(104 + Math.random() * 16, i % 2 ? 1 + Math.random() * 5 : 9 + Math.random() * 6.5); // spikes off the top of the scale

  // berserk corruption: chunky red blocks clustered like broken video
  const corrupt = q("corrupt");
  corrupt.innerHTML = "";
  const REDS = ["#5a0000", "#8f0000", "#c40d0d", "#e81b1b", "#ff3b3b"];
  for (let c = 0; c < 4; c++) {
    const ccx = Math.random() * 100, ccy = Math.random() * 100;
    for (let i = 0; i < 38; i++) {
      const b = document.createElement("i");
      const w = 2.5 * (1 + Math.floor(Math.random() * 4)), h = 4 * (1 + Math.floor(Math.random() * 3));
      const x = Math.round((ccx + (Math.random() - 0.5) * 46) / 2.5) * 2.5, y = Math.round((ccy + (Math.random() - 0.5) * 60) / 4) * 4;
      b.style.cssText = `left:${x}%;top:${y}%;width:${w}%;height:${h}%;--c:${REDS[Math.floor(Math.random() * REDS.length)]}`;
      corrupt.appendChild(b);
    }
  }
  const blocks = Array.from(corrupt.children);

  // energy observational data: stepped green sawtooth + orange slab stacks, two periods for a seamless scroll
  const eo = q<SVGSVGElement>("eosvg");
  eo.innerHTML = "";
  const defs = svg("defs", {}, eo);
  const grad = svg("linearGradient", { id: "eb-eograd", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [["0%", "#d9ff8c"], ["35%", "#5fe37f"], ["100%", "#0aa58a"]].forEach(([o, c]) => svg("stop", { offset: o, "stop-color": c }, grad));
  const steps = Array.from({ length: 20 }, (_, i) => 130 + 150 * ((i % 10) / 9) + Math.random() * 24);
  let poly = "0,360";
  for (let per = 0; per < 2; per++) steps.forEach((h, i) => {
    const x = per * 1280 + i * 64;
    poly += ` ${x},${360 - h} ${x + 64},${360 - h}`;
  });
  svg("polygon", { points: poly + " 2560,360", fill: "url(#eb-eograd)" }, eo);
  for (let per = 0; per < 4; per++) {
    const x0 = per * 640 + 20;
    for (let j = 0; j < 9; j++) {
      const x = x0 + j * 15, y = 335 - j * 28;
      svg("polygon", { points: `${x},${y} ${x + 70},${y} ${x + 56},${y + 20} ${x - 14},${y + 20}`, fill: "#ff9a1a", stroke: "#000", "stroke-width": 3 }, eo);
    }
  }

  const wave = q<HTMLVideoElement>("wave");

  // ---------- scenes ----------
  function sTerm(done: Done) {
    const term = q("term"), dump = q("hexdump");
    term.innerHTML = "";
    dump.textContent = "";
    flicker(500);
    BOOT_LINES.forEach(([t, s], i) => at(80 + i * 100, () => typeLine(term, t, s)));
    // right column: memory dump streaming past, plus the load bar along the bottom
    const hex = () => Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, "0");
    const lines: string[] = [];
    let addr = 0x7fa000, last = 0;
    const start = performance.now();
    loop((now) => {
      if (now - last > 35) {
        last = now;
        addr += 16;
        lines.push("0x" + addr.toString(16).toUpperCase() + "  " + Array.from({ length: 8 }, hex).join(" "));
        if (lines.length > 48) lines.shift();
        dump.textContent = lines.join("\n");
      }
      const k = Math.min(1, (now - start) / (TERM_MS - 200));
      q("loadbar").style.width = k * 100 + "%";
      q("loadval").textContent = pad(Math.round(k * 100), 3) + "%";
      if (now - start > TERM_MS) return false;
    });
    at(TERM_MS, done);
  }

  function sMagi(done: Done) {
    const result = root.querySelector("#eb-result") as SVGTextElement;
    const blk = (name: string, state: string, text?: string) => {
      const g = q<SVGGElement>(name);
      g.setAttribute("class", "blk " + state);
      if (text) g.querySelector(".vd")!.textContent = text;
    };
    ["balthasar", "casper", "melchior"].forEach((n) => blk(n, "think", "承認"));
    const resbox = root.querySelector("#eb-resbox") as SVGRectElement;
    result.textContent = "審議中";
    result.setAttribute("class", "pending");
    resbox.setAttribute("class", "line");
    // CASPER stalls, rejects, then flips — she always hesitates
    at(400, () => blk("melchior", "yes"));
    at(650, () => blk("balthasar", "yes"));
    at(900, () => blk("casper", "no", "否定"));
    at(1180, () => blk("casper", "yes", "承認"));
    at(1300, () => {
      result.textContent = "可決";
      result.setAttribute("class", "done");
      resbox.setAttribute("class", "line done");
    });
    at(1700, done);
  }

  function sSync(done: Done) {
    const hud = q("synchud"), banner = q("syncdone");
    hud.classList.remove("done");
    banner.classList.remove("show");
    wave.currentTime = 0;
    wave.defaultPlaybackRate = wave.playbackRate = GIF_SPEED;
    wave.play().catch(() => {});
    const clipMs = 2750 / GIF_SPEED, start = performance.now();
    // the ratio follows the clip's progress (or the clock, if the video isn't playing)
    loop((now) => {
      const k = wave.duration && !wave.paused ? Math.min(1, wave.currentTime / wave.duration) : Math.min(1, (now - start) / clipMs);
      const v = k >= 1 ? 100 : Math.min(99.9, 100 * (1 - Math.pow(1 - k, 2.2)) + Math.random() * 2.5);
      q("syncbar").style.width = v + "%";
      q("syncval").textContent = pad(v.toFixed(1), 5) + "%";
      if (k >= 1) {
        hud.classList.add("done");
        banner.classList.add("show");
        return false;
      }
    });
    at(clipMs + 450, done);
  }

  function sBerserk(done: Done) {
    const scene = root.querySelector("#eb-berserk") as HTMLElement, over = q("berover"), val = q("berval");
    scene.classList.remove("crit");
    over.classList.remove("on");
    blocks.forEach((b) => b.classList.remove("on"));
    traceEl.setAttribute("points", "");
    // 1) the psychographic trace draws itself, then runs off the scale
    const start = performance.now(), dur = 950;
    loop((now) => {
      const k = Math.min(1, (now - start) / dur);
      traceEl.setAttribute("points", tracePts.slice(0, Math.max(2, Math.round(tracePts.length * k))).join(" "));
      if (k >= 1) return false;
    });
    // 2) the picture corrupts into red blocks, 暴走 cuts in
    at(950, () => {
      scene.classList.add("crit");
      flicker(300);
      const cStart = performance.now();
      loop((now) => {
        if (!scene.classList.contains("on")) return false;
        blocks.forEach((b) => {
          if (Math.random() < 0.14) b.classList.toggle("on", Math.random() < 0.5 + (now - cStart) / 1400);
        });
      });
    });
    at(1150, () => {
      over.classList.add("on");
      const vStart = performance.now();
      loop((now) => {
        const k = Math.min(1, (now - vStart) / 400);
        const v = 100 + 300 * k * k + (k < 1 ? Math.random() * 40 : 0);
        val.textContent = k < 1 && Math.random() < 0.25 ? "#" + Math.random().toString(16).slice(2, 7).toUpperCase() : v.toFixed(1) + "%";
        if (k >= 1) {
          val.textContent = "400.0%";
          return false;
        }
      });
    });
    at(1700, done);
  }

  function sBlue(done: Done) {
    const scene = root.querySelector("#eb-blue") as HTMLElement;
    const bt = root.querySelector("#eb-bt") as HTMLElement, btval = q("btval");
    scene.className = "phase on a";
    btval.textContent = "ANALYZING";
    bt.className = "lbox";
    // the energy readout identifies the blood type, then cut to the honeycomb alert
    at(600, () => {
      btval.textContent = "BLUE";
      bt.className = "lbox red blue";
      root.classList.add("alert");
    });
    at(900, () => {
      void scene.offsetWidth;
      scene.className = "phase on b";
      flicker(400);
    });
    at(2000, () => {
      root.classList.remove("alert");
      done();
    });
  }

  function sMap(done: Done) {
    const start = performance.now(), dur = 1300;
    const P0 = [960, 70], P1 = [760, 60], P2 = [565, 285]; // quadratic curve toward HQ
    const pts: string[] = [];
    loop((now) => {
      const t = Math.min(1, (now - start) / dur), u = 1 - t;
      const x = u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0];
      const y = u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1];
      angel.setAttribute("transform", `translate(${x.toFixed(1)},${y.toFixed(1)})`);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      trail.setAttribute("points", pts.join(" "));
      q("mapdist").textContent = (14 - 12.8 * t).toFixed(1) + " KM";
      q("mapeta").textContent = "00:" + pad(Math.max(1, Math.round(14 - 13 * t)));
      if (t >= 1) return false;
    });
    at(1600, done);
  }

  function sLaunch(done: Done) {
    const band = root.querySelector("#eb-band") as HTMLElement, msg = q("bandmsg");
    band.classList.remove("go");
    msg.innerHTML = '<span>SAFETY LOCKS RELEASED</span><span class="j">最終安全装置解除</span>';
    msg.classList.add("small");
    at(450, () => {
      msg.innerHTML = '<span>LAUNCH</span><span class="j">発進</span>';
      msg.classList.remove("small");
      band.classList.add("go");
      flicker(400);
    });
    at(1200, done);
  }

  function sCuts(done: Done) {
    const cut = q("cut");
    let t = 0;
    CUTS.forEach(([cls, html, ms]) => {
      at(t, () => {
        cut.className = "cut " + cls;
        cut.innerHTML = html;
      });
      t += ms;
    });
    at(t, done);
  }

  function sCard(done: Done) {
    const parts = Array.from(q("card").children);
    parts.forEach((p) => p.classList.remove("show"));
    [50, 350, 550, 950, 1250].forEach((t, i) => at(t, () => parts[i].classList.add("show")));
    at(2500, done);
  }

  const SCENES: Scene[] = [
    { id: "term", run: sTerm },
    { id: "magi", run: sMagi },
    { id: "sync", run: sSync },
    { id: "berserk", run: sBerserk },
    { id: "blue", run: sBlue },
    { id: "map", run: sMap },
    { id: "band", run: sLaunch },
    { id: "cuts", run: sCuts },
    { id: "card", run: sCard },
  ];

  // ---------- runner ----------
  function finish() {
    if (finished) return;
    finished = true;
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
    wave.pause();
    root.classList.add("out");
    at(750, onDone); // after the fade
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
      e.preventDefault();
      finish();
    }
  };
  root.addEventListener("click", finish);
  window.addEventListener("keydown", onKey);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show("card");
    Array.from(q("card").children).forEach((p) => p.classList.add("show"));
    at(1400, finish);
  } else {
    const clock = q("clock");
    const t0 = performance.now();
    loop((now) => {
      clock.textContent = "T+" + pad(((now - t0) / 1000).toFixed(2), 5) + "s";
    });
    let i = 0;
    const next = () => {
      if (i >= SCENES.length) return finish();
      const s = SCENES[i++];
      show(s.id);
      s.run(next);
    };
    next();
  }

  return () => {
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
    root.removeEventListener("click", finish);
    window.removeEventListener("keydown", onKey);
    wave.pause();
  };
}
