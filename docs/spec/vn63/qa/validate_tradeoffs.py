#!/usr/bin/env python3
"""Validate illustrative time ledger and wellbeing weights; not a game engine."""
import json
from pathlib import Path
root = Path(__file__).resolve().parent.parent
obj = json.loads((root/'data/life_tradeoffs.example.json').read_text(encoding='utf-8'))
assert obj['quality'] == 'MODEL_ASSUMPTION'
assert obj['timeBudgetHoursPerWeek'] == 168
cat = set(obj['timeCategories'])
for policy, schedule in obj['exampleAdultSchedules'].items():
    assert set(schedule) == cat, (policy, set(schedule)^cat)
    assert all(isinstance(h, (int, float)) and h>=0 for h in schedule.values()), policy
    assert sum(schedule.values()) == 168, (policy, sum(schedule.values()))
w = obj['wellbeingPrototype']
assert abs(w['barMoodWeight']+w['barSatisfactionWeight']-1) < 1e-12
assert 0 <= w['moodMemoryWeight'] <= 1
assert 0 <= w['lifeSatisfactionMemoryWeight'] <= 1
normal=obj['exampleAdultSchedules']['BALANCED']
heavy=obj['exampleAdultSchedules']['CAREER_SPRINT']
assert heavy['paidWork'] - normal['paidWork']==15
assert sum(normal[k]-heavy[k] for k in cat if k !='paidWork')==15
print('PASS: fixture v1.1 | two 168h schedules | 15h displaced | bounded wellbeing weights')
