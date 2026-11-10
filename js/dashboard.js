(() => {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  const openBtn = document.getElementById("sidebarOpen");
  const closeBtn = document.getElementById("sidebarClose");
  const searchInputs = Array.from(document.querySelectorAll(".dash-search"));
  const nav = document.getElementById("dashNav");
  const broadcastBtn = document.getElementById("broadcastNotice");
  const noticesList = document.getElementById("noticesList");

  const setSidebarOpen = (open) => {
    if (!sidebar) return;
    sidebar.classList.toggle("is-open", open);
    openBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) {
      backdrop.hidden = !open;
      backdrop.classList.toggle("is-open", open);
      backdrop.setAttribute("aria-hidden", open ? "false" : "true");
    }
    document.body.style.overflow = open ? "hidden" : "";
  };

  openBtn?.addEventListener("click", () => setSidebarOpen(true));
  closeBtn?.addEventListener("click", () => setSidebarOpen(false));
  backdrop?.addEventListener("click", () => setSidebarOpen(false));

  const focusSearch = () => {
    const visible = searchInputs.find((input) => {
      const style = window.getComputedStyle(input);
      return style.display !== "none" && style.visibility !== "hidden" && input.offsetParent !== null;
    });
    const target = visible || searchInputs[0];
    target?.focus();
    target?.select();
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setSidebarOpen(false);

    const metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
    if (metaK) {
      e.preventDefault();
      focusSearch();
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setSidebarOpen(false);
    }
  });

  nav?.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      nav.querySelectorAll(".nav-link").forEach((item) => {
        item.classList.toggle("is-active", item === link);
      });
      if (window.matchMedia("(max-width: 1023px)").matches) {
        setSidebarOpen(false);
      }
    });
  });

  broadcastBtn?.addEventListener("click", () => {
    if (!noticesList) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const item = document.createElement("li");
    item.className = "rounded-lg border border-line bg-mist px-3.5 py-3";
    item.innerHTML = `
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-bold text-navy-dark">Draft Broadcast</p>
        <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">Today, ${time}</span>
      </div>
      <p class="mt-1 text-xs text-slate-600 leading-relaxed">New notice draft created. Connect messaging API to publish to parents and staff.</p>
    `;
    noticesList.prepend(item);
    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
