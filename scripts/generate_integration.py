#!/usr/bin/env python3
"""
Generate an integration-definition YAML from a Postman Collection
(or any valid Postman/JSON document listing endpoints).

Workflow
--------
1.  Load the JSON spec from disk, stdin, or URL.
2.  Walk each request/endpoint and build a candidate `actions` list
    (method, path, parameter list, etc.).
3.  For each action, call the OpenAI Chat API to obtain concise,
    human-readable descriptions, batching up to 8 endpoints per request.
4.  Generate clear, consistent, and unique action names based on HTTP method
    and URL, de-duplicating collisions with numeric suffixes.
5.  Substitute the domain placeholder with an env var derived from platform.
6.  Assemble a dict with keys: platform, instructions, actions.
7.  Dump as YAML.

You will need:
    pip install pyyaml openai
    export OPENAI_API_KEY="..."

Example:
    python generate_integration.py pardot_collection.json \
           --platform marketing_cloud_account_engagement \
           --out mcae_integration.yaml
"""
import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List
from urllib.parse import urlparse

from openai import OpenAI
import yaml

# Initialize OpenAI client
client = OpenAI()

# --------------------------------------------------------------------------- #
# Helpers: progress bar, naming, params, traversal, descriptions                #
# --------------------------------------------------------------------------- #
class ProgressBar:
    """Minimal progress bar that overwrites a single line."""
    def __init__(self, total: int, width: int = 40) -> None:
        self.total = max(total, 1)
        self.width = width
        self.count = 0

    def update(self) -> None:
        self.count += 1
        filled = int(self.count / self.total * self.width)
        bar = "█" * filled + "-" * (self.width - filled)
        sys.stdout.write(f"\r[{bar}] {self.count}/{self.total}")
        sys.stdout.flush()

    def done(self) -> None:
        sys.stdout.write("\n")


def generate_action_name(method: str, url_tmpl: str) -> str:
    """Generate a clear base name from HTTP method and URL path."""
    parsed = urlparse(url_tmpl)
    segments = [seg for seg in parsed.path.strip('/').split('/')]
    # pick last non-variable segment
    resource = next((seg for seg in reversed(segments)
                     if not seg.startswith('{') and not seg.startswith(':')), '')
    resource = resource.replace('-', '_') or ''
    return f"{method.lower()}_{resource}" if resource else method.lower()


def extract_params(item: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Infer parameters from URL variables and JSON body keys."""
    params: List[Dict[str, Any]] = []
    # Path variables
    for var in item['request']['url'].get('variable', []):
        params.append({'name': var['key'], 'type': 'string', 'required': True})
    # JSON body keys
    body = item['request'].get('body', {})
    if body.get('mode') == 'raw' and isinstance(body.get('raw'), str):
        try:
            body_json = json.loads(body['raw'])
            for key in body_json:
                params.append({'name': key, 'type': 'string', 'required': False})
        except Exception:
            pass
    return params


def count_requests(items: List[Dict[str, Any]]) -> int:
    """Count leaf 'request' entries in a Postman collection."""
    total = 0
    for it in items:
        if 'request' in it:
            total += 1
        else:
            total += count_requests(it.get('item', []))
    return total


def walk_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Flatten Postman 'item' blocks into a spec list."""
    specs: List[Dict[str, Any]] = []
    def _walk(block: List[Dict[str, Any]]) -> None:
        for it in block:
            if 'request' in it:
                method = it['request']['method'].upper()
                url_templ = it['request']['url']['raw'].replace('{{', '{').replace('}}', '}')
                specs.append({
                    'method': method,
                    'url': url_templ,
                    'params': extract_params(it)
                })
            else:
                _walk(it.get('item', []))
    _walk(items)
    return specs


def describe_endpoints_batch(specs: List[Dict[str, Any]]) -> List[str]:
    """Batch up to 8 endpoints per call, returning description list."""
    messages = [
        {'role': 'system', 'content': (
            'You are a senior API technical writer. '
            'Write a single-sentence description for each REST endpoint below. '
            'Respond with a JSON array of descriptions, in the same order.'
        )},
        {'role': 'user', 'content': '\n'.join(f"{i+1}. {s['method']} {s['url']}"
                                             for i, s in enumerate(specs))}
    ]
    completion = client.chat.completions.create(
        model='gpt-4o-mini',
        temperature=0.3,
        messages=messages  # type: ignore[arg-type]
    )
    text = completion.choices[0].message.content
    # try JSON array

    if not isinstance(text, str):
        raise Exception("openai failed to return a response")

    try:
        arr = json.loads(text)
        if isinstance(arr, list) and len(arr) == len(specs):
            return arr
    except Exception:
        pass
    # fallback: parse numbered lines
    descs = []
    import re
    for line in text.splitlines():
        m = re.match(r'^\d+\.\s*(.*)', line)
        if m:
            descs.append(m.group(1))
    if len(descs) == len(specs):
        return descs
    # ultimate fallback
    return [f"{s['method']} {s['url']}" for s in specs]

# --------------------------------------------------------------------------- #
# Main                                                                        #
# --------------------------------------------------------------------------- #

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('spec', type=Path, help='Path to Postman JSON')
    parser.add_argument('--platform', default='salesforce')
    parser.add_argument('--out', default='integration.yaml')
    args = parser.parse_args()

    # derive env var name for domain
    domain_env = args.platform.upper() + '_DOMAIN'

    data = json.loads(Path(args.spec).read_text())
    items = data.get('item', [])
    specs = walk_items(items)

    total = len(specs)
    progress = ProgressBar(total)
    descriptions: List[str] = []
    for i in range(0, total, 8):
        batch = specs[i:i+8]
        descs = describe_endpoints_batch(batch)
        descriptions.extend(descs)
        for _ in batch:
            progress.update()
    progress.done()

    # generate unique names
    name_counts: Dict[str, int] = {}
    actions: List[Dict[str, Any]] = []
    for spec, desc in zip(specs, descriptions):
        base = generate_action_name(spec['method'], spec['url'])
        count = name_counts.get(base, 0) + 1
        name_counts[base] = count
        name = f"{base}_{count}" if count > 1 else base

        # substitute domain placeholder
        url = spec['url'].replace('{domain}', f'${{{domain_env}}}')

        actions.append({
            'name': name,
            'type': 'api',
            'method': spec['method'],
            'url': url,
            'description': desc,
            'inputs': spec['params'],
        })

    integration = {
        'variables': {
            'domain': {'env': domain_env}
        },
        'platform': args.platform,
        'instructions': (
            f"Replace '${{{domain_env}}}' with your API domain for {args.platform}. "
            "Ensure every request carries an OAuth 2.0 Bearer token."
        ),
        'actions': actions,
    }

    Path(args.out).write_text(yaml.safe_dump(integration, sort_keys=False))
    print(f"Wrote {args.out} with {len(actions)} actions.")

if __name__ == '__main__':
    if not os.getenv('OPENAI_API_KEY'):
        raise SystemExit('❌ OPENAI_API_KEY environment variable is not set.')
    main()

