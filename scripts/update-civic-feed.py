#!/usr/bin/env python3
"""Mirror the latest Civic Ventures newsletter entries for the static site."""

from __future__ import annotations

import email.utils
import html
import json
import re
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path


FEED_URL = "https://civicventures.substack.com/feed"
ARCHIVE_URL = "https://civicventures.substack.com/api/v1/archive?sort=new&search=&offset=0&limit=3"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "civic-feed.json"
DC_CREATOR = "{http://purl.org/dc/elements/1.1/}creator"
CONTENT_ENCODED = "{http://purl.org/rss/1.0/modules/content/}encoded"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
    "Accept": "application/rss+xml, application/xml;q=0.9, application/json;q=0.8, */*;q=0.5",
    "Accept-Language": "en-US,en;q=0.9",
}


def clean_text(value: str | None) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def entries_from_rss(raw: bytes) -> list[dict[str, str]]:
    root = ET.fromstring(raw)
    entries = []
    for item in root.findall("./channel/item")[:3]:
        published = email.utils.parsedate_to_datetime(item.findtext("pubDate"))
        if published.tzinfo is None:
            published = published.replace(tzinfo=timezone.utc)
        article_html = item.findtext(CONTENT_ENCODED) or ""
        image_match = re.search(r'<img[^>]+src="([^"]+)"', article_html, flags=re.IGNORECASE)
        entries.append(
            {
                "title": clean_text(item.findtext("title")),
                "description": clean_text(item.findtext("description")),
                "link": clean_text(item.findtext("link")),
                "author": clean_text(item.findtext(DC_CREATOR)),
                "date": published.date().isoformat(),
                "image": html.unescape(image_match.group(1)) if image_match else "",
            }
        )
    return entries


def entries_from_archive(raw: bytes) -> list[dict[str, str]]:
    posts = json.loads(raw)
    entries = []
    for post in posts[:3]:
        bylines = post.get("publishedBylines") or []
        link = post.get("canonical_url") or (
            "https://civicventures.substack.com/p/" + urllib.parse.quote(post.get("slug", ""))
        )
        entries.append(
            {
                "title": clean_text(post.get("title")),
                "description": clean_text(post.get("subtitle") or post.get("description")),
                "link": link,
                "author": clean_text(bylines[0].get("name") if bylines else ""),
                "date": datetime.fromisoformat(post["post_date"].replace("Z", "+00:00")).date().isoformat(),
                "image": post.get("cover_image") or "",
            }
        )
    return entries


def main() -> None:
    try:
        entries = entries_from_rss(fetch(FEED_URL))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ET.ParseError) as error:
        print(f"RSS fetch unavailable ({error}); using Substack archive API")
        entries = entries_from_archive(fetch(ARCHIVE_URL))

    if not entries:
        raise RuntimeError("Civic Ventures returned no newsletter entries")

    payload = {"source": FEED_URL, "publication": "The Pitch from Civic Ventures", "entries": entries}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
