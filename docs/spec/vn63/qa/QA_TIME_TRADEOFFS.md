# QA — VN63 LIFE TRADEOFFS v1.1

## Unit/invariant

- [ ] Each week: nonnegative hours and total <=168; unassigned hours explicitly account for remainder.
- [ ] Adding 15 paid work hours requires >=15 hours displaced from other categories or a logged revision in mandatory constraints.
- [ ] No policy auto-changes existing NPC promise without a tracked missed commitment.
- [ ] Fatigue/stress remain bounded [0,100]; all slow state smoothers produce bounded values.
- [ ] Mood event +10 is temporary and lifeSatisfaction responds gradually.
- [ ] Repeated gifts plateau; no purchase can restore relationship regardless of historical violations.
- [ ] Career overtime only adds pay under defined contracts; raises chance of advancement conditionally, not deterministically.
- [ ] Cannot borrow, trade, sell an illiquid asset without satisfying contract/market requirements.
- [ ] Cash ledger conserves value; book gains vs realized gains are distinct; inflation not applied twice.
- [ ] Same seed + data/engine version + action trace => identical replay after saving and resuming.
- [ ] Background auto-play does not bypass time, money, fatigue or deferred effects.

## Integration test stories

1. At 25, 40h to 55h paid work: earned compensation may increase (provided contract supports), while available family/wellness/recovery hours decrease; financial security not instantly happiness+.
2. Repeatedly buy gifts while never honoring promises: NPC bond cannot monotonically rise indefinitely.
3. Stable job + 35–45h/week + low risk investing: potential stable normal life, not forced into poverty.
4. 55h/week while paid hourly but low skill/poor economy: fatigue increases; no guaranteed promotion.
5. Caregiving starts: available work or leisure must change; if care outsourced, extra fee applies and NPC relationship does not automatically increase.
6. Business investment financed by debt: delayed returns, obligations continue during revenue downturn, illiquid assets cannot instantly cure cash crunch.
7. HARDSHIP: changes gameplay assumptions clearly, does not alter official provincial data values.
8. Exact same family, market seed and starting state but 3 lifestyle policies: measure multi-dimensional outcomes without a single winner rule.

## Monte Carlo reporting

Group each set by starting income quantile, province, age, initial health and policy. Report wealth distributions, months below financial buffer threshold, relationship memory flags, hours family, health functioning, burnout stress, and variance/95% intervals. Never assert validity of uncalibrated outcome distributions. Do not overfit all modes to identical outcomes.
