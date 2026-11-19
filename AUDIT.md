# Audit notes (INTL 7007)

What I found, what I changed, and what still needs a decision. Numbers below are from `Rscript analysis.R` on AGORA v1.32.0 in this repo.

## What already worked

- `analysis.R` runs in base R and the main result matches the live poster at https://tobynsmith.me/data/:
  - N = 706 (1,251 documents, 125 other authorities dropped, 420 Defunct dropped among the rest).
  - Congress 364 (196 enacted, 53.8%), federal agency 53 (48 enacted, 90.6%), state 289 (218 enacted, 75.4%).
  - Agency minus Congress: **+36.7 points** (95% CI 27.3 to 46.2; z = 7.61; p < 0.001).
  - Checks: Defunct as not enacted +57.5; without EOP +37.6; validated rows only -3.2 (p = 0.41); without NDAA sections +68.3; `lm(enacted ~ agency + applies_gov)` agency slope 0.49.
- Unique Congress document links: **177**, which matches the poster.
- Summaries flagged as maybe unreviewed machine output: **318 of 706**.
- The four 2025 Defunct agency rules match the poster list.

## What was wrong or missing

- `tobyn_data_final.qmd` still had `[text]` placeholders and stopped before checks 4 and 5. Filled in, and added the NDAA and applies-to-government checks.
- Text analysis was on the live poster (JavaScript + `data.json`) but not in this repo. I appended a base-R version to `analysis.R`. Same top tf-idf words as the poster (director / ideological / sexual). Word-share r is **0.42** (agency) and **0.46** (states) in this script. The live poster reports agency r as **0.43**. Close, not identical: the original tokeniser was never committed here.
- `segments.csv` and `collections.csv` are unused by the script. Left in place (they are part of the AGORA dump). Noted in the README.
- No broken paths in the README once `figures/` is created. The script does not create that folder; the README already says `mkdir -p figures`.
- `lm()` and the z-test agree on the slope. They do not agree on the p-value (t versus z). The poster correctly quotes the z-test.
- Validated-rows check is a selected sample: 159 of 160 validated Congress rows are already enacted. The "gap goes away" result is not a strong falsification on its own.

## Authorship

- This repo has **one** commit on `main`: `b98d39e`, author and committer `tobyn <298003421+tobyn-smith@users.noreply.github.com>`. No `Co-authored-by`. GitHub contributors list: **tobyn-smith** only. Collaborators: **tobyn-smith** only.
- GitHub name on that commit is `tobyn`, not `tobyn-smith`. Email is the GitHub noreply address. I did not rewrite history.
- New commits use author and committer `tobyn-smith <298003421+tobyn-smith@users.noreply.github.com>`.

## Hosting

- Phone page lives in `poster/` and is meant for GitHub Pages on this repo: https://tobyn-smith.github.io/r-stat-class/
- I did **not** change https://tobynsmith.me/data/.
- QR files: `poster/qr/poster-phone.svg` and `poster/qr/poster-phone.png`.

## Open decisions

1. **r = 0.43 (printed poster) versus 0.42 (`analysis.R`).** Pick one before Monday if both will be seen together.
2. **Turn on GitHub Pages** for this repo (Actions source, `poster/` deployed by `.github/workflows/pages.yml`) if it is not on already. Until that is on, the QR URL will 404.
3. **Put the phone page on tobynsmith.me instead** (for example `/data/scan/`), still unlisted. I did not do that, because it would be a second repo and I was asked not to touch `/data/` without saying so.
4. **Whether to update `/data/`** so the printed interactive poster and this R script tell the same story on text analysis. I left it alone.
5. **History name `tobyn` versus `tobyn-smith`.** Changing the old commit would need a rewrite and a force-push. I left it.

## R style I matched

I treated **this repo's own `analysis.R`** as the style to copy, because it is the class project. I also read `tobyn-smith/transit` (`scripts/00_download.R`, `01_clean.R`, `02_analysis.R`, `03_eurostat.R`) and `tobyn-smith/energyosint` (`analysis/exposure_map.R`). Those other repos use tidyverse, `|>`, `library()`, and more functions. This class file does not.

Habits I kept here:

- One top-to-bottom script, `##` comments in plain English, no roxygen.
- Base R (`read.csv`, `ifelse`, `table`, `match`, `lm`, `barplot`). No tidyverse, no magrittr pipes.
- Names like `diff_means`, `se_diff`, `pct_enacted`.
- Almost no functions. The file already had `poster_par`; I added only `clean_words` so I did not paste the same `gsub` three times.
- Leave results as printed expressions, not a packaged summary function.

I did not rewrite the analysis he already had. I appended the extra counts and the text analysis.
