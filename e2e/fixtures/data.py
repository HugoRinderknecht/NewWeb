"""
测试数据 fixture
"""
from __future__ import annotations

import pytest

from utils import data_factory as df


@pytest.fixture()
def project_name() -> str:
    return df.project_name()


@pytest.fixture()
def script_name() -> str:
    return df.script_name()


@pytest.fixture()
def storyboard_name() -> str:
    return df.storyboard_name()


@pytest.fixture()
def team_name() -> str:
    return df.team_name()


@pytest.fixture()
def asset_name() -> str:
    return df.asset_name()


@pytest.fixture()
def random_email() -> str:
    return df.random_email()


@pytest.fixture()
def random_phone() -> str:
    return df.random_phone()


@pytest.fixture()
def random_password() -> str:
    return df.random_password()
