"""Only validates sample artifact structure; production Codex must add stricter Zod/DSL validation."""
import json, pathlib, collections
from math import isclose
from jsonschema import Draft202012Validator
root = pathlib.Path(__file__).resolve().parents[1]
provinces=json.loads((root/'data/province_63_2024.json').read_text(encoding='utf-8'))
assert len(provinces['provinces']) == 63
assert len(set(p['id'] for p in provinces['provinces'])) == 63
assert sum(p['kind']=='municipality' for p in provinces['provinces']) == 5
pack=json.loads((root/'examples/events.sample.json').read_text(encoding='utf-8'))
schema=json.loads((root/'schemas/events.sample.schema.json').read_text(encoding='utf-8'))
Draft202012Validator(schema).validate(pack)
ids=[]
for ev in pack['events']:
    ids.append(ev['id'])
    for ch in ev['choices']:
        groups=collections.defaultdict(float)
        for outcome in ch['outcomes']:
            key=outcome.get('whenHidden',{}).get('identity','ANY')
            groups[key]+=outcome['weight']
        for key,total in groups.items():
            assert isclose(total,1.0,abs_tol=1e-8), (ev['id'],ch['id'],key,total)
assert len(set(ids))==len(ids)
for f in root.rglob('*.json'):
    json.loads(f.read_text(encoding='utf-8'))
print(f'PASS: 63 province names, {len(ids)} demo events, mode profiles, JSON schema valid, outcome partitions sum to 1')
