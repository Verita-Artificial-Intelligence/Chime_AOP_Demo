import argparse
import json
import re
from pathlib import Path

HEADER = '''"""Auto-generated API client."""
import httpx
import websockets


class APIClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self._client = httpx.AsyncClient(base_url=self.base_url)
'''

CLOSE_METHOD = '''    async def close(self) -> None:
        await self._client.aclose()
'''


def snake_case(name: str) -> str:
    name = re.sub(r"[^a-zA-Z0-9_]", "_", name)
    name = re.sub(r"__+", "_", name)
    return name.lower().strip("_")


def generate(spec: dict) -> str:
    lines = [HEADER]
    paths = spec.get("paths", {})
    for path, ops in paths.items():
        for method, info in ops.items():
            op_id = info.get("operationId") or f"{method}_{path}"
            func_name = snake_case(op_id)
            ws = info.get("x-websocket")
            streaming = info.get("x-streaming")
            if ws:
                lines.append(f"    async def {func_name}(self, **kwargs):")
                lines.append(f"        uri = f'{spec.get('servers', [{'url': ''}])[0]['url']}{path}'")
                lines.append("        async with websockets.connect(uri) as ws:")
                lines.append("            # TODO: implement websocket interaction")
                lines.append("            pass\n")
            elif streaming:
                lines.append(f"    async def {func_name}(self, **kwargs):")
                lines.append(f"        resp = await self._client.request('{method.upper()}', '{path}', params=kwargs, stream=True)")
                lines.append("        async for chunk in resp.aiter_bytes():")
                lines.append("            yield chunk\n")
            else:
                lines.append(f"    async def {func_name}(self, **kwargs):")
                lines.append(f"        resp = await self._client.request('{method.upper()}', '{path}', json=kwargs)")
                lines.append("        return resp.json()\n")
    lines.append(CLOSE_METHOD)
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a simple async client from an OpenAPI spec")
    parser.add_argument("spec", type=Path, help="Path to openapi.json")
    parser.add_argument("output", type=Path, help="Output python file")
    args = parser.parse_args()

    spec_data = json.loads(args.spec.read_text())
    client_code = generate(spec_data)
    args.output.write_text(client_code)
    print(f"Generated {args.output}")


if __name__ == "__main__":
    main()
