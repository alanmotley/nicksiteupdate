const comparison = document.querySelector(".comparison-grid");
const viewButtons = document.querySelectorAll("[data-view]");
const liveViewport = document.querySelector(".live-viewport");
const liveCanvas = document.querySelector(".live-canvas");
const liveFrame = document.querySelector(".live-canvas iframe");
const proposedOpenLink = document.querySelector(".proposed-open-link");
const philosophyButton = document.querySelector(".philosophy-button");
const philosophyDialog = document.querySelector(".philosophy-dialog");
const philosophyTitle = document.querySelector("#philosophy-title");
const philosophyCopy = document.querySelector(".dialog-copy");
const dialogClose = document.querySelector(".dialog-close");
const dialogContinue = document.querySelector(".dialog-continue");
const currentViewport = document.querySelector(".image-viewport");
const currentCapture = document.querySelector(".current-site-capture");
const currentImage = document.querySelector(".current-page-image");
const currentPageButtons = document.querySelectorAll("[data-current-page]");
const currentPages = {
  home: { image: "./assets/current-site-home.png", height: 2176, label: "homepage", redesign: "./index.html" },
  about: { image: "./assets/current-site-about.png", height: 1889, label: "About page", redesign: "./about.html" },
  economics: { image: "./assets/current-site-economics.png", height: 2575, label: "Nick on Economics page", redesign: "./economics.html" },
  civic: { image: "./assets/current-site-civic.png", height: 1492, label: "Civic Activism page", redesign: "./civic.html" },
  publications: { image: "./assets/current-site-publications.png", height: 2166, label: "Publications page", redesign: "./publications.html" },
  business: { image: "./assets/current-site-business.png", height: 1849, label: "Business page", redesign: "./business.html" },
  contact: { image: "./assets/current-site-contact.png", height: 998, label: "Contact page", redesign: "./connect.html" }
};
const pagePhilosophies = {
  home: {
    title: "One connected body of ideas",
    paragraphs: [
      "The current website presents Nick’s work as a collection of separate subjects. The redesign presents it as one connected body of ideas.",
      "A stronger editorial identity, clearer hierarchy, and original portraiture create an immediate point of view while directing visitors toward the work that matters most.",
      "The TED talk is moved out of the homepage and into a dedicated Media section, where both of Nick’s featured talks receive a focused, fully branded viewing experience instead of competing with the site’s introduction.",
      "This is not simply a visual refresh. It is a more complete platform for amplifying Nick’s ideas and supporting everything he publishes next."
    ]
  },
  about: {
    title: "A story, not a résumé",
    paragraphs: [
      "The About page shifts from a long biographical block into a structured editorial profile.",
      "The redesign establishes Nick’s three central roles, entrepreneur, investor, and civic leader, then gives his history, convictions, and institutions room to unfold with clarity.",
      "The result feels more human and authoritative while making a complex career easier to understand."
    ]
  },
  economics: {
    title: "Give each platform its own world",
    paragraphs: [
      "The redesign expands Nick’s economic media into two distinct branded destinations: Pitchfork Economics and Class Traitor.",
      "Pitchfork Economics receives a complete listening experience shaped by its established colors, logo, and visual texture. Integrated episodes turn the site into a destination instead of a signpost to somewhere else.",
      "The new Class Traitor page brings Nick’s YouTube brand into the site with its own black, tan, and yellow identity, a featured video screen, and automatically updated recent videos. Each platform keeps its individual character while remaining connected to Nick’s larger body of work."
    ]
  },
  civic: {
    title: "Make the ecosystem visible",
    paragraphs: [
      "Nick’s civic work spans institutions, advocacy, publishing, and public argument. The redesign makes those relationships visible in one coherent ecosystem.",
      "Civic Ventures, Civic Action, and the writing platform each receive a clear role while remaining connected to a shared mission.",
      "Visitors can understand not only what each organization is, but how the pieces work together to move ideas into action."
    ]
  },
  publications: {
    title: "Turn the archive into evidence",
    paragraphs: [
      "The publications page moves beyond a list of links and presents Nick’s writing as a substantial body of work.",
      "Publication imagery, featured articles, books, and a dedicated archive establish range and credibility while making the material easier to browse.",
      "The design treats every article as part of a continuing public argument rather than an isolated appearance."
    ]
  },
  business: {
    title: "Show the scale clearly",
    paragraphs: [
      "Nick’s business record needs clarity more than decoration. The redesign uses disciplined spacing, hierarchy, and concise framing to communicate experience and scale.",
      "Companies and outcomes become legible proof points within a broader entrepreneurial story.",
      "The page feels established and confident without competing with the civic and economic work elsewhere on the site."
    ]
  },
  contact: {
    title: "End with clear pathways",
    paragraphs: [
      "The final page replaces a generic contact form with intentional pathways for following, watching, listening, and connecting.",
      "Current social profiles and major platforms are gathered into one clean destination that reflects how audiences actually engage with Nick’s work.",
      "The goal is a useful conclusion to the site, not merely a form at the end of it."
    ]
  }
};

function trackNickComparisonOpen() {
  const params = new URLSearchParams(window.location.search);
  if (window.location.hostname !== "alanmotley.github.io" || params.get("recipient") !== "nick") return;

  const trackedKey = "pulse_nick_comparison_open_v1";
  try {
    if (window.sessionStorage.getItem(trackedKey) === "1") return;
    window.sessionStorage.setItem(trackedKey, "1");
  } catch (error) {}

  const endpoint = "https://norynthe-pulse-tracker.alanmotley.workers.dev/track";
  const sessionKey = "pulse_nick_comparison_session_v1";
  let sessionId = "";
  try {
    sessionId = window.sessionStorage.getItem(sessionKey) || window.crypto.randomUUID();
    window.sessionStorage.setItem(sessionKey, sessionId);
  } catch (error) {
    sessionId = `nick-comparison-${Date.now()}`;
  }

  let referrerDomain = "";
  try {
    referrerDomain = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
  } catch (error) {}

  const userAgent = navigator.userAgent;
  const payload = JSON.stringify({
    site: "nicksiteupdate",
    eventType: "proposal_view",
    sessionId,
    page: window.location.pathname,
    pageLocation: window.location.href,
    title: "Nick Website Comparison Opened",
    assetName: "Nick Website Comparison",
    referrer: document.referrer,
    referrerDomain,
    utmSource: params.get("utm_source") || "email",
    utmMedium: params.get("utm_medium") || "direct",
    utmCampaign: params.get("utm_campaign") || "nick_website_comparison",
    utmContent: params.get("utm_content") || "saturday_morning",
    deviceType: /Mobi|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop",
    browser: /Edg\//.test(userAgent) ? "Edge" : /Chrome\//.test(userAgent) ? "Chrome" : /Safari\//.test(userAgent) ? "Safari" : "Other",
    os: /iPhone|iPad/i.test(userAgent) ? "iOS" : /Mac OS X/i.test(userAgent) ? "macOS" : /Windows/i.test(userAgent) ? "Windows" : /Android/i.test(userAgent) ? "Android" : "Other"
  });

  if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([payload], { type: "text/plain;charset=UTF-8" }))) return;
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: payload,
    keepalive: true
  }).catch(() => {});
}

function sizeLivePreview() {
  liveCanvas.style.height = `${liveViewport.clientHeight}px`;
}

function setView(view) {
  comparison.dataset.activeView = view;
  viewButtons.forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  requestAnimationFrame(sizeLivePreview);
}

function setCurrentPage(page) {
  const nextPage = currentPages[page];
  if (!nextPage) return;
  currentImage.src = nextPage.image;
  currentCapture.dataset.page = page;
  currentImage.height = nextPage.height;
  currentImage.alt = `Full-page capture of the ${nextPage.label} on Nick Hanauer's current website`;
  liveFrame.src = nextPage.redesign;
  proposedOpenLink.href = nextPage.redesign;
  currentViewport.scrollTo({ top: 0, behavior: "smooth" });
  liveViewport.scrollTo({ top: 0, behavior: "smooth" });
  showPhilosophy(page);
}

function showPhilosophy(page = currentCapture.dataset.page || "home") {
  const philosophy = pagePhilosophies[page];
  if (!philosophy) return;
  philosophyTitle.textContent = philosophy.title;
  philosophyCopy.replaceChildren(...philosophy.paragraphs.map((text) => {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
  }));
  if (!philosophyDialog.open) philosophyDialog.showModal();
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

currentPageButtons.forEach((button) => {
  button.addEventListener("click", () => setCurrentPage(button.dataset.currentPage));
});

philosophyButton.addEventListener("click", () => showPhilosophy());
dialogClose.addEventListener("click", () => philosophyDialog.close());
dialogContinue.addEventListener("click", () => philosophyDialog.close());
philosophyDialog.addEventListener("click", (event) => {
  if (event.target === philosophyDialog) philosophyDialog.close();
});

liveFrame.addEventListener("load", sizeLivePreview);
window.addEventListener("resize", sizeLivePreview);
sizeLivePreview();
showPhilosophy("home");
trackNickComparisonOpen();
