# IamYerhyer/news-of-18-nov

[![make.fun · news-image-20261118](https://make.fun/badge/news-image-20261118.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![rank](https://make.fun/badge/news-image-20261118/IamYerhyer/news-of-18-nov/rank.svg)](https://make.fun/bounty/news-image-20261118/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)
[![reward](https://make.fun/badge/news-image-20261118/IamYerhyer/news-of-18-nov/reward.svg)](https://make.fun/bounty/news-image-20261118?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261118)

**The Daily Ledger** — a classic broadsheet newspaper front page, 1024×1024, summing up the world news of **Wednesday 18 November 2026**: off-white paper, black serif type, column rules, and real photographs (grayscale, downloaded locally into `photos/`, each captioned and credited — White House, NASA and US Congress via Wikimedia Commons). The page is an authored HTML layout (`image-source.html`) rendered to `entry.png` with headless Chrome. The program (`main.ts`, Node 22, standard library only, no network) validates the image before handing it in — magic bytes, real pixel dimensions from the PNG IHDR / JPEG SOF, the 1024×1024 and 1 MiB caps — then copies it to `/output/entry.png` and proves the copy landed whole with a SHA-256 fingerprint check.

## The six stories

1. **Trump lands in China** — lands in Beijing before Thursday's first-ever three-way summit with Presidents Xi and Putin. *(Reuters, 18 Nov 2026)*
2. **US strikes Qeshm Island** — retaliation for Iranian fire on US bases in Kuwait and Bahrain, widening the Gulf clash. *(Reuters Gulf briefing, 18 Nov 2026)*
3. **Nvidia beats, Huang era ends** — earnings beat forecasts; the board shuts the door on ousted CEO Jensen Huang's return. *(Reuters, 18 Nov 2026)*
4. **Voyager 1 a light-day out** — first object ever a full light-day (16.1 billion miles) from Earth, 49 years after launch. *(Smithsonian Magazine / USA Today, 18 Nov 2026)*
5. **Jeffries nominated for Speaker** — House Democrats back Hakeem Jeffries 251–11; he would become the first Black Speaker. *(Reuters-sourced reports, 18 Nov 2026)*
6. **GTA VI arrives tomorrow** — the 13-year wait ends Thursday as Rockstar's long-awaited sequel hits shelves worldwide. *(Reuters, 18 Nov 2026)*

## Run it

```sh
node main.ts
# writes /output/entry.png — locally: MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Built for [make.fun](https://make.fun/?ref=cfpg3p8n) — bounty [news-image-20261118](https://make.fun/bounty/news-image-20261118).</sub>
