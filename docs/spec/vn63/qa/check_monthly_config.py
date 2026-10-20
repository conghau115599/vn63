"""Lightweight checks for GDD v1.2 *fixture*, NOT a game runtime test."""
import calendar, json
from pathlib import Path
p = Path(__file__).resolve().parent.parent / 'data' / 'monthly_config.example.json'
cfg = json.loads(p.read_text(encoding='utf-8'))
assert cfg['simulationStep'] == 'calendar_month'
assert cfg['timeUnits']['hoursPerWeek'] == 168
assert cfg['autoAdvance']['simulateEverySkippedMonth']
assert cfg['autoAdvance']['stopOnCriticalDecision']
assert set(cfg['modes']) == {'REALISM', 'HARDSHIP'}
assert [calendar.monthrange(y, 2)[1] for y in (2000, 2024, 2025, 2100)] == [29,29,28,28]
assert 75*12 == 900 and 90*12 == 1080
for year in (2024, 2025):
    assert sum(calendar.monthrange(year,month)[1] for month in range(1,13)) == (366 if year==2024 else 365)
    for month in range(1,13):
        days = calendar.monthrange(year, month)[1]
        assert (168/7)*days == 24*days
print('PASS monthly fixture/calendar assumptions; runtime engine NOT tested')
