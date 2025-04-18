"""gets recommendations from wirecutter (NY Times)"""

import json
import logging
import re
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from functools import lru_cache


logger = logging.getLogger(__name__)


def _fetch_html(url):
    headers = {"User-Agent": "mozilla"}
    req = Request(url, headers=headers)
    logger.info("fetching %s", url)
    try:
        with urlopen(req) as resp:
            return resp.read()
    except HTTPError:
        return


def _make_plural(item):
    if item.endswith("s"):
        return item
    return f"{item}s"


def _ld_json_item_list_from_matches(matches):
    # print(matches)
    for match in matches:
        if match.startswith('{"@type":"ItemList",'):
            return json.loads(match)
    logger.error("no ItemList found in matches")


def _get_ld_json(html):
    pattern = r'type="application/ld\+json">(.*?)</script>'
    matches = re.findall(pattern, html.decode())
    # print(matches)
    return _ld_json_item_list_from_matches(matches)
    # return json.loads(ls_json_string)


def _get_html_for_item(item):
    url = f"https://www.nytimes.com/wirecutter/reviews/best-{item}/"
    return _fetch_html(url)


def _text_to_slug(text):
    return text.replace(" ", "-").lower()


def _make_singular(text):
    if text.endswith("s"):
        return text[: len(text) - 1]
    return text


@lru_cache(maxsize=128)
def _fetch_recommentations_for_item(item):
    item = _text_to_slug(item)
    html = _get_html_for_item(item)
    if not html:
        logger.error("no html found for %s", item)
        return
    ld_json = _get_ld_json(html)
    return ld_json


def find_recommendations(item):
    item = _text_to_slug(item)
    ld_json = _fetch_recommentations_for_item(item)
    if not ld_json and not item.endswith("s"):
        item = _make_plural(item)
        ld_json = _fetch_recommentations_for_item(item)
    if not ld_json and item.endswith("s"):
        item = _make_singular(item)
        ld_json = _fetch_recommentations_for_item(item)

    if not ld_json:
        logger.error("nothing found for %s", item)
        return

    return ld_json


def main():
    logging.basicConfig(level="DEBUG")
    item = "cribs"
    # item = "mattress"
    # item = "hybrid-commuter-bike"
    item = "infant car seats"
    recommendations = find_recommendations(item=item)
    print(recommendations)


if __name__ == "__main__":
    main()
