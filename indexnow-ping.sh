#!/bin/bash
# IndexNow ping — run this after every deploy so Bing/Yandex know your pages changed
# instantly, instead of waiting for their next scheduled crawl.
#
# Usage: bash indexnow-ping.sh

KEY="840168ad3eb0472faa193afc60e9de24"
HOST="airportsplittransfer.com"

# Pull every URL straight from the live sitemap
URLS=$(grep -oP '(?<=<loc>).*?(?=</loc>)' sitemap.xml | sed 's/^/"/;s/$/"/' | paste -sd, -)

curl -s -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json" \
  -d "{\"host\":\"${HOST}\",\"key\":\"${KEY}\",\"keyLocation\":\"https://${HOST}/${KEY}.txt\",\"urlList\":[${URLS}]}"

echo ""
echo "Pinged IndexNow with all URLs from sitemap.xml"
