# Fact sheet for the INTL 7007 Quarto paper

Use this to write the 5 to 10 page, double-spaced paper yourself. It is not the paper.

Numbers below are from `Rscript analysis.R` on AGORA v1.32.0 in this repo (19 Nov 2026). Do not copy the interpretation sentences already in `tobyn_data_final.qmd`, the poster, or `AUDIT.md`. Course policy: LLM-written interpretation is marked down. Write those sections in your own words.

Paper format still to do: a Quarto file with `format: pdf`, double spacing, and a proper bibliography. `tobyn_data_final.qmd` is a code notebook, not that paper.

---

## Research question and hypothesis (10)

Facts only. The wording in the script header (`analysis.R` lines 1 to 4) and in `tobyn_data_final.qmd` (section "Research question and hypotheses") is:

- Research question: Does who issues an AI policy affect whether it gets enacted?
- H1: AI policies issued by federal agencies are more likely to be enacted than AI bills proposed in Congress.
- H0: The issuing authority makes no difference to whether an AI policy is enacted.
- Comparison used in the test: federal agency versus Congress. States are coded and shown in tables, then left out of the difference-in-means and `lm()` models (`two_groups` drops State).
- Outcome in the test: `enacted` = 1 if `Most.recent.activity == "Enacted"`, 0 if Proposed. Defunct rows are dropped in the main sample (chunk `dropping-defunct`).
- The repo does not store a separate "why this question" paragraph that is required for the mark. Background citations on the poster (Binder 1999; *Loper Bright* 2024) are not in the Quarto YAML bibliography yet.

---

## Data description (10)

Source and files:

- Dataset: Arnold, Z., Melot, J., Enwereazu, O., Schiff, D. S., Schiff, K. J., and Girard, T. (2026). *AGORA Dataset* (Version 1.32.0). Zenodo. https://doi.org/10.5281/zenodo.21964209
- Producer: Emerging Technology Observatory (ETO), Center for Security and Emerging Technology (CSET), Georgetown.
- Local files: `data/agora/documents.csv`, `data/agora/authorities.csv`. Also in the folder, unused by the script: `segments.csv`, `collections.csv`.
- Code that loads them: `analysis.R` lines 8 to 9; Quarto chunk `load-data`.

Raw size (chunk `first-look`):

- `documents`: 1,251 rows, 100 columns.
- `authorities`: 105 rows, 3 columns (`Name`, `Jurisdiction`, `Parent.authority`).
- Unique `Authority` values in `documents`: 98.
- `Most.recent.activity` in all 1,251 rows: Enacted 546, Proposed 283, Defunct 422.

Unit and coverage:

- Unit of analysis: one AGORA document row.
- Congress rows can be sections of the same bill. Unique `Link.to.document` among Congress rows in the analysis sample: 177 (`analysis.R` after the poster figures).
- Dates on the analysis sample (`policies`): `Most.recent.activity.date` from 2017-06-27 to 2026-12-10. Non-empty `Proposed.date`: 2017-01-18 to 2026-12-10. Empty `Proposed.date` in `policies`: 142 of 706.

Variables used:

- Treatment / issuer coding (chunks `parent-group`, `issuer`):
  - Match `documents$Authority` to `authorities$Name`; copy `Parent.authority`. Unmatched: 0.
  - Parent counts on all 1,251 rows: Federal government 792, State governments 334, Local governments 20, blank 105.
  - Congress: `Authority == "United States Congress"` (735 rows before dropping Defunct).
  - Federal agency: parent is Federal government and authority is not United States Congress (57 rows before dropping Defunct).
  - State: parent is State governments (334 rows before dropping Defunct).
  - Left as missing issuer: 125 rows (local governments, blank parent, and other national governments).
- Outcome: `Most.recent.activity`; dummy `enacted` in chunk `dropping-defunct`.
- Checks also use: `Validated.`, `Collections` (NDAA string), `Primarily.applies.to.the.government`, `Authority` (EOP drop), `Short.summary` (text analysis), `Summaries.and.tags.may.include.unreviewed.machine.output`.

Cleaning / sample construction (chunk `dropping-defunct` and the printed N lines):

- Start: 1,251.
- Drop missing issuer: 125. Left: 1,126.
- Among those 1,126, Defunct by issuer: Congress 371, federal agency 4, state 45. Total Defunct dropped: 420.
- Analysis sample `policies`: **N = 706**.
- Cross-tab `issuer` × `Most.recent.activity` on `policies` (chunk `activity-counts`):

| Issuer | Enacted | Proposed | Row n |
| --- | ---: | ---: | ---: |
| Congress | 196 | 168 | 364 |
| Federal agency | 48 | 5 | 53 |
| State | 218 | 71 | 289 |

- `Validated.` in `policies`: false 483, true 223.
- Machine-output flag in `policies`: false 388, true 318.

Federal agency authorities in `policies` (n = 53), from `table(documents$Authority[documents$issuer == "Federal agency"])` after the Defunct drop is equivalent to counting on `policies`: Executive Office of the President 18, FDA 12, Department of Commerce 5, Copyright Office 3, HHS 3, OPM 2, and one each of CFPB, USDA, DoD, Education, HUD, Treasury, Transportation, FEC, NIST, OSTP.

The four Defunct federal agency rows (not in `policies`; printed at the end of `analysis.R`):

- Framework for Artificial Intelligence Diffusion, Department of Commerce, proposed 2025-01-13, activity date 2025-05-13.
- Advancing Governance, Innovation, and Risk Management for Agency Use of Artificial Intelligence, OMB, 2024-03-28 to 2025-04-03.
- Advancing the Responsible Acquisition of Artificial Intelligence in Government, OMB, 2024-10-03 to 2025-04-03.
- Executive Order on the Safe, Secure, and Trustworthy Development and Use of Artificial Intelligence, EOP, 2023-10-30 to 2025-01-20.

Licence / terms: CC BY-NC 4.0 per ETO, as in the README.

---

## Methods and reproducible code (15)

How to rerun:

- From the repo root: `mkdir -p figures` then `Rscript analysis.R`.
- Optional: `quarto render tobyn_data_final.qmd`.
- Base R only in the analysis (`utils`, `stats`, `graphics`, `grDevices`). No extra packages.

What each file does:

- `analysis.R`: full pipeline, tables, tests, PNG figures, text analysis.
- `tobyn_data_final.qmd`: same coding and tests as the script, in labelled chunks, through check 5. Text analysis is described in prose and is not its own Quarto chunk; those tables are printed only by `analysis.R`.
- `poster/`: phone page. Not required for the paper methods, unless you cite it as a supplement.
- `data/agora/`: CSVs.

Main estimator (chunks `difference-in-means`, `regression`):

- Sample for the test: `policies` with issuer Congress or Federal agency. n_t = 53, n_c = 364. Combined `two_groups` n = 417.
- Difference in means: mean(agency `enacted`) − mean(Congress `enacted`).
- SE: `sqrt(var(treatment$enacted)/n_t + var(control$enacted)/n_c)`.
- 95% CI: estimate ± 1.96 × SE.
- Test: z = estimate / SE; two-sided p from `2 * pnorm(-abs(z_obs))`; reject H0 at 5% if that p is under 0.05.
- Same slope from `lm(enacted ~ agency)` on `two_groups`. `summary(fit)$coef` uses a t-test, so the p-value is not the same as the z-test.

Checks (what the code does, not what they "mean"):

1. Chunk `check-defunct`: keep Defunct; `enacted` still 1 only if Enacted. Agency n = 57, Congress n = 735.
2. Chunk `check-no-eop`: drop `Authority == "Executive Office of the President"` from agency. Remaining agency n = 35. Congress still 364.
3. Chunk `check-validated`: keep `Validated. == "true"`. Agency n = 26, Congress n = 160.
4. Chunk `check-ndaa`: `ndaa = 1` if `Collections` matches `NDAA`. NDAA rows: Congress 148, agency 0, state 0. Congress without NDAA: n = 216.
5. Chunk `check-applies-gov`: `lm(enacted ~ agency + applies_gov)` on `two_groups`. `applies_gov` from `Primarily.applies.to.the.government == "true"`. Cross-tab: Congress false 159 / true 205; agency false 32 / true 21.

Text analysis (`analysis.R` after the unique-bills line; function `clean_words`):

- Input: `Short.summary`.
- Tokens: lowercase, letters only, length at least 3, then drop the stop / month / drafting / state list in `stops`.
- Each issuer is one bag of words. tf-idf = (count / issuer total) × log(3 / number of issuers that use the word).
- Word-share Pearson correlation on words used by both issuers.

Figures the code writes:

- `figures/fig1_pct_enacted_by_issuer.png` (chunk `save-figures` / `pct-enacted-chart`).
- `figures/fig2_counts_by_issuer.png` (chunk `save-figures` / `counts-chart`).
- `figures/poster_fig1_pct_enacted.png`, `poster_fig2_counts.png`, `poster_fig3_checks.png` (`analysis.R` only).

Not in the repo yet (methods mark): a named Track 1 or Track 2 methods note; a bibliography file; `linestretch: 2` (or equivalent) in Quarto YAML; clustered standard errors; one row per bill.

---

## Results (20), numbers only

Main sample shares (chunk `activity-counts` and `group-intervals`):

- Congress: 53.84615% enacted. 95% CI 48.71773 to 58.97458.
- Federal agency: 90.56604% enacted. 95% CI 82.62122 to 98.51086.
- State: 75.43253% enacted. 95% CI 70.46066 to 80.40439.

Agency minus Congress (chunks `difference-in-means`, `sentence-numbers`):

- Difference: 36.71988 percentage points.
- 95% CI: 27.26362 to 46.17615.
- Rounded for the template sentence: 36.7, 27.3, 46.2.
- z = 7.610931.
- Two-sided p = 2.721295e-14. One-sided p = 1.360647e-14.
- `2 * pnorm(-abs(z_obs)) < 0.05` prints `TRUE`.

`lm(enacted ~ agency)` (chunk `regression`):

- Intercept 0.5384615 (Congress mean as a proportion).
- `agency` 0.3671988 (same as the difference as a proportion).
- SE of `agency` 0.07033863; t = 5.220443; p = 2.827761e-07.

Check 1, Defunct as not enacted (chunk `check-defunct`):

- Difference 57.54386 points. CI 47.47171 to 67.61601. z = 11.1978. p = 4.17978e-29.

Check 2, without EOP (chunk `check-no-eop`):

- Difference 37.58242 points. CI 26.86577 to 48.29907. z = 6.873559. p = 6.261965e-12.

Check 3, validated rows only (chunk `check-validated`):

- Table: Congress Enacted 159, Proposed 1; federal agency Enacted 25, Proposed 1; state Enacted 25, Proposed 12.
- Difference −3.221154 points. CI −10.8585 to 4.41619. z = −0.8266567. p = 0.4084317.

Check 4, without NDAA sections (chunk `check-ndaa`):

- Congress enacted share on the 216 non-NDAA rows: 22.22222%.
- Difference 68.34382 points. CI 58.6483 to 78.03933. z = 13.81607. p = 2.039083e-43.

Check 5, `lm(enacted ~ agency + applies_gov)` (chunk `check-applies-gov`):

- Intercept 0.1164733. `agency` 0.4923000 (SE 0.04458397, t = 11.042085, p = 5.073422e-25). `applies_gov` 0.7492864 (SE 0.02980550, t = 25.139196, p = 2.397216e-85).
- No 95% CI for this model is printed in `analysis.R` (the forest plot leaves check 5 out for that reason).

Text analysis (`analysis.R` printout; not a Quarto chunk):

- Token totals after cleaning: Congress 8,258; federal agency 1,366; state 7,031.
- Highest raw counts, Congress: secretary 155, defense 150, intelligence 129, artificial 90, national 86.
- Highest raw counts, agency: federal 16, systems 13, use 13, risk 12, software 12.
- Highest raw counts, state: use 111, systems 67, state 64, artificial 61, prohibits 60.
- Highest tf-idf, Congress: director 0.005587517, congressional 0.003059831, navy 0.002261614, guard 0.001995542, coast 0.001862506, supply 0.001862506, maritime 0.001729470, administrator 0.001596433, dod 0.001463397, homeland 0.001330361.
- Highest tf-idf, agency: efficacy, hazard, icts, ideological, labeling, rate each 0.003217020 (n = 4); cardiovascular, inventors, usda 0.002412765 (n = 3); device 0.001780959 (n = 6).
- Highest tf-idf, state: sexual 0.002343790, generative 0.002133723, media 0.002133723, altered 0.002031284, political 0.002031284.
- Shared-word share correlation, Congress vs agency: 0.4242353 (480 words).
- Shared-word share correlation, Congress vs state: 0.4558262 (917 words).
- The live poster at https://tobynsmith.me/data/ reports agency r as 0.43. That dump is `poster/assets/data.json`. It is not the printout of this `analysis.R` stop list. For the paper, use 0.4242353 unless you change the script and rerun.

---

## Results: interpretation (part of 20)

Do not paste conclusions. Write this part yourself. Questions you can answer from the numbers above:

- What does a 36.7 point gap (CI 27.3 to 46.2) describe, if you treat issuer as given rather than assigned?
- The code comments say Congress and agency rows are treated as comparable. Which facts in the Data section speak to that, and which speak against it?
- Check 3 p = 0.41 and the 159/160 enacted Congress validated rows: how much can that check move your view of H1, given that table?
- Check 4 drops 148 Congress NDAA rows and the Congress enacted share on the rest is 22.2%. What does that do to how you read a Congress "row"?
- Check 5 holds constant `applies_gov`. The `agency` coefficient is 0.4923. What question does that coefficient still not answer?
- Text-analysis r = 0.42 (480 shared words) versus 0.46 for states: what does that say, if anything, about whether the bags of words look alike? (State the correlation. Do not claim a cause.)
- Agency n = 53. How should that enter the write-up of precision, without restating the CI as a policy finding?
- The z p-value and the `lm()` t p-value differ. Which one matches the method you named in the methods note?

Template numbers for the Llaudet-style sentence (chunk `sentence-numbers` only; you decide whether the assumption is reasonable): 36.7 percentage points; 27.3 to 46.2.

---

## Policy implications (10)

No recommendations in this file. Questions only. Point at results; do not answer them here.

- If agency documents in this sample are enacted at 90.6% and Congress rows at 53.8%, what (if anything) does that imply for who writes US AI rules that are "on the books"?
- Four agency rows in this extract went Defunct in 2025 (listed under Data). What question does that raise about durability, separate from the enactment dummy?
- What would you want a tracker to flag, given that Defunct is a status in AGORA and was dropped from the main DV?
- What would you want Congress to do, if anything, that you can actually support with these tables rather than with *Loper Bright* or Binder?
- Which limitation (row = section, n = 53, 318 of 706 machine-flagged summaries, no random assignment) would change a policy claim if it were handled first?

Binder (1999) and *Loper Bright* (2024) are used on the poster. They are not estimated in `analysis.R`. If you use them, cite them as legal / political science context, not as output of the script.

---

## Track 1 or Track 2 methods note

The repo does not label a track. You need a short note in the paper that names one.

What the code actually contains:

- A binary outcome, a binary treatment (agency vs Congress), a difference in means, a 95% CI, and a z-test. That is the main result (chunks `difference-in-means` and `regression` without covariates).
- A second `lm()` that adds one covariate, `applies_gov` (chunk `check-applies-gov`). No other controls. No experiment. No matching. No clustered SE.

If the assignment’s Track 1 is the single-variable difference in means: the methods note can point at chunk `difference-in-means` and quote z, CI, and N = 417 in `two_groups`.

If Track 2 is regression with a control: the methods note can point at chunk `check-applies-gov` and quote the `agency` coefficient 0.4923. Say plainly that this is still observational, with one covariate.

If the brief is something else (experiment, RDD, and so on): that design is not in the repo.

---

## Writing quality and structure (5)

Not covered by the repo. You write the paper. Practical gaps:

- No 5 to 10 page double-spaced Quarto PDF yet.
- `tobyn_data_final.qmd` still mixes code dump and prose; the paper should read as sections, not as a script with comments.
- Citations: dataset is in the qmd footer. Binder, Llaudet and Imai (2022), and *Loper Bright* need a `.bib` (or equivalent) if you use them.
- British English, short paragraphs, no claims that are not in the Results tables.

---

## Rubric items the repo does not yet cover

- A finished Quarto paper (length, double spacing, bibliography).
- An explicit Track 1 or Track 2 methods note (see above).
- Interpretation and policy sections in your own words (do not lift them from the poster or the qmd).
- Text-analysis tables inside the Quarto paper (they exist only in `analysis.R` output).
- Clustered standard errors or one-row-per-bill estimates (named as next steps in the qmd; not coded).
- Agreement on r = 0.42 (`analysis.R`) versus r = 0.43 (`poster/assets/data.json` / live `/data/` page).
