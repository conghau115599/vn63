import { writeFileSync } from "node:fs";
import { createLife } from "../src/simulation/init";
import { advanceMonth } from "../src/simulation/core/advanceMonth";
import { careerRequirements, type Talent } from "../src/simulation/careers";
const rows = [];
for (const goal of ["ATHLETE", "ARTIST"] as Talent[])
  for (const strength of ["GENERAL", goal] as const) {
    let signed = 0,
      totalMonths = 0;
    for (let seed = 0; seed < 100; seed++) {
      let s = createLife({
        legacyDemo: true,
        seed: `career-cohort-${seed}`,
        start: "ADULT",
        strength,
      });
      s.cashVnd = "500000000"; // isolate progression from financing; not a default player balance
      for (let month = 1; month <= 36; month++) {
        const action =
          !s.careerDevelopment.club[goal] &&
          !careerRequirements(s, goal, "JOIN_CLUB").length
            ? "JOIN_CLUB"
            : !careerRequirements(s, goal, "TRYOUT").length
              ? "TRYOUT"
              : undefined;
        let r = advanceMonth(s, {
          yearMonth: s.currentMonth,
          careerPlan: { goal, hours: 10, action },
        });
        while (r.status === "PAUSED")
          r = advanceMonth(r.nextState, {
            yearMonth: r.nextState.currentMonth,
            choice: {
              eventId: r.pendingDecision!.id,
              optionId:
                r.pendingDecision!.templateId === "career-contract"
                  ? "accept"
                  : "decline",
            },
          });
        s = r.nextState;
        if (s.job?.occupation === goal) {
          signed++;
          totalMonths += month;
          break;
        }
      }
    }
    rows.push({
      goal,
      strength,
      seeds: 100,
      signedWithin36Months: signed,
      meanMonthsAmongSigned: signed ? totalMonths / signed : null,
    });
  }
writeFileSync(
  "qa-results/v13-careers-400.json",
  JSON.stringify(
    {
      sourceGrade: "ASSUMPTION",
      purpose:
        "Synthetic progression comparison, not real career probabilities",
      hoursPerWeek: 10,
      initialCashVnd: "500000000",
      rows,
    },
    null,
    2,
  ),
);
let preview = createLife({
  legacyDemo: true,
  seed: "career-browser",
  start: "ADULT",
  strength: "ARTIST",
});
preview.careerDevelopment.goal = "ARTIST";
preview.careerDevelopment.hours = 10;
preview.careerDevelopment.skill.ARTIST = 70;
preview.careerDevelopment.minutes.ARTIST = 36000;
preview.careerDevelopment.portfolio = 40;
writeFileSync("../qa-browser-career.json", JSON.stringify(preview));
console.log(JSON.stringify(rows));
