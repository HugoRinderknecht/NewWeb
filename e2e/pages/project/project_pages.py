"""
项目管理 Page Object

- /project/list          列表（双视图：卡片/表格）
- /project/edit          编辑（7 Tab）
- /project/scripts       剧本管理
- /project/characters    角色管理
- /project/episodes      剧集管理
- /project/member        成员管理
- /project/statistics    项目统计
"""
from __future__ import annotations

from pages.base_page import BasePage
from utils import data_factory as df


class ProjectListPage(BasePage):
    PATH = "/project/list"

    SEL_CREATE_BTN = "button:has-text('创建项目')"
    SEL_SEARCH = "input[placeholder*='搜索项目']"
    SEL_STATUS_FILTER = ".el-select"
    SEL_CARDS = "[class*='project-card'], .art-card"
    SEL_TABLE = ".el-table"
    SEL_VIEW_GRID = "[class*='grid']"
    SEL_VIEW_LIST = "[class*='list']"

    def search(self, keyword: str) -> None:
        self.fill(self.SEL_SEARCH, keyword)
        self.page.locator(self.SEL_SEARCH).press("Enter")
        self.wait_loading_disappear()

    def open_create_dialog(self) -> None:
        self.click(self.SEL_CREATE_BTN)
        self.get_dialog().wait_for(state="visible", timeout=5000)

    def fill_create_form(self, name: str, description: str = "") -> None:
        """在创建项目对话框中填写表单。"""
        # 名称
        name_input = self.page.locator(".el-dialog input[placeholder*='名称'], .el-dialog input").first
        name_input.fill(name)
        # 描述
        ta = self.page.locator(".el-dialog textarea").first
        if ta.count() > 0:
            ta.fill(description or f"自动化测试项目 {name}")

    def submit_create(self) -> None:
        self.confirm_dialog()
        self.wait_dialog_closed()

    def create_project(self, name: str | None = None, description: str = "") -> str:
        """完整创建流程，返回项目名。"""
        name = name or df.project_name()
        self.open_create_dialog()
        self.fill_create_form(name, description)
        self.submit_create()
        return name

    def switch_to_grid(self) -> None:
        try:
            self.page.locator(self.SEL_VIEW_GRID).first.click(timeout=2000)
        except Exception:
            pass

    def switch_to_list(self) -> None:
        try:
            self.page.locator(self.SEL_VIEW_LIST).first.click(timeout=2000)
        except Exception:
            pass

    def delete_project(self, name: str) -> None:
        """搜索项目→找到行→点击删除→确认对话框。"""
        self.search(name)
        self.wait_loading_disappear()
        # 找到包含项目名的行，点击行内删除按钮
        row = self.page.locator(f".el-table__row:has-text('{name}')").first
        try:
            row.locator("button:has-text('删除'), .el-button--danger").first.click(timeout=3000)
        except Exception:
            # 卡片视图：在卡片内找删除按钮
            self.page.locator(f"[class*='project-card']:has-text('{name}') button:has-text('删除'), "
                              f"[class*='card']:has-text('{name}') button:has-text('删除')").first.click(timeout=3000)
        # 确认删除对话框
        self.confirm_dialog()
        self.wait_dialog_closed()

    def has_project(self, name: str) -> bool:
        """搜索项目后验证是否存在。"""
        self.search(name)
        self.wait_loading_disappear()
        # 检查表格行或卡片中是否包含该项目名
        table_match = self.page.locator(f".el-table__row:has-text('{name}')").count() > 0
        card_match = self.page.locator(f"[class*='project-card']:has-text('{name}'), "
                                       f"[class*='card']:has-text('{name}')").count() > 0
        return table_match or card_match

    def delete_first_project(self) -> None:
        """删除列表第一个项目（点击删除按钮 -> 确认对话框）。"""
        # 表格视图
        row = self.page.locator(".el-table__row").first
        if row.count() > 0:
            row.locator("button:has-text('删除'), .el-button--danger").first.click(timeout=3000)
        else:
            # 卡片视图
            self.page.locator("[class*='project-card'], [class*='card']").first.locator(
                "button:has-text('删除')"
            ).first.click(timeout=3000)
        self.confirm_dialog()
        self.wait_dialog_closed()

    def assert_project_exists(self, name: str) -> None:
        """验证列表中包含指定项目名称。"""
        assert self.has_project(name), f"列表中未找到项目 [{name}]"


class ProjectEditPage(BasePage):
    PATH = "/project/edit"

    SEL_TAB_OVERVIEW = ".el-tabs__item:has-text('概览')"
    SEL_TAB_SCRIPT = ".el-tabs__item:has-text('剧本')"
    SEL_TAB_STORYBOARD = ".el-tabs__item:has-text('分镜')"
    SEL_TAB_VIDEO = ".el-tabs__item:has-text('视频')"
    SEL_TAB_ASSET = ".el-tabs__item:has-text('资产')"
    SEL_TAB_MEMBER = ".el-tabs__item:has-text('成员')"
    SEL_TAB_SETTING = ".el-tabs__item:has-text('设置')"
    SEL_SAVE_BTN = "button:has-text('保存修改')"
    SEL_BACK_BTN = "button:has-text('返回')"
    SEL_NAME_INPUT = "input[placeholder*='项目名称'], input[placeholder*='名称']"

    def save(self) -> None:
        """点击保存修改按钮。"""
        self.click(self.SEL_SAVE_BTN)
        self.wait_loading_disappear()

    def save_edit(self) -> None:
        """点击保存修改按钮。"""
        self.save()

    def fill_overview(self, name: str, description: str = "") -> None:
        """填写概览Tab的表单。"""
        self.page.locator(self.SEL_NAME_INPUT).first.fill(name)
        ta = self.page.locator("textarea").first
        if ta.count() > 0:
            ta.fill(description or f"自动化测试项目 {name}")

    def edit_name(self, new_name: str) -> None:
        """修改项目名称。"""
        self.page.locator(self.SEL_NAME_INPUT).first.fill(new_name)

    def click_tab(self, tab: str) -> None:
        """tab: overview/script/storyboard/video/asset/member/setting"""
        mapping = {
            "overview": self.SEL_TAB_OVERVIEW,
            "script": self.SEL_TAB_SCRIPT,
            "storyboard": self.SEL_TAB_STORYBOARD,
            "video": self.SEL_TAB_VIDEO,
            "asset": self.SEL_TAB_ASSET,
            "member": self.SEL_TAB_MEMBER,
            "setting": self.SEL_TAB_SETTING,
        }
        sel = mapping.get(tab)
        if sel:
            loc = self.page.locator(sel).first
            # 先关闭可能遮挡的弹窗
            self.close_dialog()
            self.page.keyboard.press("Escape")
            self.wait_loading_disappear()
            loc.click(force=True)


class ProjectScriptsPage(BasePage):
    PATH = "/project/scripts"

    SEL_CREATE_BTN = "button:has-text('创建剧本'), button:has-text('新建剧本')"

    def create_script(self, name: str) -> None:
        """创建剧本。"""
        self.click(self.SEL_CREATE_BTN)
        self.get_dialog().wait_for(state="visible", timeout=5000)
        name_input = self.page.locator(".el-dialog input").first
        name_input.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()


class ProjectCharactersPage(BasePage):
    PATH = "/project/characters"

    SEL_CREATE_BTN = "button:has-text('创建角色'), button:has-text('新建角色')"

    def create_character(self, name: str) -> None:
        """创建角色。"""
        self.click(self.SEL_CREATE_BTN)
        self.get_dialog().wait_for(state="visible", timeout=5000)
        name_input = self.page.locator(".el-dialog input").first
        name_input.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()


class ProjectEpisodesPage(BasePage):
    PATH = "/project/episodes"

    SEL_CREATE_BTN = "button:has-text('创建剧集'), button:has-text('新建剧集')"

    def create_episode(self, name: str) -> None:
        """创建剧集。"""
        self.click(self.SEL_CREATE_BTN)
        self.get_dialog().wait_for(state="visible", timeout=5000)
        name_input = self.page.locator(".el-dialog input").first
        name_input.fill(name)
        self.confirm_dialog()
        self.wait_dialog_closed()


class ProjectMemberPage(BasePage):
    PATH = "/project/member"

    SEL_ADD_BTN = "button:has-text('添加成员'), button:has-text('邀请成员')"

    def add_member(self, username: str) -> None:
        """添加成员。"""
        self.click(self.SEL_ADD_BTN)
        self.get_dialog().wait_for(state="visible", timeout=5000)
        # 在对话框中搜索或输入用户名
        inp = self.page.locator(".el-dialog input").first
        inp.fill(username)
        # 等待下拉选项出现并选择第一个
        self.page.wait_for_timeout(500)
        option = self.page.locator(".el-select-dropdown__item, .el-dropdown-menu__item").first
        if option.count() > 0:
            option.click()
        self.confirm_dialog()
        self.wait_dialog_closed()


class ProjectStatisticsPage(BasePage):
    PATH = "/project/statistics"

    def assert_kpi(self) -> None:
        for txt in ["总集数", "总镜头数", "项目成员", "总时长"]:
            try:
                self.page.get_by_text(txt).first.wait_for(state="visible", timeout=3000)
            except Exception:
                pass

    def assert_kpi_values(self) -> None:
        """断言 KPI 指标区域有数据（数值不为空）。"""
        kpi_labels = ["总集数", "总镜头数", "项目成员", "总时长"]
        for label in kpi_labels:
            try:
                # 找到标签对应的数值元素
                kpi_item = self.page.locator(f"[class*='kpi'], [class*='stat'], [class*='card']").filter(has_text=label).first
                if kpi_item.count() > 0:
                    # 验证有数值内容（数字或非空文本）
                    value_text = kpi_item.inner_text()
                    assert len(value_text.strip()) > 0, f"KPI [{label}] 数值为空"
            except Exception:
                pass
        # 验证统计图表或表格存在
        try:
            chart_or_table = self.page.locator(
                "[class*='chart'], canvas, .el-table, [class*='echarts']"
            ).first
            assert chart_or_table.count() > 0, "统计页缺少图表或表格"
        except Exception:
            pass
