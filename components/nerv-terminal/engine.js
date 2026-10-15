// NERV terminal engine. Drives the markup rendered by NervTerminal.tsx directly.
// startTerminal(root, actions) returns a cleanup; everything it starts is stopped there.
//
// actions: { launched, go(path), openChat(), replayIntro(), toggleTheme() => "light" | "dark" }

const PAGES = {
  home: { ep: "01", jp: "ホーム", img: "lucario" },
  projects: { ep: "02", jp: "プロジェクト", img: "umbreon" },
  skills: { ep: "03", jp: "スキル", img: "greninja" },
  contact: { ep: "04", jp: "連絡先", img: "beldum" },
  about: { ep: "05", jp: "自己紹介", img: "machamp" },
};
const LINKS = {
  github: "https://github.com/peteteaa",
  linkedin: "https://www.linkedin.com/in/pete-thambundit-91b740324/",
  instagram: "https://www.instagram.com/pete_teaa/",
  email: "mailto:pthambundit@icloud.com",
};
// taken from the real /projects and /skills pages
const PROJECTS = [
  ["Mahjong", "3D mahjong game built with Three.js, React, and TypeScript, featuring realistic tile physics and multiplayer support."],
  ["LaunchPad", "Uses AI to turn GitHub repos into onboarding videos, built with Gemini, Tavus, GitHub API, Node.js, Python, and TSX."],
  ["LoveBubbles", "A Valentine's-themed collage generator with a Python backend, JS frontend, and Black Forest Labs' Flux 1.1 Ultra model."],
  ["LeetRizz", "A LeetCode-style game built with TSX and a Python backend that rates a user's 'rizz', or charisma."],
  ["Course Planner", "A tool to help students plan their course schedule efficiently."],
];
const SKILLS = [
  ["Languages", "JavaScript, TypeScript, Python, Java, C, Golang"],
  ["Frontend", "React, Next.js, Tailwind CSS"],
  ["Backend", "Node.js, Express, Django, Firebase, MongoDB, PostgreSQL"],
  ["Tools", "Git, Docker, AWS, Figma, Unity"],
];
const PARTY = ["jolteon", "umbreon", "eevee", "leafeon", "spoink"];
const COMMANDS = ["help", "ls", "cd", "pwd", "whoami", "neofetch", "open", "chat", "blackjack", "intro", "theme", "clear", "echo", "date", "history", "pokemon", "stack", "split", "sudo", "exit"];
const IMG = "/images/";

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const pad2 = (n) => String(n).padStart(2, "0");

export function startTerminal(root, actions) {
  const $ = (id) => root.querySelector("#" + id);
  const out = $("nt-out"), scroll = $("nt-scroll"), input = $("nt-cmd"), typedEl = $("nt-typed"), pline = $("nt-pline");
  const panes = $("nt-panes"), pinnedEl = $("nt-pinned"), bootlog = $("nt-bootlog"), screen = $("nt-screen");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const t0 = Date.now();

  // ---------- lifecycle: everything started here is stopped by the returned cleanup ----------
  let alive = true;
  const intervals = [], listeners = [];
  const every = (fn, ms) => intervals.push(window.setInterval(fn, ms));
  const on = (el, type, fn) => { el.addEventListener(type, fn); listeners.push([el, type, fn]); };
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));

  // a re-run on the same DOM (React dev remounts) starts from a clean screen
  [out, bootlog, pinnedEl, $("nt-honey"), $("nt-wins")].forEach((el) => { el.innerHTML = ""; });
  panes.classList.remove("stack", "split", "booting", "away");
  scroll.insertBefore(pinnedEl, scroll.firstChild);

  let cwd = "home", busy = false, layout = "inline";
  const cmdHistory = []; let hIdx = 0;

  // ---------- output helpers ----------
  const toBottom = () => { scroll.scrollTop = scroll.scrollHeight; };
  let sink = null; // when set, print() writes there instead of the scrollback
  const print = (html = "", cls = "") => {
    const d = document.createElement("div");
    if (!alive) return d; // a stopped run keeps going in the background; let it write nowhere
    d.className = "line " + cls; d.innerHTML = html;
    (sink || out).appendChild(d);
    if (!sink) toBottom();
    return d;
  };
  const ps1 = () => `<span class="ps1"><span class="u">pete@central-dogma</span>:<span class="p">${cwd === "home" ? "~" : "~/" + cwd}</span>$</span>`;
  const setPrompt = () => { $("nt-ps1").innerHTML = ps1(); renderWins(); };
  const cols = () => { const cw = $("nt-measure").getBoundingClientRect().width / 10 || 8; return Math.max(30, Math.floor((scroll.clientWidth - 30) / cw)); };
  const wrap = (text, w) => { const words = text.split(" "), lines = []; let cur = ""; for (const wd of words) { if ((cur + " " + wd).trim().length > w) { lines.push(cur); cur = wd; } else cur = (cur + " " + wd).trim(); } if (cur) lines.push(cur); return lines; };
  // box-drawing frame. rows: string | {t, cls, cmd, href}. Plain ASCII only inside (CJK is double-width and breaks the right edge)
  function box(title, rows) {
    const w = Math.min(76, cols());
    const top = "┌─ " + title + " " + "─".repeat(Math.max(0, w - title.length - 5)) + "┐";
    let html = esc(top) + "\n";
    for (const r of rows) {
      const row = typeof r === "string" ? { t: r } : r;
      for (const piece of row.t === "" ? [""] : wrap(row.t, w - 4)) {
        let inner = esc(piece.padEnd(w - 4));
        if (row.cls) inner = `<span class="${row.cls}">${inner}</span>`;
        if (row.cmd) inner = `<span class="click" data-cmd="${esc(row.cmd)}" tabindex="0">${inner}</span>`;
        if (row.href) inner = `<a class="click" href="${row.href}" target="_blank" rel="noopener">${inner}</a>`;
        html += "│ " + inner + " │\n";
      }
    }
    html += esc("└" + "─".repeat(w - 2) + "┘");
    return print(html, "box");
  }

  // ---------- the input line ----------
  const syncTyped = () => { typedEl.textContent = input.value; toBottom(); };
  const setBusy = (b) => { busy = b; pline.classList.toggle("busy", b); input.readOnly = b; };
  // types a command into the prompt as if someone were typing it, then runs it
  async function typeCmd(cmd) {
    if (busy || !alive) return;
    setBusy(true);
    input.value = "";
    for (const ch of cmd) { input.value += ch; syncTyped(); await wait(30 + Math.random() * 35); }
    await wait(120);
    await submit();
  }
  async function submit() {
    const line = input.value;
    input.value = ""; syncTyped();
    print(ps1() + " " + `<span class="hi">${esc(line)}</span>`);
    if (line.trim()) { cmdHistory.push(line); hIdx = cmdHistory.length; }
    setBusy(true);
    try { await exec(line.trim()); } finally { if (alive) { setBusy(false); setPrompt(); toBottom(); } }
  }

  // ---------- commands ----------
  async function exec(line) {
    if (!line) return;
    const [cmd, ...args] = line.split(/\s+/);
    switch (cmd.toLowerCase()) {
      case "help":
        box("HELP", [
          "ls                 list this directory",
          "cd <page>          go to a page (projects, skills, contact, about, ~)",
          "pwd / whoami       where you are / who I am",
          "neofetch           system info",
          "open <link>        github, linkedin, instagram, email",
          "chat / blackjack   open the chatroom / play blackjack",
          "intro              replay the boot sequence",
          "theme              switch the main site between dark and light",
          "pokemon            catch something",
          "history / clear    command history / clear the screen",
          "stack · split      pin neofetch + ls to the top / beside (again to undo)",
          "exit               back to the main site",
          "",
          { t: "TAB completes, UP/DOWN walks history. You can also just click things.", cls: "dim" },
        ]);
        break;
      case "ls": printLs(); break;
      case "cd": await cd(args[0]); break;
      case "pwd": print("/central-dogma" + (cwd === "home" ? "" : "/" + cwd)); break;
      case "whoami":
        print('<span class="hi">Pete Thambundit</span>');
        print("Developer Advocate · CS Student · Pokémon Trainer");
        break;
      case "neofetch": neofetch(); break;
      case "open": {
        const k = (args[0] || "").toLowerCase();
        if (LINKS[k]) { print(`opening ${esc(k)} ... <span class="ok">OK</span>`); window.open(LINKS[k], "_blank", "noopener"); }
        else print(`<span class="err">open: unknown target '${esc(args[0] || "")}'.</span> try: ${Object.keys(LINKS).join(", ")}`);
        break;
      }
      case "chat":
        print('opening chatroom.sh on the surface ... <span class="ok">OK</span>');
        await wait(500);
        actions.openChat();
        break;
      case "blackjack":
        print('launching blackjack.exe ... <span class="ok">OK</span>');
        await wait(500);
        actions.go("/blackjack");
        break;
      case "intro":
        print('replaying intro.mp4 ... <span class="ok">OK</span>');
        await wait(500);
        actions.replayIntro();
        break;
      case "theme": {
        const now = actions.toggleTheme();
        print(now === "light" ? "theme: main site switched to light (Pokémon beach). the terminal stays NERV." : "theme: main site switched to dark.");
        break;
      }
      case "clear": out.innerHTML = ""; bootlog.innerHTML = ""; break;
      case "stack": case "split": {
        const want = layout === cmd ? "inline" : cmd;
        if (want === "split" && window.innerWidth <= 900) { print('<span class="dim">screen too narrow to split — try <span class="click" data-cmd="stack" tabindex="0">stack</span>.</span>'); break; }
        setLayout(want);
        print(want === "inline" ? "layout: header back in the scrollback" : want === "stack" ? "layout: header pinned to the top" : "layout: header pinned beside the terminal");
        break;
      }
      case "echo": print(esc(args.join(" "))); break;
      case "date": print(esc(new Date().toString())); break;
      case "history": cmdHistory.forEach((h, i) => print(`${String(i + 1).padStart(4)}  ${esc(h)}`)); break;
      case "pokemon": {
        const p = PARTY[Math.floor(Math.random() * PARTY.length)];
        nextRunner = p;
        print(`A wild <span class="hi">${p.toUpperCase()}</span> appeared! <img class="amb" src="${IMG}${p}-run.gif" alt="" /> it will run past on the status line next.`);
        break;
      }
      case "sudo": print('<span class="err">pete is not in the sudoers file. This incident will be reported to MAGI.</span>'); break;
      case "exit":
        print('There is no exit. <span class="jp">逃げちゃダメだ</span>');
        await wait(900);
        print('<span class="dim">...fine. returning to the surface.</span>');
        await wait(700);
        actions.go("/");
        break;
      default:
        print(`<span class="err">magi-sh: command not found: ${esc(cmd)}</span>`);
        print('<span class="dim">type <span class="click" data-cmd="help" tabindex="0">help</span> for a list of commands</span>');
    }
  }

  function printLs() {
    print(`<span class="dim">total ${Object.keys(PAGES).length + 6}</span>`);
    for (const [name, p] of Object.entries(PAGES)) {
      if (name === "home") continue;
      print(`<span class="click" data-cmd="cd ${name}" tabindex="0">drwxr-xr-x  pete  ${p.ep}  <img class="amb" src="${IMG}${p.img}.png" alt="" /> <span class="hi">${(name + "/").padEnd(10)}</span> <span class="jp">${p.jp}</span></span>`);
    }
    const files = [
      ["-rwxr-xr-x", "blackjack.exe", "blackjack", "masterball-new"],
      ["-rwxr-xr-x", "chatroom.sh", "chat", "pokeball"],
      ["-rw-r--r--", "intro.mp4", "intro", ""],
      ["lrwxrwxrwx", "github.lnk", "open github", "github-icon"],
      ["lrwxrwxrwx", "linkedin.lnk", "open linkedin", "linkedin-icon"],
      ["lrwxrwxrwx", "instagram.lnk", "open instagram", "instagram-icon"],
    ];
    for (const [perm, f, c, img] of files) {
      const icon = img ? `<img class="amb" src="${IMG}${img}.png" alt="" />` : `<span style="display:inline-block;width:1.35em">▶</span>`;
      print(`<span class="click" data-cmd="${c}" tabindex="0">${perm}  pete  --  ${icon} ${f}</span>`);
    }
  }

  function neofetch() {
    const up = Math.round((Date.now() - t0) / 1000);
    const ball = [
      ["r", "     ____________     "],
      ["r", "   /              \\   "],
      ["r", "  /                \\  "],
      ["w", " |--------( )-------| "],
      ["w", "  \\                /  "],
      ["w", "   \\______________/   "],
    ].map(([c, s]) => `<span class="${c}">${esc(s)}</span>`).join("\n");
    const info = [
      '<span class="ok">pete@central-dogma</span>',
      "------------------",
      '<span class="hi">OS</span>        NERV-OS 2.6 (MAGI build)',
      '<span class="hi">Host</span>      pthambundit.dev',
      '<span class="hi">Kernel</span>    next 15.2',
      `<span class="hi">Uptime</span>    <span class="upt">${Math.floor(up / 60)}m ${up % 60}s</span>`,
      '<span class="hi">Shell</span>     magi-sh',
      '<span class="hi">Theme</span>     NERV amber phosphor',
      '<span class="hi">Party</span>     6/6 Pokémon',
      '<span class="hi">Caffeine</span>  <span class="err">LOW</span>',
      "",
      '<span class="swatch"><i style="background:#ff8a1f;color:#ff8a1f"></i><i style="background:#ff2a2a;color:#ff2a2a"></i><i style="background:#39ff8a;color:#39ff8a"></i><i style="background:#57e39b;color:#57e39b"></i><i style="background:#ffe9cf;color:#ffe9cf"></i></span>',
    ].join("\n");
    print(`<div class="neo"><pre class="ball">${ball}</pre><pre>${info}</pre></div>`);
  }

  // ---------- pages ----------
  function titleCard(page) {
    return new Promise((resolve) => {
      const p = PAGES[page];
      if (reduce) return resolve();
      const card = $("nt-tcard"), parts = [$("nt-tcep"), $("nt-tcbig"), $("nt-tcjp")];
      parts[0].textContent = "EPISODE:" + p.ep; parts[1].textContent = page.toUpperCase(); parts[2].textContent = p.jp;
      parts.forEach((x) => x.classList.remove("show"));
      card.classList.add("on");
      [30, 200, 380].forEach((t, i) => setTimeout(() => parts[i].classList.add("show"), t));
      setTimeout(() => { card.classList.remove("on"); resolve(); }, 900);
    });
  }
  async function cd(arg) {
    let t = (arg || "~").toLowerCase().replace(/^~\/?/, "").replace(/^\/central-dogma\/?/, "").replace(/\/+$/, "");
    if (t === "" || t === ".." || t === "/" || t === "home") t = "home";
    if (t === ".") return;
    if (!PAGES[t]) {
      print(`<span class="err">cd: ${esc(arg)}: No such file or directory</span>`);
      await patternBlue(arg);
      return;
    }
    await titleCard(t);
    if (!alive) return;
    cwd = t;
    // neofetch + ls belong to home only
    panes.classList.toggle("away", t !== "home");
    out.innerHTML = "";
    renderPage(t);
  }
  function renderPage(page) {
    setPrompt();
    if (page === "home") { print('<span class="dim">back at ~</span>'); return; }
    if (page === "projects") {
      box("PROJECTS", PROJECTS.flatMap(([n, d], i) => [{ t: `[${pad2(i + 1)}] ${n}`, cls: "hi" }, d, ""]).slice(0, -1));
    } else if (page === "skills") {
      box("SKILLS", SKILLS.flatMap(([c, s]) => [{ t: c.toUpperCase(), cls: "hi" }, s, ""]).slice(0, -1));
    } else if (page === "contact") {
      box("CONTACT", [
        { t: "EMAIL       pthambundit@icloud.com", href: LINKS.email },
        { t: "GITHUB      github.com/peteteaa", href: LINKS.github },
        { t: "LINKEDIN    linkedin.com/in/pete-thambundit", href: LINKS.linkedin },
        { t: "INSTAGRAM   instagram.com/pete_teaa", href: LINKS.instagram },
      ]);
    } else if (page === "about") {
      box("ABOUT", [
        { t: "PETE THAMBUNDIT", cls: "hi" },
        "Developer Advocate · CS Student · Pokemon Trainer",
        "",
        "I'm a Computer Science major specializing in web development.",
      ]);
    }
    print(`<span class="dim">type <span class="click" data-cmd="cd ~" tabindex="0">cd ~</span> to return, or <span class="click" data-cmd="ls" tabindex="0">ls</span> to look around.</span>`);
  }
  function motd() {
    print('<span class="hi">NERV-OS 2.6</span> tty1 — <span class="jp">第3新東京市</span> central dogma');
    print("I'm a Computer Science major specializing in web development. Explore my projects and skills from here.");
    print('<span class="dim">type <span class="click" data-cmd="help" tabindex="0">help</span> for commands, or click anything below.</span>');
    print("");
  }
  async function patternBlue(path) {
    const b = $("nt-blue");
    $("nt-bluepath").textContent = path;
    b.classList.remove("on"); void b.offsetWidth; b.classList.add("on");
    await wait(1900);
    b.classList.remove("on");
    print('<span class="err">PATTERN BLUE</span> repelled. still in ' + (cwd === "home" ? "~" : "~/" + cwd) + ".");
  }
  // honeycomb for the 404
  [5, 4].forEach((n, r) => {
    const row = document.createElement("div"); row.className = "rw";
    for (let i = 0; i < n; i++) {
      const center = r === 0 && i === 2;
      const hx = document.createElement("div");
      hx.className = "hx" + (center ? " solid" : "");
      hx.style.setProperty("--d", (center ? 0 : Math.random() * 0.4).toFixed(2) + "s");
      hx.innerHTML = `<i>${center ? "404" : "EMERGENCY"}</i>`;
      row.appendChild(hx);
    }
    $("nt-honey").appendChild(row);
  });

  // ---------- status line ----------
  function renderWins() {
    const w = $("nt-wins"); w.innerHTML = "";
    Object.keys(PAGES).forEach((name, i) => {
      const b = document.createElement("button");
      b.className = name === cwd ? "cur" : "";
      b.innerHTML = `${i}<span>:${name}</span>`;
      b.title = "cd " + name;
      b.onclick = (e) => { e.stopPropagation(); if (name !== cwd) typeCmd(name === "home" ? "cd ~" : "cd " + name); };
      w.appendChild(b);
    });
  }
  const tick = () => { const d = new Date(); $("nt-clock").textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`; };
  tick(); every(tick, 1000);
  let nextRunner = null, rx = -60;
  const track = $("nt-track"), runner = $("nt-runner");
  const run = () => {
    if (!alive) return;
    rx += 1.6;
    if (rx > track.clientWidth + 10) {
      rx = -60;
      const p = nextRunner || PARTY[Math.floor(Math.random() * PARTY.length)];
      nextRunner = null;
      runner.src = `${IMG}${p}-run.gif`;
    }
    runner.style.transform = `translateX(${rx}px)`;
    requestAnimationFrame(run);
  };
  if (!reduce) requestAnimationFrame(run); else runner.style.transform = "translateX(20px)";

  // ---------- input wiring ----------
  on(input, "input", syncTyped);
  on(input, "keydown", (e) => {
    if (busy) { e.preventDefault(); return; }
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (hIdx > 0) { input.value = cmdHistory[--hIdx]; syncTyped(); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); hIdx = Math.min(cmdHistory.length, hIdx + 1); input.value = cmdHistory[hIdx] || ""; syncTyped(); }
    else if (e.key === "Tab") { e.preventDefault(); complete(); }
    else if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") e.preventDefault(); // cursor always sits at the end
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
  });
  function complete() {
    const v = input.value, parts = v.split(/\s+/);
    let pool;
    const last = parts[parts.length - 1].toLowerCase();
    if (parts.length === 1) pool = COMMANDS;
    else if (parts[0] === "cd") pool = Object.keys(PAGES).filter((p) => p !== "home");
    else if (parts[0] === "open") pool = Object.keys(LINKS);
    else return;
    const hits = pool.filter((c) => c.startsWith(last));
    if (hits.length === 1) { parts[parts.length - 1] = hits[0]; input.value = parts.join(" ") + " "; syncTyped(); }
    else if (hits.length > 1) { print(ps1() + " " + esc(v)); print(hits.join("    ")); }
  }
  // clicking anywhere on the glass focuses the prompt; clickable output types its command
  on(screen, "click", (e) => {
    const c = e.target.closest("[data-cmd]");
    if (c) { e.preventDefault(); typeCmd(c.dataset.cmd); }
    if (!e.target.closest("a") && !window.getSelection().toString()) input.focus({ preventScroll: true });
  });
  on(screen, "keydown", (e) => {
    const c = e.target.closest && e.target.closest("[data-cmd]");
    if (c && e.key === "Enter") { e.preventDefault(); typeCmd(c.dataset.cmd); }
  });
  // start typing anywhere and it lands in the prompt
  on(window, "keydown", (e) => {
    if (document.activeElement === input || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length === 1 && !busy && !(e.target.closest && e.target.closest("[data-cmd]"))) input.focus({ preventScroll: true });
  });

  // ---------- layout: inline (default) / stack / split ----------
  function setLayout(mode) {
    layout = mode;
    panes.classList.toggle("stack", mode === "stack");
    panes.classList.toggle("split", mode === "split");
    // inline: the block lives in the scrollback; stack/split: it becomes its own pane
    if (mode === "inline") scroll.insertBefore(pinnedEl, scroll.firstChild);
    else panes.insertBefore(pinnedEl, scroll);
    $("nt-stackbtn").classList.toggle("cur", mode === "stack");
    $("nt-splitbtn").classList.toggle("cur", mode === "split");
    try { localStorage.setItem("nerv-layout", mode); } catch {}
    toBottom();
  }
  try {
    const saved = localStorage.getItem("nerv-layout");
    if (saved === "stack" || (saved === "split" && window.innerWidth > 900)) setLayout(saved);
  } catch {}

  function renderPinned() {
    sink = pinnedEl;
    motd();
    const row = document.createElement("div"); row.className = "pinrow"; pinnedEl.appendChild(row);
    const colA = document.createElement("div"), colB = document.createElement("div"); row.append(colA, colB);
    sink = colA;
    neofetch();
    print("");
    sink = colB;
    printLs();
    sink = null;
    every(() => {
      const up = Math.round((Date.now() - t0) / 1000), el = pinnedEl.querySelector(".upt");
      if (el) el.textContent = `${Math.floor(up / 60)}m ${up % 60}s`;
    }, 1000);
  }

  // arriving from the launch sequence: the screen powers on like a CRT
  screen.classList.toggle("poweron", !!actions.launched && !reduce);

  // ---------- boot: a fast kernel dump, then neofetch + ls ----------
  (async () => {
    setPrompt();
    setBusy(true);
    panes.classList.add("booting");
    // the kernel text floods the whole screen and scrolls past like a real boot, then gets cleared
    sink = bootlog;
    const KERNEL = [
      "NERV-OS 2.6 (magi-kernel 15.2.8) #1 SMP PREEMPT",
      "Command line: root=/dev/central-dogma ro quiet sync=a10",
      "BIOS-e820: GEOFRONT memory map — 640 PB usable",
      "CPU0: MELCHIOR-1 online",
      "CPU1: BALTHASAR-2 online",
      "CPU2: CASPER-3 online (hesitating)",
      "smp: brought up 3 MAGI nodes, consensus mode: majority",
      "LCL: pressure nominal, temperature 36.4C",
      "A10 nerve clips: connected",
      "entry_plug: inserted, lock engaged",
      "dummy_plug: disabled",
      "s2_engine: dormant",
      "at_field.ko: loaded (phase 0)",
      "usb 1-1: new device POKEDEX (vendor 0x025)",
      "pokemon: party.dat loaded — 6/6 members",
      "pokemon: lead JOLTEON, reserve UMBREON EEVEE LEAFEON SPOINK LUCARIO",
      "net: pthambundit.dev link up (1000 Mb/s, full duplex)",
      "fs: mounting /central-dogma (ext4) ... ok",
      "fs: mounting /projects /skills /contact /about ... ok",
      "random: crng init done",
      "audit: type=1400 pattern=none",
      "systemd[1]: magi-init 2.6 running in system mode",
    ];
    const UNITS = [
      ["OK", "Started Umbilical Cable Power Supply."],
      ["OK", "Mounted /central-dogma."],
      ["OK", "Reached target MAGI Consensus."],
      ["OK", "Started Pattern Detection Service (pattern: none)."],
      ["OK", "Started Pokémon Party Daemon."],
      ["OK", "Started Portfolio Web Server (next 15.2)."],
      ["WARN", "Caffeine reserves low."],
      ["OK", "Started magi-sh on tty1."],
    ];
    let ts = 0;
    const bootStart = performance.now();
    const stamp = () => { ts += Math.random() * 0.09; return "[" + ts.toFixed(6).padStart(12) + "]"; };
    const hex = (n) => Math.floor(Math.random() * 16 ** n).toString(16).padStart(n, "0");
    const rnd = (n) => Math.floor(Math.random() * n);
    const FILLER = [
      () => `pci 0000:00:${hex(2)}.0: [8086:${hex(4)}] type 00 class 0x${hex(6)}`,
      () => `magi-node${rnd(3) + 1}: register bank ${rnd(64)} mapped at 0x${hex(8)}`,
      () => `geofront: sector ${String.fromCharCode(65 + rnd(8))}-${rnd(40)} sealed`,
      () => `lcl-pump${rnd(4)}: flow ${(80 + Math.random() * 40).toFixed(1)} L/s`,
      () => `usb ${rnd(4) + 1}-${rnd(8) + 1}: hub ready, ${rnd(8) + 1} ports`,
      () => `dma: channel ${rnd(16)} -> 0x${hex(8)} ok`,
      () => `umbilical: phase ${rnd(3) + 1} current ${(20 + Math.random() * 5).toFixed(2)} kA`,
    ];
    // the named lines in order, with generated hardware noise between them
    const lines = [];
    for (const k of KERNEL) {
      lines.push(k);
      for (let j = rnd(4) + 1; j > 0; j--) lines.push(FILLER[rnd(FILLER.length)]());
    }
    // next frame, with a timer fallback: browsers pause rAF in hidden tabs, which would stall the boot
    const frame = () => new Promise((r) => { let done = false; const go = () => { if (!done) { done = true; r(); } }; requestAnimationFrame(go); setTimeout(go, 50); });
    const follow = () => { scroll.scrollTop = scroll.scrollHeight; };
    try {
      for (let i = 0; i < lines.length && alive; ) {
        const n = reduce ? lines.length : 4 + rnd(3);
        for (const k of lines.slice(i, i + n)) print(`<span class="dim">${stamp()}</span> ${esc(k)}`);
        i += n;
        follow();
        if (!reduce) await frame();
      }
      for (const [st, msg] of UNITS) {
        if (!alive) break;
        const tag = st === "OK" ? '<span class="ok">  OK  </span>' : `<span class="err"> ${st} </span>`;
        print(`[${tag}] ${esc(msg)}`);
        follow();
        if (!reduce) await frame();
      }
      const bar = print("");
      for (let i = 0; i <= 20 && alive; i += 2) {
        bar.innerHTML = `loading userland [${"█".repeat(i)}${"·".repeat(20 - i)}] ${String(i * 5).padStart(3)}%`;
        follow();
        if (!reduce) await frame();
      }
      if (!reduce) await wait(120);
    } finally {
      if (alive) {
        // clear the boot screen, then draw neofetch + ls at the top
        bootlog.innerHTML = "";
        sink = null;
        renderPinned();
        panes.classList.remove("booting");
        sink = bootlog;
        print(`<span class="dim">[  </span><span class="ok">OK</span><span class="dim">  ] boot complete in ${((performance.now() - bootStart) / 1000).toFixed(2)}s</span>`);
        print("");
        sink = null;
        scroll.scrollTop = 0;
        setBusy(false);
        input.focus({ preventScroll: true });
      }
    }
  })();

  return () => {
    alive = false;
    intervals.forEach(clearInterval);
    listeners.forEach(([el, type, fn]) => el.removeEventListener(type, fn));
  };
}
