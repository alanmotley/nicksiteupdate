#!/usr/bin/env python3
"""Mirror the latest Civic Ventures newsletter entries for the static site."""

from __future__ import annotations

import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import timezone
from pathlib import Path


FEED_URL = "https://civicventures.substack.com/feed"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "civic-feed.json"
DC_CREATOR = "{http://purl.org/dc/elements/1.1/}creator"
CONTENT_ENCODED = "{http://purl.org/rss/1.0/modules/content/}encoded"


def clean_text(value: str | None) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def main() -> None:
    request = urllib.request.Request(FEED_URL, headers={"User-Agent": "Mozilla/5.0 NickHanauerSite/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        root = ET.fromstring(response.read())

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

    payload = {"source": FEED_URL, "publication": "The Pitch from Civic Ventures", "entries": entries}
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
