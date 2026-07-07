const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");

const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  document.body.classList.remove("menu-open");
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.tagName === "A") closeMenu();
  });

  // Release the scroll lock and hide the panel as soon as the desktop layout returns
  // (e.g. rotating a tablet while the menu is open).
  const desktopQuery = window.matchMedia("(min-width: 1021px)");
  const handleDesktop = (event) => {
    if (event.matches) closeMenu();
  };
  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", handleDesktop);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(handleDesktop); // Safari < 14
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      closeMenu();
      menuButton.focus();
    }
  });
}

if (canAnimate && "IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll(".section, .signal-grid article, .contact-band");
  document.body.classList.add("reveal-ready");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

const quoteForm = document.getElementById("quoteForm");
const packageSelect = document.getElementById("packageSelect");
const objectType = document.getElementById("objectType");
const goalSelect = document.getElementById("goalSelect");
const sizeSelect = document.getElementById("sizeSelect");
const totalPrice = document.getElementById("totalPrice");
const summaryText = document.getElementById("summaryText");

function selectedExtras() {
  return Array.from(document.querySelectorAll(".quote-form input[type='checkbox']:checked"));
}

function updateQuote() {
  if (!packageSelect || !totalPrice || !summaryText || !objectType || !sizeSelect) return;

  const selectedPackage = packageSelect.options[packageSelect.selectedIndex];
  const basePrice = Number(selectedPackage.dataset.price || 0);
  const selectedSize = sizeSelect.options[sizeSelect.selectedIndex];
  const sizePrice = Number(selectedSize.dataset.price || 0);
  const extras = selectedExtras();
  const extrasPrice = extras.reduce((sum, item) => sum + Number(item.dataset.price || 0), 0);
  const total = basePrice + sizePrice + extrasPrice;
  const extraNames = extras.map((item) => item.value);

  totalPrice.textContent = `ab ${total.toLocaleString("de-DE")} EUR`;
  summaryText.textContent = `${objectType.value} · ${selectedPackage.value} · ${selectedSize.value}${extraNames.length ? ` · ${extraNames.join(", ")}` : ""}`;
}

document.querySelectorAll("#packageSelect, #objectType, #goalSelect, #sizeSelect, .quote-form input[type='checkbox']").forEach((field) => {
  field.addEventListener("change", updateQuote);
});

document.querySelectorAll(".price-card a").forEach((link) => {
  link.addEventListener("click", () => {
    const card = link.closest(".price-card");
    const packageName = card?.querySelector(".package-name")?.textContent?.trim();
    if (!packageName || !packageSelect) return;

    Array.from(packageSelect.options).forEach((option) => {
      if (option.value === packageName) packageSelect.value = option.value;
    });

    updateQuote();
  });
});

if (quoteForm) {
  quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedPackage = packageSelect.options[packageSelect.selectedIndex];
    const selectedSize = sizeSelect.options[sizeSelect.selectedIndex];
    const extras = selectedExtras().map((item) => item.value);
    const name = document.getElementById("leadName").value.trim() || "Nicht angegeben";
    const address = document.getElementById("objectAddress").value.trim() || "Nicht angegeben";
    const message = document.getElementById("leadMessage").value.trim() || "Keine Zusatzinfo";

    const subject = `Anfrage Immobild.ai · ${objectType.value} · ${selectedPackage.value}`;
    const body = [
      "Hallo Immobild.ai,",
      "",
      "ich möchte ein Objekt anfragen.",
      "",
      `Name/Firma: ${name}`,
      `Objektart: ${objectType.value}`,
      `Vermarktungsziel: ${goalSelect ? goalSelect.value : "Nicht angegeben"}`,
      `Paket: ${selectedPackage.value}`,
      `Objektgröße: ${selectedSize.value}`,
      `Extras: ${extras.length ? extras.join(", ") : "Keine"}`,
      `Objektadresse: ${address}`,
      "",
      "Nachricht:",
      message,
      "",
      "Bitte melden Sie sich mit Preis und Terminvorschlag.",
    ].join("\n");

    window.location.href = `mailto:kontakt@immobild.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

updateQuote();
