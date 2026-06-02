# Art Design Pro 项目开发甘特图

> 本文档使用 Mermaid 语法绘制项目开发进度甘特图，涵盖整体开发阶段、模块级开发计划和关键路径分析。

---

## 1. 整体项目开发甘特图

项目按四个阶段推进：基础设施搭建 → 核心功能开发 → 高级功能实现 → 系统优化完善。

```mermaid
gantt
    title Art Design Pro 整体开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 第一阶段：基础设施
    路由系统搭建 (19个模块)           :infra1, 2024-01-01, 5d
    状态管理初始化 (Pinia + 11个Store) :infra2, after infra1, 4d
    HTTP客户端封装 (Axios + 拦截器)    :infra3, after infra1, 3d
    用户认证系统 (登录/Token管理)      :infra4, after infra3, 4d
    SSE流式通信基础                    :infra5, after infra3, 3d
    基础设施联调测试                   :infra6, after infra4, 2d

    section 第二阶段：核心功能
    项目管理模块 (CRUD/成员/配置)      :core1, after infra6, 6d
    剧本管理模块 (编写/拆解/AI审核)    :core2, after infra6, 7d
    分镜管理模块 (场景/图片/编辑)      :core3, after core1, 5d
    团队管理模块 (成员/角色/权限)      :core4, after core1, 5d
    角色与集数管理                     :core5, after core2, 4d
    核心功能集成测试                   :core6, after core3, 3d

    section 第三阶段：高级功能
    审核系统 (共享审核流程)            :adv1, after core6, 5d
    工作流引擎 (Dify集成/SSE)         :adv2, after core6, 6d
    资产管理 (上传/分片/团队资产)      :adv3, after core6, 5d
    AI视频生成 (任务管理/预览)         :adv4, after adv2, 6d
    AI图片生成 (GPT Image)            :adv5, after adv2, 4d
    通知系统                           :adv6, after adv1, 3d
    高级功能集成测试                   :adv7, after adv4, 3d

    section 第四阶段：系统优化
    DataFlow数据流转平台               :opt1, after adv7, 7d
    积分/信用体系 (个人/项目/团队)     :opt2, after adv7, 5d
    统计分析与数据看板                 :opt3, after opt1, 5d
    数据历史追踪                       :opt4, after opt1, 4d
    编辑器功能完善                     :opt5, after opt2, 4d
    系统配置与设置优化                 :opt6, after opt3, 3d
    全系统回归测试                     :opt7, after opt5, 3d
```

---

## 2. 模块级开发甘特图

按11个主要功能模块维度展示各模块的开发周期和依赖关系。

```mermaid
gantt
    title Art Design Pro 模块级开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 路由模块 (19个)
    静态路由配置                       :r1, 2024-01-01, 2d
    动态路由加载                       :r2, after r1, 3d
    路由守卫与权限控制                 :r3, after r2, 2d
    路由模块单元测试                   :r4, after r3, 1d, done

    section 状态管理 (11个Store)
    用户状态 (user.ts)                :s1, after r4, 2d
    菜单状态 (menu.ts)                :s2, after s1, 1d, done
    项目状态 (project.ts)             :s3, after s1, 2d
    剧本状态 (script-project.ts)      :s4, after s3, 2d
    团队状态 (team.ts)                :s5, after s3, 1d, done
    审核状态 (review.ts)              :s6, after s4, 1d, done
    通知状态 (notification.ts)        :s7, after s5, 1d, done
    设置状态 (setting.ts)             :s8, after s6, 1d, done
    数据状态 (project-data.ts)        :s9, after s7, 1d, done
    工作标签 (worktab.ts)             :s10, after s8, 1d, done
    表格状态 (table.ts)               :s11, after s9, 1d, done

    section 项目管理
    项目列表与搜索                     :p1, after s3, 3d
    项目编辑与配置                     :p2, after p1, 3d
    项目成员管理                       :p3, after p2, 2d
    项目统计报表                       :p4, after p3, 2d

    section 剧本管理
    剧本库管理                         :sc1, after s4, 3d
    剧本编写器                         :sc2, after sc1, 4d
    剧本拆解功能                       :sc3, after sc2, 3d
    人物小传管理                       :sc4, after sc3, 2d
    AI审核结果展示                     :sc5, after sc4, 2d
    版本管理                           :sc6, after sc5, 2d

    section 分镜管理
    分镜列表                           :sb1, after p1, 2d
    分镜编辑器                         :sb2, after sb1, 4d
    场景管理                           :sb3, after sb2, 3d
    分镜图片管理                       :sb4, after sb3, 2d

    section 团队管理
    团队列表                           :t1, after s5, 2d
    团队成员管理                       :t2, after t1, 3d
    角色与权限配置                     :t3, after t2, 3d
    团队设置                           :t4, after t3, 2d

    section 审核系统
    审核流程配置                       :rv1, after sc6, 3d
    共享审核界面                       :rv2, after rv1, 3d
    审核意见与批注                     :rv3, after rv2, 2d

    section 工作流引擎
    工作流列表管理                     :w1, after sc6, 2d
    工作流执行器                       :w2, after w1, 4d
    Dify集成与SSE                     :w3, after w2, 3d
    工作流目录                         :w4, after w3, 2d

    section 资产管理
    资产上传                           :a1, after sb4, 2d
    分片上传                           :a2, after a1, 3d
    团队资产库                         :a3, after a2, 3d

    section AI生成
    AI视频生成                         :vg1, after w3, 4d
    生成任务管理                       :vg2, after vg1, 3d
    视频预览与历史                     :vg3, after vg2, 2d
    GPT图片生成                       :gi1, after w3, 3d

    section DataFlow平台
    数据总线 (bus.ts)                 :df1, after vg3, 3d
    数据通道 (channel.ts)             :df2, after df1, 2d
    数据转换器 (transformer.ts)       :df3, after df2, 2d
    监控告警 (monitor.ts)             :df4, after df3, 2d
    可视化 (visualizer.ts)            :df5, after df4, 2d

    section 积分体系
    个人积分                           :pt1, after vg3, 2d
    项目积分                           :pt2, after pt1, 2d
    团队积分                           :pt3, after pt2, 2d

    section 数据统计
    统计看板                           :st1, after df5, 3d
    数据历史                           :st2, after st1, 3d
    导出功能                           :st3, after st2, 2d
```

---

## 3. 关键路径分析

红色标记的模块构成项目关键路径，决定了项目的最短完成时间。关键路径上的任何延迟都会直接影响项目交付。

```mermaid
gantt
    title Art Design Pro 关键路径分析
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 关键路径 (红色)
    路由系统搭建                       :crit, cp1, 2024-01-01, 5d
    HTTP客户端与认证                   :crit, cp2, after cp1, 7d
    项目管理核心                       :crit, cp3, after cp2, 6d
    剧本管理全流程                     :crit, cp4, after cp3, 14d
    工作流引擎与Dify集成               :crit, cp5, after cp4, 9d, done
    AI视频生成                         :crit, cp6, after cp5, 9d, done
    DataFlow平台                       :crit, cp7, after cp6, 11d, done
    统计分析与收尾                     :crit, cp8, after cp7, 8d, done

    section 非关键路径 (蓝色)
    状态管理初始化                     :ncp1, after cp1, 4d
    分镜管理模块                       :ncp2, after cp3, 11d, done
    团队管理模块                       :ncp3, after cp3, 10d, done
    审核系统                           :ncp4, after cp4, 8d, done
    资产管理模块                       :ncp5, after ncp2, 8d, done
    AI图片生成                         :ncp6, after cp5, 3d
    通知系统                           :ncp7, after ncp4, 3d
    积分体系                           :ncp8, after cp6, 6d
    编辑器完善                         :ncp9, after ncp8, 4d
    数据历史追踪                       :ncp10, after cp7, 4d
    系统配置优化                       :ncp11, after cp7, 3d
```

---

## 4. API模块依赖关系图

展示24个API模块之间的依赖关系和开发顺序。

```mermaid
gantt
    title Art Design Pro API模块开发顺序
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 基础API层
    认证API (auth.ts)                 :api1, 2024-01-01, 2d
    HTTP适配器 (adapter/)             :api2, after api1, 2d

    section 核心业务API
    项目API (project.ts)              :api3, after api2, 3d
    剧本API (script.ts)               :api4, after api3, 3d
    角色API (character.ts)            :api5, after api4, 2d
    分镜API (storyboard.ts)           :api6, after api3, 3d
    团队API (team.ts)                 :api7, after api3, 2d

    section 功能扩展API
    审核API (review.ts)               :api8, after api4, 2d
    工作流API (workflow.ts)           :api9, after api4, 3d
    工作流管理API (workflow-manage.ts) :api10, after api9, 2d
    资产API (asset.ts)                :api11, after api6, 2d
    剧本资产API (script-asset.ts)     :api12, after api4, 2d

    section AI生成API
    视频API (video.ts)                :api13, after api9, 3d
    视频模型API (video-model.ts)      :api14, after api13, 2d
    图片API (image.ts)                :api15, after api9, 2d
    AI处理API (ai-process.ts)         :api16, after api9, 2d

    section 辅助功能API
    通知API (notification.ts)         :api17, after api7, 2d
    编辑器API (editor.ts)             :api18, after api6, 2d
    数据历史API (data-history.ts)     :api19, after api13, 2d
    积分API (points.ts)               :api20, after api13, 2d
    计费API (billing.ts)              :api21, after api20, 2d
    统计API (statistics.ts)           :api22, after api19, 2d
    系统配置API (system-config.ts)    :api23, after api7, 2d
    系统管理API (system-manage.ts)    :api24, after api23, 2d
    平台管理API (platform-admin.ts)   :api25, after api24, 2d
```

---

## 5. DataFlow平台开发详细计划

DataFlow数据流转平台是项目的技术深度体现，包含6个核心文件的开发。

```mermaid
gantt
    title DataFlow数据流转平台开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 类型定义
    基础类型定义 (方向/状态/告警级别)   :df_t1, 2024-06-01, 1d, done
    数据通道类型                        :df_t2, after df_t1, 1d, done
    流转记录类型                        :df_t3, after df_t2, 1d, done
    转换器类型                          :df_t4, after df_t3, 1d, done
    监控告警类型                        :df_t5, after df_t4, 1d, done
    可视化类型                          :df_t6, after df_t5, 1d, done

    section 核心实现
    数据总线 (bus.ts) - 通道注册与分发  :df_c1, after df_t6, 3d
    数据通道 (channel.ts) - 通道实例管理 :df_c2, after df_c1, 2d
    数据转换器 (transformer.ts) - 转换管道 :df_c3, after df_c2, 2d

    section 监控与可视化
    监控器 (monitor.ts) - 指标采集与告警 :df_m1, after df_c3, 2d
    可视化器 (visualizer.ts) - 节点与边渲染 :df_m2, after df_m1, 2d

    section 集成与测试
    平台入口 (index.ts) - 统一导出      :df_i1, after df_m2, 1d, done
    单元测试覆盖                        :df_i2, after df_i1, 2d
    集成测试与性能调优                  :df_i3, after df_i2, 2d
```

---

## 6. 视图层开发甘特图

展示22个视图目录的开发顺序和依赖关系。

```mermaid
gantt
    title Art Design Pro 视图层开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 基础视图
    认证视图 (auth/)                   :v1, 2024-01-01, 3d
    仪表盘 (dashboard/)               :v2, after v1, 3d
    首页框架 (index/)                  :v3, after v1, 2d
    异常页面 (exception/)             :v4, after v3, 2d

    section 核心业务视图
    项目管理 (project/)               :v5, after v2, 6d
    剧本管理 (script/)                :v6, after v5, 7d
    分镜管理 (storyboard/)            :v7, after v5, 5d
    团队管理 (team/)                  :v8, after v5, 5d

    section 功能视图
    审核系统 (review/)                :v9, after v6, 5d
    工作流 (workflow/)                :v10, after v6, 6d
    资产管理 (asset/)                 :v11, after v7, 5d
    编辑器 (editor/)                  :v12, after v7, 4d
    通知中心 (notice/)                :v13, after v8, 3d

    section AI功能视图
    AI处理 (ai-process/)              :v14, after v10, 4d
    视频生成 (video-gen/)             :v15, after v10, 6d
    GPT图片 (gpt-image/)             :v16, after v10, 4d

    section 辅助视图
    数据历史 (data-history/)          :v17, after v15, 3d
    积分系统 (points/)                :v18, after v15, 4d
    统计分析 (stats/)                 :v19, after v17, 4d
    系统管理 (system/)                :v20, after v13, 3d
    设置中心 (settings/)              :v21, after v20, 3d
    外部页面 (outside/)               :v22, after v4, 2d
```

---

## 图表说明

### 关键路径说明

关键路径是项目中耗时最长的任务序列，决定了项目的最短完成时间：

1. **路由系统搭建** → **HTTP客户端与认证** → **项目管理核心** → **剧本管理全流程** → **工作流引擎与Dify集成** → **AI视频生成** → **DataFlow平台** → **统计分析与收尾**

### 模块依赖关系

| 模块类别 | 依赖关系 | 包含模块数 |
|---------|---------|-----------|
| 基础设施层 | 无外部依赖 | 4个核心模块 |
| 核心功能层 | 依赖基础设施层 | 4个业务模块 |
| 高级功能层 | 依赖核心功能层 | 4个扩展模块 |
| 优化层 | 依赖所有上层 | 4个完善模块 |

### 文件复杂度参考

- **路由模块**: 19个文件，每个模块定义独立的路由树
- **视图目录**: 22个目录，多数包含多个子组件
- **API模块**: 25个文件（含adapter目录），覆盖全部后端接口
- **Store模块**: 11个文件，管理全局状态
- **DataFlow平台**: 6个文件，实现数据流转监控体系
- **类型定义**: 完整的TypeScript类型约束（381行）

---

## 7. 子模块级开发甘特图

针对项目管理、剧本管理、审核系统三个核心模块，进一步拆解到子功能级别的开发计划。

```mermaid
gantt
    title 项目管理模块 — 子模块开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 项目列表
    项目列表页面                    :pl1, 2024-01-08, 3d
    搜索过滤功能                    :pl2, after pl1, 2d
    分页加载                        :pl3, after pl1, 2d

    section 项目创建
    创建表单                        :pc1, after pl3, 2d
    表单验证                        :pc2, after pc1, 1d
    封面上传                        :pc3, after pc1, 2d

    section 项目编辑
    详情加载                        :pe1, after pc2, 2d
    编辑表单                        :pe2, after pe1, 2d
    配置管理                        :pe3, after pe1, 3d

    section 项目成员
    成员列表                        :pm1, after pe2, 2d
    添加/移除成员                   :pm2, after pm1, 2d
    角色权限管理                    :pm3, after pm1, 3d

    section 分集管理
    分集列表                        :ep1, after pm2, 2d
    分集CRUD                        :ep2, after ep1, 3d

    section 角色管理
    角色列表                        :ch1, after ep1, 2d
    角色CRUD                        :ch2, after ch1, 2d
    角色关联分镜                    :ch3, after ch1, 3d

    section 项目统计
    统计数据展示                    :st1, after ch2, 3d
```

```mermaid
gantt
    title 剧本管理模块 — 子模块开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 剧本库
    剧本列表页面                    :sl1, 2024-01-15, 3d
    剧本详情页面                    :sl2, after sl1, 2d
    创建/删除剧本                   :sl3, after sl1, 2d

    section 剧本编写
    富文本编辑器集成                :sw1, after sl2, 4d
    自动保存                        :sw2, after sw1, 2d
    预览功能                        :sw3, after sw1, 2d

    section 剧本拆解
    AI拆解接口对接                  :sd1, after sw2, 3d
    分集列表展示                    :sd2, after sd1, 2d
    手动创建分集                    :sd3, after sd1, 2d

    section 人物小传
    AI生成小传                      :sp1, after sd2, 3d
    小传列表展示                    :sp2, after sp1, 2d

    section 版本管理
    版本历史列表                    :sv1, after sp1, 2d
    版本回滚                        :sv2, after sv1, 2d

    section AI审核
    提交/撤回审核                   :sr1, after sv1, 2d
    审核状态查询                    :sr2, after sr1, 1d
    内容违规检测                    :sr3, after sr1, 3d
```

```mermaid
gantt
    title 审核系统模块 — 子模块开发计划
    dateFormat  YYYY-MM-DD
    axisFormat  %m/%d

    section 待审核列表
    审核列表页面                    :rp1, 2024-02-15, 3d
    待审核数量徽章                  :rp2, after rp1, 1d
    筛选过滤                        :rp3, after rp1, 2d

    section 审核详情
    详情页面                        :rd1, after rp2, 3d
    认领功能                        :rd2, after rd1, 2d
    审核决策(通过/驳回)             :rd3, after rd1, 3d
    批量决策                        :rd4, after rd3, 2d

    section 审核内容
    内容查看                        :rc1, after rd2, 2d
    版本对比                        :rc2, after rc1, 3d

    section 审核流程
    提交审核                        :rf1, after rc1, 2d
    撤回审核                        :rf2, after rf1, 1d
    归档入库                        :rf3, after rf1, 2d
    下发成果                        :rf4, after rf3, 2d

    section 驳回原因
    原因列表                        :rr1, after rf3, 2d
    原因管理(CRUD)                  :rr2, after rr1, 2d

    section 审核统计
    统计数据                        :rs1, after rr1, 3d
    导出报表                        :rs2, after rs1, 2d
```
