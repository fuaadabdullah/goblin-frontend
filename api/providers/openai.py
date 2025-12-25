"""
OpenAI provider implementation.
"""

from typing import AsyncGenerator, Dict, Any, Union
import json
import httpx
from .base import BaseProvider


class OpenAIProvider(BaseProvider):
    """OpenAI API provider."""

    async def invoke(
        self, prompt: str, stream: bool = False, model: str = "gpt-3.5-turbo", **kwargs
    ) -> Union[AsyncGenerator[Dict[str, Any], None], Dict[str, Any]]:
        """Invoke OpenAI API."""
        if not self.api_key:
            return {
                "ok": False,
                "error": "missing-openai-key",
                "latency_ms": 0,
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        url = self.endpoint.rstrip("/") + (self.invoke_path or "/v1/chat/completions")

        # Build request payload
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": kwargs.get("max_tokens", 512),
            "temperature": kwargs.get("temperature", 0.2),
        }

        if stream:
            payload["stream"] = True
            result = await self._make_request(
                url, payload, headers, kwargs.get("timeout_ms", 30000), stream=True
            )

            if isinstance(result, dict) and not result.get("ok", False):
                return result

            # Return streaming generator
            async def gen():
                async for data in self._stream_sse_response(result):
                    try:
                        parsed = json.loads(data)
                        if "choices" in parsed and parsed["choices"]:
                            choice = parsed["choices"][0]
                            delta = choice.get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield {"text": content, "raw": parsed}
                    except Exception:
                        continue

            return {"ok": True, "stream": gen(), "latency_ms": 0}
        else:
            result = await self._make_request(
                url, payload, headers, kwargs.get("timeout_ms", 30000), stream=False
            )

            if isinstance(result, dict):
                if not result.get("ok", False):
                    return result

                # Extract text from OpenAI response
                data = result["result"]
                if "choices" in data and data["choices"]:
                    choice = data["choices"][0]
                    text = choice.get("message", {}).get("content", "") or choice.get(
                        "text", ""
                    )
                    return {
                        "ok": True,
                        "result": {"text": text, "raw": data},
                        "latency_ms": result["latency_ms"],
                    }

            return {
                "ok": False,
                "error": "invalid-response-format",
                "latency_ms": 0,
            }

    async def _stream_sse_response(
        self, resp: httpx.Response
    ) -> AsyncGenerator[str, None]:
        """Parse SSE response from OpenAI."""
        async for chunk in resp.aiter_bytes():
            parts = chunk.split(b"\n\n")
            for p in parts:
                line = p.strip()
                if not line:
                    continue
                lines = line.split(b"\n")
                for L in lines:
                    s = L.decode(errors="ignore").strip()
                    if s.startswith("data:"):
                        data = s[len("data:") :].strip()
                        if data:
                            yield data
