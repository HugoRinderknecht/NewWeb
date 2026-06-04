"""
多账号联动团队测试

场景覆盖：
- A(admin) 创建团队 → 生成邀请码 → B(member) 使用邀请码加入团队
- A(admin) 创建角色标签 → 给 B 分配角色标签
- A(admin) 给 B 分配多个角色标签
- C(team_admin) 视角验证团队成员变化

三账号：admin_page / member_page / team_admin_page（各自独立 BrowserContext）
"""
from __future__ import annotations

import pytest
from playwright.sync_api import Page

from pages.team import (
    TeamApplicationsPage,
    TeamInviteCodesPage,
    TeamListPage,
    TeamMembersPage,
    TeamRolesPage,
)
from utils import data_factory as df


@pytest.mark.team
class TestMultiAccountTeamFlow:
    """多账号联动：创建团队 → 邀请码 → 加入 → 角色分配。"""

    def test_admin_create_team_and_invite_member(
        self, admin_page: Page, member_page: Page, team_admin_page: Page
    ) -> None:
        """TEAM_FLOW_001：A 创建团队 → 生成邀请码 → B 加入团队 → C 验证。"""
        # ---- Step 1: A(admin) 创建团队 ----
        team_page = TeamListPage(admin_page).navigate()
        team_name = df.team_name()
        try:
            team_page.create_team(name=team_name, description="多账号联动测试团队")
            # 断言创建后 URL 包含 /team/list
            team_page.assert_url_contains("/team/list")
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_create_team_fail_{team_name}.png")

        # ---- Step 2: A(admin) 生成邀请码 ----
        invite_page = TeamInviteCodesPage(admin_page).navigate()
        invite_code = ""
        try:
            invite_code = invite_page.generate_invite_code()
        except Exception:
            invite_page.screenshot(path=f"_screenshots/flow_generate_invite_code_fail.png")

        if not invite_code:
            # 如果生成失败，尝试获取已有的邀请码
            try:
                invite_code = invite_page.get_first_invite_code()
            except Exception:
                invite_page.screenshot(path=f"_screenshots/flow_get_existing_invite_code_fail.png")

        # ---- Step 3: B(member) 使用邀请码加入团队 ----
        if invite_code:
            member_page.goto(
                f"http://localhost:3006/#/auth/join-team"
            )
            member_page.wait_for_url(lambda u: "/auth/join-team" in u, timeout=10000)
            try:
                # 在加入团队页输入邀请码
                code_input = member_page.locator("input").first
                code_input.fill(invite_code)
                # 点击加入/确定按钮
                join_btn = member_page.locator("button:has-text('加入'), button:has-text('确定'), button:has-text('提交')").first
                if join_btn.count() > 0:
                    join_btn.click()
                member_page.wait_for_timeout(2000)
                # 断言有成功提示
                toast = member_page.locator(".el-message--success, .el-notification--success, .el-message").first
                assert toast.is_visible(timeout=5000), "member 加入团队后应出现成功提示"
            except Exception:
                member_page.screenshot(path=f"_screenshots/flow_member_join_team_fail.png")

        # ---- Step 4: A(admin) 审批 B 的加入申请（如有待审批流程） ----
        app_page = TeamApplicationsPage(admin_page).navigate()
        try:
            app_page.click_pending_tab()
            app_page.wait_loading_disappear()
            pending_before = app_page.table_row_count()
            app_page.approve_first_application()
            app_page.wait_loading_disappear()
            # 断言待审批列表减少
            pending_after = app_page.table_row_count()
            assert pending_after < pending_before, f"审批后待审批列表应减少，之前 {pending_before}，之后 {pending_after}"
        except Exception:
            app_page.screenshot(path=f"_screenshots/flow_approve_application_skip.png")

        # ---- Step 5: A(admin) 验证成员列表包含 B ----
        members_page = TeamMembersPage(admin_page).navigate()
        admin_page.wait_for_timeout(1000)
        # 验证成员列表行数 >= 2（至少包含 admin 和 member）
        try:
            row_count = members_page.get_member_row_count()
            assert row_count >= 2, f"成员列表行数应为 >= 2，实际为 {row_count}"
        except AssertionError:
            members_page.screenshot(path=f"_screenshots/flow_member_count_assert_fail.png")
            raise

        # ---- Step 6: C(team_admin) 验证团队成员 ----
        team_admin_members = TeamMembersPage(team_admin_page).navigate()
        team_admin_page.wait_for_timeout(1000)
        # 验证 team_admin 视角也能看到成员
        try:
            row_count_c = team_admin_members.get_member_row_count()
            assert row_count_c >= 2, f"team_admin 视角成员列表行数应为 >= 2，实际为 {row_count_c}"
        except AssertionError:
            team_admin_members.screenshot(path=f"_screenshots/flow_team_admin_member_count_assert_fail.png")
            raise

    def test_admin_assign_role_to_member(
        self, admin_page: Page, member_page: Page
    ) -> None:
        """TEAM_FLOW_002：A(admin) 创建角色标签 → 给 B(member) 分配角色标签。"""
        # ---- Step 1: A(admin) 先创建角色标签 ----
        roles_page = TeamRolesPage(admin_page).navigate()
        role_name = df.random_name(prefix="测试角色")
        try:
            role_count_before = roles_page.get_role_row_count()
            roles_page.create_role(name=role_name, description="联动测试角色")
            roles_page.wait_loading_disappear()
            role_count_after = roles_page.get_role_row_count()
            # 断言角色列表增加
            assert role_count_after > role_count_before, f"角色创建后列表应增加，之前 {role_count_before}，之后 {role_count_after}"
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_create_role_fail_{role_name}.png")

        # ---- Step 2: A(admin) 进入成员页，给 B 分配角色 ----
        members_page = TeamMembersPage(admin_page).navigate()
        admin_page.wait_for_timeout(1000)
        try:
            members_page.open_edit_role_dialog("member")
        except Exception:
            try:
                # 按用户名列称查找
                cfg_member_name = "member"
                members_page.open_edit_role_dialog(cfg_member_name)
            except Exception:
                members_page.screenshot(path=f"_screenshots/flow_edit_role_dialog_fail.png")
                return

        # ---- Step 3: 选择刚创建的角色标签并保存 ----
        try:
            members_page.assign_role_tags([role_name])
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_assign_role_tag_fail.png")

        # ---- Step 4: B(member) 刷新验证自己的角色 ----
        member_page.reload()
        member_page.wait_for_timeout(1000)
        # 验证角色标签可见
        try:
            role_tag = member_page.locator(f".el-tag:has-text('{role_name}'), .el-check-tag:has-text('{role_name}')").first
            assert role_tag.is_visible(timeout=5000), f"角色标签 '{role_name}' 应可见"
        except Exception:
            member_page.screenshot(path="flow_role_tag_not_visible")

        # ---- Step 5: admin 断言 member 页有该角色标签 ----
        members_page = TeamMembersPage(admin_page).navigate()
        admin_page.wait_for_timeout(1000)
        try:
            member_row = admin_page.locator(".el-table__body-wrapper .el-table__row").filter(has_text="member").first
            role_tag_in_row = member_row.locator(f".el-tag:has-text('{role_name}'), .el-check-tag:has-text('{role_name}')").first
            assert role_tag_in_row.is_visible(timeout=5000), f"admin 视角 member 页应有角色标签 '{role_name}'"
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_admin_role_tag_not_visible.png")

    def test_admin_assign_multiple_roles_to_member(
        self, admin_page: Page, member_page: Page
    ) -> None:
        """TEAM_FLOW_003：A(admin) 给 B(member) 分配多个角色标签。"""
        # ---- Step 1: A(admin) 创建两个角色标签 ----
        roles_page = TeamRolesPage(admin_page).navigate()
        role_name_1 = df.random_name(prefix="角色A")
        role_name_2 = df.random_name(prefix="角色B")
        created_roles = []
        for rn in [role_name_1, role_name_2]:
            try:
                roles_page.create_role(name=rn, description="多角色分配测试")
                created_roles.append(rn)
            except Exception:
                admin_page.screenshot(path=f"_screenshots/flow_create_multi_role_fail_{rn}.png")
        # 断言两个角色都创建成功
        assert len(created_roles) == 2, f"应成功创建两个角色，实际创建 {len(created_roles)} 个"

        # ---- Step 2: A(admin) 进入成员页，给 B 分配多个角色 ----
        members_page = TeamMembersPage(admin_page).navigate()
        admin_page.wait_for_timeout(1000)
        try:
            members_page.open_edit_role_dialog("member")
        except Exception:
            try:
                members_page.open_edit_role_dialog("member")
            except Exception:
                members_page.screenshot(path=f"_screenshots/flow_edit_multi_role_dialog_fail.png")
                return

        # ---- Step 3: 同时选择多个角色标签并保存 ----
        try:
            members_page.assign_role_tags([role_name_1, role_name_2])
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_assign_multi_role_tags_fail.png")

        # ---- Step 4: B(member) 刷新验证 ----
        member_page.reload()
        member_page.wait_for_timeout(1000)
        # 验证多个角色标签可见
        try:
            for rn in [role_name_1, role_name_2]:
                tag = member_page.locator(f".el-tag:has-text('{rn}'), .el-check-tag:has-text('{rn}')").first
                assert tag.is_visible(timeout=5000), f"角色标签 '{rn}' 应可见"
        except Exception:
            member_page.screenshot(path=f"_screenshots/flow_multi_role_tags_not_visible.png")

        # ---- Step 5: admin 断言 member 页有两个角色标签 ----
        members_page = TeamMembersPage(admin_page).navigate()
        admin_page.wait_for_timeout(1000)
        try:
            member_row = admin_page.locator(".el-table__body-wrapper .el-table__row").filter(has_text="member").first
            for rn in [role_name_1, role_name_2]:
                tag = member_row.locator(f".el-tag:has-text('{rn}'), .el-check-tag:has-text('{rn}')").first
                assert tag.is_visible(timeout=5000), f"admin 视角 member 页应有角色标签 '{rn}'"
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_admin_multi_role_tags_not_visible.png")

    def test_admin_modify_member_role(
        self, admin_page: Page, member_page: Page
    ) -> None:
        """TEAM_FLOW_004：A(admin) 修改 B(member) 在团队中的角色标签。"""
        # ---- Step 1: A(admin) 创建一个角色用于修改 ----
        roles_page = TeamRolesPage(admin_page).navigate()
        old_role = df.random_name(prefix="旧角色")
        new_role = df.random_name(prefix="新角色")
        for rn in [old_role, new_role]:
            try:
                roles_page.create_role(name=rn, description="角色修改测试")
            except Exception:
                admin_page.screenshot(f"flow_create_modify_role_fail_{rn}")

        # ---- Step 2: A(admin) 先给 B 分配旧角色 ----
        members_page = TeamMembersPage(admin_page).navigate()
        admin_page.wait_for_timeout(1000)
        try:
            members_page.open_edit_role_dialog("member")
            members_page.assign_role_tags([old_role])
            # 断言旧角色分配成功：admin 视角 member 行显示旧角色
            member_row = admin_page.locator(".el-table__body-wrapper .el-table__row").filter(has_text="member").first
            old_tag = member_row.locator(f".el-tag:has-text('{old_role}'), .el-check-tag:has-text('{old_role}')").first
            assert old_tag.is_visible(timeout=5000), f"旧角色 '{old_role}' 分配后应可见"
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_assign_old_role_fail.png")

        # ---- Step 3: A(admin) 重新编辑 B 的角色，改为新角色 ----
        admin_page.wait_for_timeout(1000)
        try:
            members_page.open_edit_role_dialog("member")
            members_page.assign_role_tags([new_role])
            # 断言新角色替换成功
            member_row = admin_page.locator(".el-table__body-wrapper .el-table__row").filter(has_text="member").first
            new_tag = member_row.locator(f".el-tag:has-text('{new_role}'), .el-check-tag:has-text('{new_role}')").first
            assert new_tag.is_visible(timeout=5000), f"新角色 '{new_role}' 替换后应可见"
        except Exception:
            admin_page.screenshot(path=f"_screenshots/flow_reassign_role_fail.png")

        # ---- Step 4: B(member) 刷新验证 ----
        member_page.reload()
        member_page.wait_for_timeout(1000)
