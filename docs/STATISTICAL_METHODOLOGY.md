# 📐 Statistical Methodology & Trend Engine

EarthTrend Detective employs non-parametric, robust statistical tests designed specifically for environmental time series where normal distribution assumptions fail and outliers are present.

---

## 1. Mann-Kendall Non-Parametric Trend Test

The Mann-Kendall test assesses whether a monotonic upward or downward trend exists in a time series.

### Mathematical Formulation:
Given an environmental series $x_1, x_2, \dots, x_n$:

$$S = \sum_{k=1}^{n-1} \sum_{j=k+1}^n \text{sgn}(x_j - x_k)$$

Where:
$$\text{sgn}(x_j - x_k) = \begin{cases} +1 & \text{if } (x_j - x_k) > 0 \\ 0 & \text{if } (x_j - x_k) = 0 \\ -1 & \text{if } (x_j - x_k) < 0 \end{cases}$$

### Variance with Tie Adjustments:
$$\sigma_S^2 = \frac{1}{18} \left[ n(n-1)(2n+5) - \sum_{t} t(t-1)(2t+5) \right]$$

Where $t$ represents the extent of any tied group.

### Standardized Test Statistic $Z$:
$$Z = \begin{cases} \frac{S - 1}{\sigma_S} & \text{if } S > 0 \\ 0 & \text{if } S = 0 \\ \frac{S + 1}{\sigma_S} & \text{if } S < 0 \end{cases}$$

* A two-tailed test is conducted with significance threshold $\alpha = 0.05$.
* Trend is declared **Statistically Significant** if $p < 0.05$ ($|Z| > 1.96$).

---

## 2. Theil-Sen Robust Median Slope Estimator

The Theil-Sen estimator calculates the median rate of change over time, immune to extreme drought or deluge outliers.

### Mathematical Formulation:
For all pairs of observations $(x_k, t_k)$ and $(x_j, t_j)$ where $j > k$:

$$d_{jk} = \frac{x_j - x_k}{t_j - t_k}$$

$$\text{Sen's Slope} = \text{Median}(d_{jk})$$

* Direction: Positive ($>0$) = Increasing; Negative ($<0$) = Decreasing.
* Unit: Expressed in physical unit per year and scaled to rate per decade ($\times 10$).

---

## 3. Climatological Standardized Anomaly (Z-Score)

To separate genuine climate anomalies from normal seasonal cycles:
1. For each calendar month $m \in \{1, \dots, 12\}$, calculate the reference climatological normal (mean $\mu_m$ and standard deviation $\sigma_m$) over the 2000–2020 baseline.
2. Standardized Z-Score:
   $$Z_{y,m} = \frac{X_{y,m} - \mu_m}{\sigma_m}$$
3. Thresholds:
   - $|Z| \ge 2.5$: Severe Outlier ($p < 0.01$)
   - $1.645 \le |Z| < 2.5$: Moderate Anomaly ($p < 0.10$)
   - $|Z| < 1.645$: Normal Climatological Fluctuation

---

## 4. Cross-Parameter Lag Correlation

Evaluates synchronous and lagged couplings between climate drivers (e.g., rainfall) and ecosystem responses (e.g., soil moisture, vegetation greenness):
- **Pearson Product-Moment Correlation ($r$)**: Linear association.
- **Spearman Rank Correlation ($\rho$)**: Monotonic rank association resilient to non-linearities.
- **Lag Shifts**: $t + 1$ and $t + 2$ months to identify catchment runoff and vegetation flush delays.
- **Ethical Boundary**: Clearly communicated that correlation does **not** equal causation.
