"""测试用例级 conftest。

导入 fixtures 包中的共享 fixtures，使它们对所有测试可见。
"""
import pytest

# 导入共享 fixtures —— pytest 会自动发现模块级 @pytest.fixture
from fixtures.auth import (  # noqa: F401
    admin_logged_in,
    team_admin_logged_in,
    member_logged_in,
    login_page,
    admin_page,
    team_admin_page,
    member_page,
)
from fixtures.data import (  # noqa: F401
    project_name,
    script_name,
    storyboard_name,
    team_name,
    asset_name,
    random_email,
    random_phone,
    random_password,
)


@pytest.fixture(autouse=True)
def _setup_test_context(request):
    """自动注入测试上下文（模块名、测试数据等）。"""
    request.node.test_module = request.node.module.__name__ if hasattr(request.node, "module") else "unknown"
    yield
