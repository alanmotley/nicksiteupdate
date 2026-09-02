document.querySelectorAll(".video-poster").forEach((poster) => {
  poster.addEventListener("click", () => {
    const videoId = poster.dataset.youtubeId;
    const title = poster.getAttribute("aria-label").replace(/^Play\s+/, "");
    const section = poster.closest(".class-traitor-content");
    const stage = section.querySelector(".class-traitor-stage");
    const frame = section.querySelector(".class-traitor-stage-frame");
    const iframe = document.createElement("iframe");

    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
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
});


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
