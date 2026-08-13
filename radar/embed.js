/* Eigentümer-Radar – Einbett-Loader für fremde Websites.
   Verwendung (genau dieser Schnipsel geht an den Makler):

   <script async src="https://immobild.ai/radar/embed.js" data-radar="TENANT-ID"></script>

   Erzeugt an Ort und Stelle ein iframe mit dem Rechner und passt dessen Höhe
   automatisch an (postMessage). data-base ist nur für lokale Tests gedacht. */
(function () {
  var s = document.currentScript;
  if (!s) return;

  var id = s.getAttribute("data-radar") || "demo";
  var base = s.getAttribute("data-base") || "https://immobild.ai/radar/";

  var iframe = document.createElement("iframe");
  iframe.src = base + (base.indexOf("?") === -1 ? "?" : "&") + "m=" + encodeURIComponent(id);
  iframe.title = "Immobilienbewertung – kostenlose Ersteinschätzung";
  iframe.loading = "lazy";
  iframe.style.cssText = "width:100%;border:0;display:block;min-height:520px;color-scheme:normal";

  s.parentNode.insertBefore(iframe, s);

  window.addEventListener("message", function (e) {
    if (
      e.source === iframe.contentWindow &&
      e.data &&
      e.data.type === "immobild-radar:height" &&
      typeof e.data.height === "number" &&
      e.data.height > 0 &&
      e.data.height < 10000
    ) {
      iframe.style.height = e.data.height + "px";
      iframe.style.minHeight = "0";
    }
  });
})();
