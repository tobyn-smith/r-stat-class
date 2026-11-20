# Data final: AI policy documents in AGORA

R code for my INTL 7007 (University of Georgia) data final. I ask whether who issues an AI policy is linked to whether it is enacted, using AGORA document and authority records.

The printed poster is layout C. The interactive version is at https://tobynsmith.me/data/ (in the `tobyn-smith/me` repo). This repository is the R work behind it.

A longer, phone-only write-up sits in `poster/`. I open it from a QR code on the printed poster. It is hosted from `tobyn-smith/me` at https://tobynsmith.me/data/scan/. The print QR files are `poster/qr/poster-phone.svg` and `poster/qr/poster-phone.png`. They point at that URL.

The page is unlisted: `noindex, nofollow`, a `robots.txt` that disallows crawling, and no sitemap. It is not the same page as https://tobynsmith.me/data/.

## How to run

Requirements:

- R
- Base R packages only (`utils`, `stats`, `graphics`, `grDevices`). No additional packages are loaded.
- Optional: [Quarto](https://quarto.org/) to render `tobyn_data_final.qmd`

From the repository root:

```bash
mkdir -p figures
Rscript analysis.R
```

`analysis.R` reads `data/agora/documents.csv` and `data/agora/authorities.csv` and writes PNG figures to `figures/`. It also prints the word counts and the word-share correlations (`cor()` and `cor.test()`). An appendix prints the tf-idf table.

To render the Quarto notebook:

```bash
quarto render tobyn_data_final.qmd
```

## Data

I use **AGORA v1.32.0**, the AI GOvernance and Regulatory Archive from the [Emerging Technology Observatory](https://eto.tech/) (ETO), a project of the Center for Security and Emerging Technology (CSET) at Georgetown University.

- Tool: https://agora.eto.tech/
- Dataset documentation: https://eto.tech/dataset-docs/agora-dataset/
- This version: https://doi.org/10.5281/zenodo.21964209

CSV files from that release are in `data/agora/` (`documents.csv`, `segments.csv`, `authorities.csv`, `collections.csv`). The analysis reads the document and authority tables. `segments.csv` and `collections.csv` are in the folder because they came with the release. The NDAA check uses the Collections column on `documents.csv`, not `collections.csv`.

ETO Resources, including this dataset, are licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/), per the [ETO Terms of Use](https://eto.tech/tou). The AGORA dataset documentation states that the data are subject to those terms; users should cite ETO. The dataset includes full text of governance documents taken from official sources; ETO believes that material is open to non-commercial use consistent with the terms, but makes no warranties.

Arnold, Z., Melot, J., Enwereazu, O., Schiff, D. S., Schiff, K. J., & Girard, T. (2026). *AGORA Dataset* (Version 1.32.0) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.21964209

## Textbook

Llaudet, E., & Imai, K. (2022). *Data analysis for social science: A friendly and practical introduction*. Princeton University Press.
