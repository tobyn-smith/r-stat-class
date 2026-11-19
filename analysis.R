## INTL 7007 final project
## does who issues an AI policy affect whether it gets enacted?
## H1: AI policies issued by federal agencies are more likely to be enacted than AI bills proposed in Congress.
## H0: The issuing authority makes no difference to whether an AI policy is enacted.
## data: AGORA v1.32.0 (ETO), https://doi.org/10.5281/zenodo.21964209

## loading the data
documents <- read.csv("data/agora/documents.csv")
authorities <- read.csv("data/agora/authorities.csv")

head(documents[, c("Authority", "Most.recent.activity")])
dim(documents)
dim(authorities)

## View(documents)

## most recent activity
table(documents$Most.recent.activity, exclude = NULL)

## number of different authorities
dim(table(documents$Authority))

## parent group for each authority (from authorities.csv)
documents$parent <- authorities$Parent.authority[match(documents$Authority,
                                                       authorities$Name)]
sum(is.na(match(documents$Authority, authorities$Name)))
table(documents$parent, exclude = NULL)

## issuer: Congress, federal agency or state
documents$issuer <- NA
documents$issuer <- ifelse(documents$Authority == "United States Congress",
                           "Congress", documents$issuer)
documents$issuer <- ifelse(documents$parent == "Federal government" &
                           documents$Authority != "United States Congress",
                           "Federal agency", documents$issuer)
documents$issuer <- ifelse(documents$parent == "State governments",
                           "State", documents$issuer)
table(documents$issuer, exclude = NULL)

## authorities counted as federal agencies
table(documents$Authority[documents$issuer == "Federal agency"])

## keeping Congress, federal agencies and states only
issuers <- documents[!is.na(documents$issuer), ]
table(issuers$issuer, issuers$Most.recent.activity)

## dropping Defunct (DV is proposed or enacted)
policies <- issuers[issuers$Most.recent.activity != "Defunct", ]
policies$enacted <- ifelse(policies$Most.recent.activity == "Enacted", 1, 0)

## N used and dropped
nrow(documents)
nrow(documents) - nrow(issuers)
sum(issuers$Most.recent.activity == "Defunct")
nrow(policies)

## enacted and proposed by issuer
activity_counts <- table(policies$issuer, policies$Most.recent.activity)
activity_counts
sum(activity_counts)

## percentages within each issuer
100 * prop.table(activity_counts, margin = 1)

## share enacted by issuer
congress <- policies$enacted[policies$issuer == "Congress"]
agency <- policies$enacted[policies$issuer == "Federal agency"]
state <- policies$enacted[policies$issuer == "State"]

table(policies$issuer)

pct_enacted <- 100 * c("Congress" = mean(congress),
                       "Federal agency" = mean(agency),
                       "State" = mean(state))
pct_enacted

## 95% confidence intervals
## Congress
100 * (mean(congress) - 1.96 * sqrt(var(congress) / length(congress)))
100 * (mean(congress) + 1.96 * sqrt(var(congress) / length(congress)))

## federal agency
100 * (mean(agency) - 1.96 * sqrt(var(agency) / length(agency)))
100 * (mean(agency) + 1.96 * sqrt(var(agency) / length(agency)))

## state
100 * (mean(state) - 1.96 * sqrt(var(state) / length(state)))
100 * (mean(state) + 1.96 * sqrt(var(state) / length(state)))

## federal agency vs Congress
treatment <- policies[policies$issuer == "Federal agency", ]
control <- policies[policies$issuer == "Congress", ]
n_t <- nrow(treatment)
n_c <- nrow(control)

## difference in means
diff_means <- mean(treatment$enacted) - mean(control$enacted)
100 * diff_means

## standard error
se_diff <- sqrt(var(treatment$enacted) / n_t + var(control$enacted) / n_c)

## 95% confidence interval
100 * (diff_means - 1.96 * se_diff)
100 * (diff_means + 1.96 * se_diff)

## z-statistic and p-values
z_obs <- diff_means / se_diff
z_obs
2 * pnorm(-abs(z_obs))
pnorm(-z_obs)

## reject H0 at 5%?
2 * pnorm(-abs(z_obs)) < 0.05

## same comparison with lm()
two_groups <- policies[policies$issuer != "State", ]
two_groups$agency <- ifelse(two_groups$issuer == "Federal agency", 1, 0)
fit <- lm(enacted ~ agency, data = two_groups)
fit
summary(fit)$coef

## bar charts
png("figures/fig1_pct_enacted_by_issuer.png",
    width = 8, height = 5.5, units = "in", res = 300)
barplot(pct_enacted, ylim = c(0, 100),
        xlab = "Issuer", ylab = "% enacted",
        main = "Share of AI policies enacted, by issuer")
dev.off()

png("figures/fig2_counts_by_issuer.png",
    width = 8, height = 5.5, units = "in", res = 300)
barplot(t(activity_counts), legend.text = TRUE,
        xlab = "Issuer", ylab = "Number of documents",
        main = "AI policy documents by issuer and status")
dev.off()

## check 1: Defunct counted as not enacted
issuers$enacted <- ifelse(issuers$Most.recent.activity == "Enacted", 1, 0)
agency_all <- issuers$enacted[issuers$issuer == "Federal agency"]
congress_all <- issuers$enacted[issuers$issuer == "Congress"]
length(agency_all)
length(congress_all)

diff_defunct <- mean(agency_all) - mean(congress_all)
se_defunct <- sqrt(var(agency_all) / length(agency_all) +
                   var(congress_all) / length(congress_all))
100 * diff_defunct
100 * (diff_defunct - 1.96 * se_defunct)
100 * (diff_defunct + 1.96 * se_defunct)
diff_defunct / se_defunct
2 * pnorm(-abs(diff_defunct / se_defunct))

## check 2: without the Executive Office of the President
agency_no_eop <- policies$enacted[policies$issuer == "Federal agency" &
                                  policies$Authority != "Executive Office of the President"]
length(agency_no_eop)

diff_no_eop <- mean(agency_no_eop) - mean(control$enacted)
se_no_eop <- sqrt(var(agency_no_eop) / length(agency_no_eop) +
                  var(control$enacted) / n_c)
100 * diff_no_eop
100 * (diff_no_eop - 1.96 * se_no_eop)
100 * (diff_no_eop + 1.96 * se_no_eop)
diff_no_eop / se_no_eop
2 * pnorm(-abs(diff_no_eop / se_no_eop))

## check 3: validated rows only
validated <- policies[policies$Validated. == "true", ]
table(validated$issuer, validated$Most.recent.activity)

agency_val <- validated$enacted[validated$issuer == "Federal agency"]
congress_val <- validated$enacted[validated$issuer == "Congress"]
length(agency_val)
length(congress_val)

diff_val <- mean(agency_val) - mean(congress_val)
se_val <- sqrt(var(agency_val) / length(agency_val) +
               var(congress_val) / length(congress_val))
100 * diff_val
100 * (diff_val - 1.96 * se_val)
100 * (diff_val + 1.96 * se_val)
diff_val / se_val
2 * pnorm(-abs(diff_val / se_val))

## numbers for the assuming sentence
round(100 * diff_means, 1)
round(100 * (diff_means - 1.96 * se_diff), 1)
round(100 * (diff_means + 1.96 * se_diff), 1)

## check 4: without the NDAA rows
## each NDAA section is its own row, so one law can add lots of enacted rows
policies$ndaa <- ifelse(grepl("NDAA", policies$Collections), 1, 0)
table(policies$issuer, policies$ndaa)

congress_no_ndaa <- policies$enacted[policies$issuer == "Congress" &
                                     policies$ndaa == 0]
length(congress_no_ndaa)
100 * mean(congress_no_ndaa)

diff_no_ndaa <- mean(agency) - mean(congress_no_ndaa)
se_no_ndaa <- sqrt(var(agency) / length(agency) +
                   var(congress_no_ndaa) / length(congress_no_ndaa))
100 * diff_no_ndaa
100 * (diff_no_ndaa - 1.96 * se_no_ndaa)
100 * (diff_no_ndaa + 1.96 * se_no_ndaa)
diff_no_ndaa / se_no_ndaa
2 * pnorm(-abs(diff_no_ndaa / se_no_ndaa))

## check 5: lm() also holding constant whether the policy mainly applies to government
two_groups$applies_gov <- ifelse(two_groups$Primarily.applies.to.the.government == "true", 1, 0)
table(two_groups$issuer, two_groups$applies_gov)

fit_gov <- lm(enacted ~ agency + applies_gov, data = two_groups)
fit_gov
summary(fit_gov)$coef

## poster charts (bigger text, value labels, clear colours)
## titles live in the poster HTML; all three figures share a 4:3 canvas,
## the same type sizes, and the same bar width
poster_cols <- c("#BA0C2F", "#2AA9B8", "#6E6A63")
poster_par <- function(left = 1.05) {
  par(mai = c(0.85, left, 0.32, 0.32),
      mgp = c(2.6, 0.7, 0),
      bty = "l",
      family = "sans",
      cex.axis = 1.35,
      cex.lab = 1.45,
      las = 1)
}

png("figures/poster_fig1_pct_enacted.png",
    width = 9, height = 6.75, units = "in", res = 300)
poster_par()
bars <- barplot(pct_enacted, ylim = c(0, 103), col = poster_cols,
                border = NA, width = 0.8, space = 0.55,
                cex.names = 1.45,
                xlab = "Issuer", ylab = "% enacted")
text(bars, pct_enacted + 3.2,
     paste0(round(pct_enacted, 1), "%"), cex = 1.4, font = 2, xpd = TRUE)
text(bars, 6, paste0("n = ", c(length(congress), length(agency),
                               sum(policies$issuer == "State"))),
     col = "white", cex = 1.35)
dev.off()

png("figures/poster_fig2_counts.png",
    width = 9, height = 6.75, units = "in", res = 300)
poster_par()
count_bars <- barplot(t(activity_counts), beside = TRUE,
                      col = c("#BA0C2F", "#C8C4BC"), border = NA,
                      ylim = c(0, 280), width = 0.8, space = c(0.18, 0.55),
                      cex.names = 1.45,
                      xlab = "Issuer", ylab = "Number of documents",
                      legend.text = TRUE,
                      args.legend = list(x = "top", bty = "n", cex = 1.35,
                                         inset = 0.01))
text(count_bars, t(activity_counts) + 10, t(activity_counts),
     cex = 1.4, font = 2, xpd = TRUE)
dev.off()

## main result and checks with 95% CIs (check 5 has no CI here, so it is left out)
est <- 100 * c(diff_means, diff_defunct, diff_no_eop, diff_val, diff_no_ndaa)
ses <- 100 * c(se_diff, se_defunct, se_no_eop, se_val, se_no_ndaa)
labels <- c("Main result", "Defunct as\nnot enacted", "Without EOP",
            "Validated\nrows only", "Without NDAA\nsections")

png("figures/poster_fig3_checks.png",
    width = 9, height = 6.75, units = "in", res = 300)
poster_par(left = 2.1)
plot(est, 5:1, xlim = c(-40, 100), ylim = c(0.35, 5.55), pch = 19, cex = 1.8,
     col = c("#BA0C2F", rep("#2AA9B8", 4)), yaxt = "n",
     xlab = "Agency minus Congress (percentage points)", ylab = "")
segments(est - 1.96 * ses, 5:1, est + 1.96 * ses, 5:1, lwd = 3.5,
         col = c("#BA0C2F", rep("#2AA9B8", 4)))
abline(v = 0, lty = 2)
axis(2, at = 5:1, labels = labels, las = 1, cex.axis = 1.35, tick = FALSE)
text(est, 5:1 + 0.28, paste0(sprintf("%+.1f", est)), cex = 1.4, font = 2,
     xpd = TRUE)
dev.off()

## unique Congress bills (one link can cover several section rows)
length(unique(policies$Link.to.document[policies$issuer == "Congress"]))

## summaries that may include unreviewed machine output
table(policies$Summaries.and.tags.may.include.unreviewed.machine.output)
sum(policies$Summaries.and.tags.may.include.unreviewed.machine.output == "true")

## the four federal agency rows that went Defunct
defunct_agency <- issuers[issuers$issuer == "Federal agency" &
                          issuers$Most.recent.activity == "Defunct", ]
defunct_agency[, c("Official.name", "Authority",
                   "Proposed.date", "Most.recent.activity.date")]

## text analysis of the short summaries
## drop stop words, months, drafting words and US state names
stops <- c(
  "a", "about", "after", "again", "against", "all", "also", "an", "and", "any",
  "are", "as", "at", "be", "because", "been", "before", "being", "between",
  "both", "but", "by", "can", "did", "do", "does", "doing", "down", "during",
  "each", "few", "for", "from", "further", "had", "has", "have", "having",
  "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
  "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more",
  "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on",
  "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over",
  "own", "same", "she", "should", "so", "some", "such", "than", "that",
  "the", "their", "theirs", "them", "themselves", "then", "there", "these",
  "they", "this", "those", "through", "to", "too", "under", "until", "up",
  "very", "was", "we", "were", "what", "when", "where", "which", "while",
  "who", "whom", "why", "will", "with", "you", "your", "yours", "yourself",
  "yourselves",
  "january", "february", "march", "april", "may", "june", "july", "august",
  "september", "october", "november", "december",
  "act", "acts", "bill", "bills", "section", "sections", "title", "titles",
  "law", "laws", "requires", "require", "establishes", "establish",
  "amends", "amend", "directs", "authorizes", "provides", "provide",
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado",
  "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho",
  "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine",
  "maryland", "massachusetts", "michigan", "minnesota", "mississippi",
  "missouri", "montana", "nebraska", "nevada", "ohio", "oklahoma", "oregon",
  "pennsylvania", "tennessee", "texas", "utah", "vermont", "virginia",
  "washington", "wisconsin", "wyoming", "hampshire", "jersey", "mexico",
  "york", "carolina", "dakota", "columbia", "rhode"
)

clean_words <- function(text) {
  text <- tolower(paste(text, collapse = " "))
  text <- gsub("[^a-z]+", " ", text)
  words <- unlist(strsplit(text, " "))
  words <- words[words != ""]
  words <- words[nchar(words) >= 3]
  words[!(words %in% stops)]
}

congress_words <- clean_words(policies$Short.summary[policies$issuer == "Congress"])
agency_words <- clean_words(policies$Short.summary[policies$issuer == "Federal agency"])
state_words <- clean_words(policies$Short.summary[policies$issuer == "State"])

congress_tab <- sort(table(congress_words), decreasing = TRUE)
agency_tab <- sort(table(agency_words), decreasing = TRUE)
state_tab <- sort(table(state_words), decreasing = TRUE)

length(congress_words)
length(agency_words)
length(state_words)
head(congress_tab, 10)
head(agency_tab, 10)
head(state_tab, 10)

## tf-idf, treating each issuer as one bag of words
## tf = count / total words; idf = log(3 / how many issuers use the word)
all_words <- unique(c(names(congress_tab), names(agency_tab), names(state_tab)))
n_issuers <- (all_words %in% names(congress_tab)) +
  (all_words %in% names(agency_tab)) +
  (all_words %in% names(state_tab))
idf <- log(3 / n_issuers)
names(idf) <- all_words

congress_tfidf <- sort((as.numeric(congress_tab) / length(congress_words)) *
                       idf[names(congress_tab)], decreasing = TRUE)
agency_tfidf <- sort((as.numeric(agency_tab) / length(agency_words)) *
                     idf[names(agency_tab)], decreasing = TRUE)
state_tfidf <- sort((as.numeric(state_tab) / length(state_words)) *
                    idf[names(state_tab)], decreasing = TRUE)

head(congress_tfidf, 10)
head(agency_tfidf, 10)
head(state_tfidf, 10)

## how alike is the language? word shares for words used by both issuers
shared_ca <- intersect(names(congress_tab), names(agency_tab))
cor(as.numeric(congress_tab[shared_ca]) / length(congress_words),
    as.numeric(agency_tab[shared_ca]) / length(agency_words))
length(shared_ca)

shared_cs <- intersect(names(congress_tab), names(state_tab))
cor(as.numeric(congress_tab[shared_cs]) / length(congress_words),
    as.numeric(state_tab[shared_cs]) / length(state_words))
length(shared_cs)
