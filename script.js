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
