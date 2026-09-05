document.querySelectorAll("[data-current-year]").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

document.querySelectorAll("[data-hover-video]").forEach((video) => {
  const playVideo = () => {
    video.play().catch(() => {});
  };

  const resetVideo = () => {
    video.pause();
    if (video.readyState >= 1) video.currentTime = 0;
  };

  video.addEventListener("mouseenter", playVideo);
  video.addEventListener("mouseleave", resetVideo);
  video.addEventListener("focus", playVideo);
  video.addEventListener("blur", resetVideo);
});

const bindVideoPoster = (poster) => {
  if (poster.dataset.videoBound) return;
  poster.dataset.videoBound = "true";
  poster.addEventListener("click", () => {
    const videoId = poster.dataset.youtubeId;
    const title = poster.getAttribute("aria-label").replace(/^Play\s+/, "");
    const section = poster.closest(".class-traitor-content");
    const stage = section.querySelector(".class-traitor-stage");
    const frame = section.querySelector(".class-traitor-stage-frame");
    const iframe = document.createElement("iframe");

    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&hl=en&cc_lang_pref=en`;
    iframe.title = title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    frame.replaceChildren(iframe);
    stage.hidden = false;
    section.querySelectorAll(".video-poster").forEach((item) => {
      item.classList.toggle("is-active", item === poster);
    });
    stage.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};

document.querySelectorAll(".video-poster").forEach(bindVideoPoster);

const classTraitorVideos = document.querySelector("[data-class-traitor-videos]");

if (classTraitorVideos) {
  const createVideoCard = (video, index) => {
    const article = document.createElement("article");
    article.className = "class-traitor-video";

    const frame = document.createElement("div");
    frame.className = "class-traitor-frame";

    const poster = document.createElement("button");
    poster.className = `video-poster${index === 0 ? " is-active" : ""}`;
    poster.type = "button";
    poster.dataset.youtubeId = video.id;
    poster.setAttribute("aria-label", `Play ${video.title}`);

    const image = document.createElement("img");
    image.src = video.thumbnail;
    image.alt = "";
    image.loading = "lazy";

    const play = document.createElement("span");
    play.className = "video-play";
    play.setAttribute("aria-hidden", "true");
    poster.append(image, play);
    frame.append(poster);

    const meta = document.createElement("div");
    meta.className = "class-traitor-video-meta";
    const number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");
    const heading = document.createElement("h3");
    heading.textContent = video.title;
    meta.append(number, heading);
    article.append(frame, meta);
    bindVideoPoster(poster);
    return article;
  };

  fetch(`./data/class-traitor-videos.json?v=${Date.now()}`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Video list unavailable");
      return response.json();
    })
    .then(({ videos }) => {
      if (!Array.isArray(videos) || videos.length < 3) return;
      const latest = videos.slice(0, 3);
      classTraitorVideos.replaceChildren(...latest.map(createVideoCard));

      const featured = document.querySelector("[data-class-traitor-featured]");
      if (!featured) return;
      const first = latest[0];
      featured.dataset.youtubeId = first.id;
      featured.setAttribute("aria-label", `Play ${first.title}`);
      featured.querySelector("img").src = first.thumbnail;
      featured.querySelector("strong").textContent = first.title;
    })
    .catch(() => {
      // The hand-curated HTML remains usable if an update cannot be loaded.
    });
}


const podcastList = document.querySelector("[data-podcast-list]");

if (podcastList) {
  const audio = document.querySelector("[data-podcast-audio]");
  const title = document.querySelector("[data-podcast-title]");
  const date = document.querySelector("[data-podcast-date]");
  const description = document.querySelector("[data-podcast-description]");
  const detailsLink = document.querySelector("[data-podcast-link]");
  const status = document.querySelector("[data-podcast-status]");

  const decodeText = (value) => {
    const template = document.createElement("template");
    template.innerHTML = value || "";
    return template.content.textContent.replace(/\s+/g, " ").trim();
  };

  const episodeAudio = (episode) =>
    `https://pitchforkeconomics.com/episode-player/${episode.id}/${episode.slug}.mp3`;

  const displayTitle = (value) => value.replace(/\s*\(with .*\)$/i, "").trim();

  const conciseDescription = (value) => {
    const clean = value.replace(/\s+/g, " ").trim();
    if (clean.length <= 260) return clean;
    const firstTwoSentences = clean.match(/^.*?[.!?](?:\s+.*?[.!?])?/);
    return (firstTwoSentences ? firstTwoSentences[0] : `${clean.slice(0, 257)}…`).trim();
  };

  const activateEpisode = (button, shouldPlay = false) => {
    podcastList.querySelectorAll(".podcast-episode-card").forEach((card) => {
      card.classList.toggle("is-active", card === button);
    });

    title.textContent = displayTitle(button.dataset.title);
    date.textContent = button.dataset.date;
    description.textContent = conciseDescription(button.dataset.description);
    detailsLink.href = button.dataset.link;
    audio.src = episodeAudio(button.dataset);
    audio.load();
    if (shouldPlay) audio.play().catch(() => {});
  };

  const bindCards = () => {
    podcastList.querySelectorAll(".podcast-episode-card").forEach((card) => {
      card.addEventListener("click", () => activateEpisode(card, true));
    });
  };

  const createEpisodeCard = (episode, index) => {
    const button = document.createElement("button");
    const episodeDate = new Date(`${episode.date}Z`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const fullTitle = decodeText(episode.title.rendered);
    const shortTitle = displayTitle(fullTitle);
    const excerpt = conciseDescription(decodeText(episode.excerpt.rendered));

    button.className = `podcast-episode-card${index === 0 ? " is-active" : ""}`;
    button.type = "button";
    Object.assign(button.dataset, {
      id: String(episode.id),
      slug: episode.slug,
      date: episodeDate,
      title: fullTitle,
      description: excerpt,
      link: episode.link,
    });

    const number = document.createElement("span");
    number.className = "podcast-episode-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const published = document.createElement("span");
    published.className = "podcast-episode-date";
    published.textContent = episodeDate;

    const heading = document.createElement("strong");
    heading.textContent = shortTitle;

    const cta = document.createElement("span");
    cta.className = "podcast-episode-cta";
    cta.textContent = "Play episode";

    button.append(number, published, heading, cta);
    return button;
  };

  bindCards();

  fetch("https://pitchforkeconomics.com/wp-json/wp/v2/episode?per_page=6&_fields=id,date,slug,link,title,excerpt")
    .then((response) => {
      if (!response.ok) throw new Error("Podcast feed unavailable");
      return response.json();
    })
    .then((episodes) => {
      if (!Array.isArray(episodes) || episodes.length === 0) return;
      const cards = episodes.map(createEpisodeCard);
      podcastList.replaceChildren(...cards);
      bindCards();
      activateEpisode(cards[0]);
      status.textContent = "Official episode feed";
    })
    .catch(() => {
      status.textContent = "Recent Pitchfork Economics episodes";
    });
}

const civicFeed = document.querySelector("[data-civic-feed]");

if (civicFeed) {
  const formatCivicDate = (value) =>
    new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const createCivicEntry = (entry) => {
    const article = document.createElement("article");
    article.className = "civic-feed-card";

    const meta = document.createElement("p");
    meta.className = "civic-feed-meta";
    meta.textContent = `${formatCivicDate(entry.date)} · ${entry.author || "Civic Ventures"}`;
    const heading = document.createElement("h3");
    heading.textContent = entry.title;
    const description = document.createElement("p");
    description.textContent = entry.description;
    const link = document.createElement("a");
    link.href = entry.link;
    link.innerHTML = 'Read article <span aria-hidden="true">↗</span>';
    article.append(meta, heading, description, link);
    return article;
  };

  fetch(`./data/civic-feed.json?v=${Date.now()}`, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Civic feed unavailable");
      return response.json();
    })
    .then(({ entries }) => {
      if (!Array.isArray(entries) || entries.length === 0) return;
      civicFeed.replaceChildren(...entries.slice(0, 3).map(createCivicEntry));
    })
    .catch(() => {
      // The static newsletter card remains usable if the feed cannot load.
    });
}

const tedOptions = document.querySelectorAll("[data-ted-option]");

if (tedOptions.length) {
  const player = document.querySelector("[data-ted-player]");
  const label = document.querySelector("[data-ted-label]");
  const title = document.querySelector("[data-ted-title]");
  const description = document.querySelector("[data-ted-description]");
  const talkLink = document.querySelector("[data-ted-link]");

  tedOptions.forEach((option) => {
    option.addEventListener("click", () => {
      if (!option.classList.contains("is-active")) player.src = option.dataset.embed;
      label.textContent = `TED Talk · ${option.dataset.year}`;
      title.textContent = option.dataset.title;
      description.textContent = option.dataset.description;
      talkLink.href = option.dataset.link;

      tedOptions.forEach((item) => {
        const active = item === option;
        item.classList.toggle("is-active", active);
        item.querySelector("small").textContent = active ? "Now playing" : "Play talk";
      });

      document.querySelector(".media-page .video-frame").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

const pageTransitionDuration = 170;

window.addEventListener("pageshow", () => {
  document.body.classList.remove("page-leaving");
});

document.addEventListener("click", (event) => {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) return;

  const link = event.target.closest("a[href]");
  if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;

  const destination = new URL(link.href, window.location.href);
  if (destination.origin !== window.location.origin) return;

  const sameDocument =
    destination.pathname === window.location.pathname &&
    destination.search === window.location.search;
  if (sameDocument) return;

  event.preventDefault();
  document.body.classList.add("page-leaving");
  window.setTimeout(() => {
    window.location.assign(destination.href);
  }, pageTransitionDuration);
});
