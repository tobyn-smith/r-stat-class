# Data final: AI policy documents in AGORA

R code for my INTL 7007 (University of Georgia) data final project. I ask whether who issues a US AI policy, Congress or a federal agency, affects whether it gets enacted, using AGORA document and authority records.

## Data

I use **AGORA v1.32.0**, the AI GOvernance and Regulatory Archive from the [Emerging Technology Observatory](https://eto.tech/) (ETO), a project of the Center for Security and Emerging Technology (CSET) at Georgetown University.

- Tool: https://agora.eto.tech/
- Dataset documentation: https://eto.tech/dataset-docs/agora-dataset/
- This version: https://doi.org/10.5281/zenodo.21964209

## Textbook

Llaudet, E., & Imai, K. (2022). *Data analysis for social science: A friendly and practical introduction*. Princeton University Press.

## Running it

Run `analysis.R` in R. It reads the CSVs in `data/agora/`.
