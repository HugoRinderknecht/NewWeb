"""
API 辅助工具

用于：
- 在 UI 操作时记录后端 API 调用
- 测试结束后做断言（某个接口被调用、参数/响应符合预期）
- 直接以 API 方式准备测试数据（绕过 UI 加速用例）
"""
from __future__ import annotations

import json
from typing import Any, Optional

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

from core.config import get_config
from core.exceptions import APIError
from core.logger import get_logger

logger = get_logger("api")


class APIClient:
    """轻量 HTTP 客户端。

    用法::

        client = APIClient(base_url="http://api.example.com")
        client.login("user", "pass")
        data = client.get("/api/projects")
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        token: Optional[str] = None,
        timeout: int = 15,
    ) -> None:
        cfg = get_config()
        self.base_url = (base_url or cfg.app.api_base_url).rstrip("/")
        self.token = token
        self.timeout = timeout
        self.session = self._build_session()
        self.last_response: Optional[requests.Response] = None

    def _build_session(self) -> requests.Session:
        s = requests.Session()
        retry = Retry(
            total=3,
            backoff_factor=0.3,
            status_forcelist=(500, 502, 503, 504),
            allowed_methods=frozenset(["GET", "POST", "PUT", "DELETE", "PATCH"]),
        )
        adapter = HTTPAdapter(max_retries=retry)
        s.mount("http://", adapter)
        s.mount("https://", adapter)
        return s

    def _headers(self) -> dict[str, str]:
        h = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def _request(self, method: str, path: str, **kwargs) -> Any:
        url = path if path.startswith("http") else f"{self.base_url}{path}"
        kwargs.setdefault("headers", {}).update(self._headers())
        kwargs.setdefault("timeout", self.timeout)
        self.last_response = self.session.request(method, url, **kwargs)
        if self.last_response.status_code >= 400:
            logger.warning(f"[API] {method} {url} -> {self.last_response.status_code}")
        try:
            return self.last_response.json()
        except Exception:
            return self.last_response.text

    def get(self, path: str, params: Optional[dict] = None) -> Any:
        return self._request("GET", path, params=params)

    def post(self, path: str, data: Optional[dict] = None, json_body: bool = True) -> Any:
        if json_body and data is not None:
            return self._request("POST", path, json=data)
        return self._request("POST", path, data=data)

    def put(self, path: str, data: Optional[dict] = None) -> Any:
        return self._request("PUT", path, json=data)

    def patch(self, path: str, data: Optional[dict] = None) -> Any:
        return self._request("PATCH", path, json=data)

    def delete(self, path: str) -> Any:
        return self._request("DELETE", path)

    def login(self, username: str, password: str) -> dict:
        """登录获取 token。"""
        resp = self.post("/api/auth/login", {"username": username, "password": password})
        token = resp.get("data", {}).get("accessToken") or resp.get("data", {}).get("token") or resp.get("accessToken")
        if not token:
            raise APIError(f"登录响应缺少 token: {resp}")
        self.token = token
        logger.info(f"[API] 登录成功: {username}")
        return resp

    def health_check(self) -> bool:
        try:
            r = self.session.get(self.base_url, timeout=3)
            return r.status_code < 500
        except Exception:
            return False


def assert_api_called(responses: list[dict[str, Any]], url_contains: str, *, method: Optional[str] = None, status: int = 200) -> dict:
    """从 responses 列表中找到匹配的调用并返回。"""
    for r in responses:
        if url_contains in r["url"]:
            if method and r["method"].upper() != method.upper():
                continue
            if r["status"] != status:
                continue
            return r
    raise APIError(f"未找到匹配的 API 调用: {url_contains} (method={method}, status={status})")
