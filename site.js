// Enrefrence — small interactions. Every page still works as plain links and text without this file.
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* --------------------------------------------------------------------------
   Logo — each letter becomes a cube that rolls over in a wave.
   Brush a letter with the pointer to give it an extra spin.
   -------------------------------------------------------------------------- */
for (const logo of $$("[data-spin]")) {
  const word = logo.textContent.trim();
  logo.setAttribute("aria-label", `${word}, home`);
  logo.replaceChildren(...[...word].map((ch, i) => {
    const letter = document.createElement("span");
    letter.className = "ch";
    letter.style.setProperty("--i", i);
    letter.setAttribute("aria-hidden", "true");
    letter.innerHTML = `${ch}<span class="kick"><span class="cube">${`<span class="face">${ch}</span>`.repeat(4)}</span></span>`;
    return letter;
  }));

  if (reduced) continue;
  logo.addEventListener("pointerover", (e) => {
    const kick = e.target.closest(".ch")?.querySelector(".kick");
    if (!kick || kick.classList.contains("is-kicked")) return;
    kick.classList.add("is-kicked");
    kick.addEventListener("animationend", () => kick.classList.remove("is-kicked"), { once: true });
  });
}

/* --------------------------------------------------------------------------
   Live clock in the masthead — "12:00 AM / OCT 20, 2026"
   -------------------------------------------------------------------------- */
for (const el of $$("[data-clock]")) {
  const render = () => {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const html = `${time.replace(":", '<span class="blink">:</span>')} / ${date}`;
    if (el.innerHTML !== html) {
      el.innerHTML = html;
      el.dateTime = now.toISOString();
    }
  };
  render();
  setInterval(render, 1000);
}

/* --------------------------------------------------------------------------
   Page wipe — internal links raise a coral sheet with the destination's name,
   and the next page lifts it away (see the inline script in each <head>).
   -------------------------------------------------------------------------- */
const wipe = document.createElement("div");
wipe.className = "wipe";
wipe.setAttribute("aria-hidden", "true");
document.body.append(wipe);

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || reduced || e.defaultPrevented || e.button !== 0) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank" || a.hasAttribute("download")) return;
  if (a.getAttribute("href").startsWith("#")) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) return;

  e.preventDefault();
  const label = `[${a.dataset.wipe || a.textContent.trim()}]`;
  wipe.textContent = label;
  try { sessionStorage.setItem("wipe", label); } catch {}
  wipe.classList.add("is-covering");
  setTimeout(() => location.assign(url.href), 450);
});

// Coming back with the browser's back button restores this page mid-wipe; clear it.
addEventListener("pageshow", (e) => { if (e.persisted) wipe.classList.remove("is-covering"); });

/* --------------------------------------------------------------------------
   Departments — clicking a label opens the drawer and slides its panel
   underneath that label. Without JS they're plain links into the feature.
   -------------------------------------------------------------------------- */
for (const depts of $$("[data-depts]")) {
  const tabs = $$(".dept", depts);
  const panels = tabs.map((t) => document.getElementById(t.dataset.panel));
  const holder = depts.querySelector(".dept-panels");
  const stacked = matchMedia("(max-width: 900px)");
  let open = -1;

  const place = () => {
    if (open < 0) return;
    if (stacked.matches) return holder.style.removeProperty("--x");
    const row = depts.getBoundingClientRect();
    const tab = tabs[open].getBoundingClientRect();
    const room = row.width - holder.offsetWidth;
    // Left-hand labels anchor the panel's left edge; right-hand ones its right edge.
    const x = tab.left - row.left < row.width / 2 ? tab.left - row.left : tab.right - row.left - holder.offsetWidth;
    holder.style.setProperty("--x", `${Math.max(0, Math.min(room, x))}px`);
  };

  const show = (i) => {
    open = i;
    tabs.forEach((t, n) => t.setAttribute("aria-expanded", n === i));
    // Keep the last panel in place while the drawer closes so it doesn't collapse empty.
    // Opening re-shows the panel from scratch so its game demo starts on beat one.
    if (i >= 0) {
      panels.forEach((p) => (p.hidden = true));
      void holder.offsetWidth;
      panels[i].hidden = false;
    }
    depts.classList.toggle("is-open", i >= 0);
    place();
  };

  tabs.forEach((tab, i) => {
    tab.setAttribute("role", "button");
    tab.setAttribute("aria-expanded", "false");
    tab.setAttribute("aria-controls", panels[i].id);
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      show(open === i ? -1 : i);
    });
  });
  depts.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && open >= 0) { tabs[open].focus(); show(-1); }
  });
  $$("[data-close]", depts).forEach((b) => b.addEventListener("click", () => { tabs[open]?.focus(); show(-1); }));
  addEventListener("resize", place);
}

/* --------------------------------------------------------------------------
   Feature photo — tilts toward the pointer, flips over for the caption
   -------------------------------------------------------------------------- */
for (const photo of $$("[data-flip]")) {
  photo.addEventListener("click", () => {
    photo.setAttribute("aria-pressed", photo.getAttribute("aria-pressed") !== "true");
  });
  if (reduced) continue;
  photo.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = photo.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    photo.style.setProperty("--tilt-x", `${(-y * 12).toFixed(2)}deg`);
    photo.style.setProperty("--tilt-y", `${(x * 12).toFixed(2)}deg`);
  });
  photo.addEventListener("pointerleave", () => {
    photo.style.removeProperty("--tilt-x");
    photo.style.removeProperty("--tilt-y");
  });
}

/* --------------------------------------------------------------------------
   Newsletter forms — there's no mailing list yet, so nothing is sent anywhere.
   -------------------------------------------------------------------------- */
for (const form of $$("[data-signup]")) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("is-done");
    form.querySelector("input").disabled = true;
    const button = form.querySelector("button");
    button.textContent = "Demo only · No email sent";
    button.disabled = true;
  });
}

/* --------------------------------------------------------------------------
   Toggle groups — city filters ([data-filter]) and the archive view switch ([data-view-for])
   -------------------------------------------------------------------------- */
const press = (group, btn) => $$("button", group).forEach((b) => b.setAttribute("aria-pressed", b === btn));

for (const group of $$("[data-filter]")) {
  const list = document.getElementById(group.dataset.filter);
  const count = document.querySelector(`[data-count="${list.id}"]`);
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tag]");
    if (!btn) return;
    press(group, btn);
    let shown = 0;
    for (const row of list.children) {
      row.hidden = btn.dataset.tag !== "all" && row.dataset.tag !== btn.dataset.tag;
      if (row.hidden) continue;
      row.classList.remove("is-entering");
      void row.offsetWidth; // restart the entrance animation
      row.style.animationDelay = `${shown * 40}ms`;
      row.classList.add("is-entering");
      shown++;
    }
    if (count) count.textContent = `${String(shown).padStart(2, "0")} listings`;
  });
}

for (const group of $$("[data-view-for]")) {
  const list = document.getElementById(group.dataset.viewFor);
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-view]");
    if (!btn || list.dataset.view === btn.dataset.view) return;
    const swap = () => { press(group, btn); list.dataset.view = btn.dataset.view; };
    // Rows morph into cards where View Transitions are supported.
    if (document.startViewTransition && !reduced) document.startViewTransition(swap);
    else swap();
  });
}

/* --------------------------------------------------------------------------
   Play — reference roulette. The list in the page is the reel.
   -------------------------------------------------------------------------- */
for (const game of $$("[data-roulette]")) {
  const items = $$(".reel li", game).map((li) => ({ ...li.dataset, title: li.querySelector("b").textContent }));
  const slot = game.querySelector(".slot");
  const button = game.querySelector(".spin");
  const history = game.querySelector(".history");
  const field = (name) => slot.querySelector(`[data-field="${name}"]`);
  let current = 0;
  let spinning = false;

  const render = (i) => {
    const item = items[i];
    field("type").textContent = item.type;
    field("year").textContent = item.year;
    field("title").textContent = item.title;
    field("by").textContent = item.by;
  };

  const land = () => {
    spinning = false;
    slot.classList.remove("is-spinning");
    button.classList.remove("is-spinning");
    slot.classList.remove("is-landed");
    void slot.offsetWidth;
    slot.classList.add("is-landed");
    const li = document.createElement("li");
    li.textContent = `${items[current].title} — ${items[current].by}, ${items[current].year}`;
    history.prepend(li);
    history.hidden = false;
  };

  button.addEventListener("click", () => {
    if (spinning) return;
    if (reduced) {
      current = Math.floor(Math.random() * items.length);
      render(current);
      return land();
    }
    spinning = true;
    slot.classList.add("is-spinning");
    button.classList.add("is-spinning");
    const steps = 16 + Math.floor(Math.random() * items.length);
    let n = 0;
    const step = () => {
      current = (current + 1) % items.length;
      render(current);
      n++;
      if (n < steps) setTimeout(step, 45 + (n / steps) ** 3 * 380); // decelerates like a wheel
      else land();
    };
    step();
  });

  game.classList.add("roulette-ready");
  render(current);
}

/* --------------------------------------------------------------------------
   Merch — add to bag (no checkout yet)
   -------------------------------------------------------------------------- */
const bag = document.querySelector("[data-bag]");
for (const btn of $$("[data-add]")) {
  btn.addEventListener("click", () => {
    const added = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", added);
    btn.textContent = added ? "✓ In the bag" : "+ Add to bag";
    if (!bag) return;
    bag.textContent = `Bag (${$$("[data-add][aria-pressed='true']").length})`;
    bag.classList.remove("is-bumped");
    void bag.offsetWidth;
    bag.classList.add("is-bumped");
  });
}

/* --------------------------------------------------------------------------
   Article — reading progress bar
   -------------------------------------------------------------------------- */
const progress = document.querySelector("[data-progress]");
if (progress) {
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
}
