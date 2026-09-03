#!/usr/bin/env python3
"""Refresh the three newest long-form Class Traitor videos."""

from __future__ import annotations

import json
import pathlib
import re
import sys
import urllib.request


CHANNEL_URL = "https://www.youtube.com/@nickhanauerclasstraitor/videos"
FETCH_URL = f"{CHANNEL_URL}?hl=en&gl=US"
OUTPUT = pathlib.Path(__file__).resolve().parents[1] / "data" / "class-traitor-videos.json"
USER_AGENT = "Mozilla/5.0 (compatible; NickHanauerSite/1.0; +https://www.nickhanauer.com/)"


def walk(value):
    if isinstance(value, dict):
        for key in ("videoRenderer", "lockupViewModel"):
            renderer = value.get(key)
            if isinstance(renderer, dict):
                yield renderer
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


def text_from(value):
    if not isinstance(value, dict):
        return ""
    if isinstance(value.get("simpleText"), str):
        return value["simpleText"].strip()
    return "".join(run.get("text", "") for run in value.get("runs", [])).strip()


def nested(value, *keys, default=None):
    for key in keys:
        if not isinstance(value, dict):
            return default
        value = value.get(key)
    return default if value is None else value


def video_fields(renderer):
    """Read both YouTube's current lockup model and its older video model."""
    if "rendererContext" in renderer:
        video_id = nested(
            renderer,
            "rendererContext",
            "commandContext",
            "onTap",
            "innertubeCommand",
            "watchEndpoint",
            "videoId",
            default="",
        )
        title = nested(renderer, "metadata", "lockupMetadataViewModel", "title", "content", default="")
        rows = nested(
            renderer,
            "metadata",
            "lockupMetadataViewModel",
            "metadata",
            "contentMetadataViewModel",
            "metadataRows",
            default=[],
        )
        published = ""
        if rows:
            parts = rows[0].get("metadataParts", [])
            if parts:
                published = nested(parts[-1], "text", "content", default="")
        return video_id, title.strip(), published.strip()

    return (
        renderer.get("videoId", ""),
        text_from(renderer.get("title")),
        text_from(renderer.get("publishedTimeText")),
    )


def fetch_latest():
    request = urllib.request.Request(
        FETCH_URL,
        headers={
            "Accept-Language": "en-US,en;q=0.9",
            "Cookie": "PREF=hl=en&gl=US",
            "User-Agent": USER_AGENT,
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8")

    match = re.search(r"(?:var\s+)?ytInitialData\s*=\s*({.+?});\s*</script>", html)
    if not match:
        raise RuntimeError("YouTube page did not contain its video data")

    initial_data = json.loads(match.group(1))
    videos = []
    seen = set()

    for renderer in walk(initial_data):
        video_id, title, published = video_fields(renderer)
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id) or not title or video_id in seen:
            continue

        seen.add(video_id)
        videos.append(
            {
                "id": video_id,
                "title": title,
                "published": published,
                "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                "url": f"https://www.youtube.com/watch?v={video_id}",
            }
        )
        if len(videos) == 3:
            break

    if len(videos) != 3:
        raise RuntimeError(f"Expected three long-form videos, found {len(videos)}")
    return videos


def main():
    videos = fetch_latest()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({"channel": CHANNEL_URL, "videos": videos}, indent=2) + "\n")
    print("Updated Class Traitor videos:")
    for video in videos:
        print(f"- {video['title']} ({video['id']})")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Class Traitor refresh failed: {error}", file=sys.stderr)
        raise SystemExit(1)
