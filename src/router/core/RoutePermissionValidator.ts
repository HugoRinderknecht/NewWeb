/**
 * 路由权限验证模块
 *
 * 提供路由权限验证和路径检查功能
 *
 * ## 主要功能
 *
 * - 验证路径是否在用户菜单权限中
 * - 构建菜单路径集合（扁平化处理）
 * - 支持动态路由参数匹配
 * - 路径前缀匹配
 *
 * ## 使用场景
 *
 * - 路由守卫中验证用户权限
 * - 动态路由注册后的权限检查
 * - 防止用户访问无权限的页面
 *
 * @module router/core/RoutePermissionValidator
 * @author Dreamcraft_Astra Team
 */

import type { AppRouteRecord } from '@/types/router'

/**
 * 路由权限验证器
 */
export class RoutePermissionValidator {
  /**
   * 验证路径是否在用户菜单权限中
   * @param targetPath 目标路径
   * @param menuList 菜单列表
   * @returns 是否有权限访问
   */
  static hasPermission(targetPath: string, menuList: AppRouteRecord[]): boolean {
    // 根路径始终允许访问
    if (targetPath === '/') {
      return true
    }

    return this.matchRoute(targetPath, menuList, '')
  }

  /**
   * 构建菜单路径集合（扁平化处理）
   * @param menuList 菜单列表
   * @param pathSet 路径集合
   * @returns 路径集合
   */
  static buildMenuPathSet(
    menuList: AppRouteRecord[],
    pathSet: Set<string> = new Set()
  ): Set<string> {
    if (!Array.isArray(menuList) || menuList.length === 0) {
      return pathSet
    }

    for (const menuItem of menuList) {
      if (!menuItem.path) {
        continue
      }

      // 标准化路径并添加到集合
      const menuPath = menuItem.path.startsWith('/') ? menuItem.path : `/${menuItem.path}`
      pathSet.add(menuPath)

      // 递归处理子菜单
      if (menuItem.children?.length) {
        this.buildMenuPathSet(menuItem.children, pathSet)
      }
    }

    return pathSet
  }

  /**
   * 检查目标路径是否匹配集合中的某个路径前缀
   * 用于支持动态路由参数匹配，如 /user/123 匹配 /user
   * @param targetPath 目标路径
   * @param pathSet 路径集合
   * @returns 是否匹配
   */
  static checkPathPrefix(targetPath: string, pathSet: Set<string>): boolean {
    // 遍历路径集合，检查是否有前缀匹配
    for (const menuPath of pathSet) {
      if (targetPath.startsWith(`${menuPath}/`)) {
        return true
      }
    }
    return false
  }

  /**
   * 递归匹配路由配置，支持隐藏路由和动态参数路由
   * 标记为 meta.hidden 的路由视为无权限访问
   * @param parentPath 父路径前缀（用于拼接完整路径）
   */
  static matchRoute(targetPath: string, routes: AppRouteRecord[], parentPath: string = ''): boolean {
    if (!Array.isArray(routes) || routes.length === 0) {
      return false
    }

    for (const route of routes) {
      if (!route.path) {
        continue
      }

      // 标记为 hidden 的路由不允许访问
      if (route.meta?.hidden) {
        continue
      }

      // 构建完整路径
      const routePath = this.buildFullPath(route.path, parentPath)

      // 精确匹配或动态参数匹配
      if (routePath === targetPath || this.isDynamicRouteMatch(targetPath, routePath)) {
        return true
      }

      // 前缀匹配：需要递归检查子路由
      if (targetPath.startsWith(`${routePath}/`)) {
        if (route.children?.length && this.matchRoute(targetPath, route.children, routePath)) {
          return true
        }
        // 有子路由但子路由不匹配，或没有子路由，则不匹配
        continue
      }

      // 非前缀匹配，递归检查子路由（处理路径不标准的情况）
      if (route.children?.length && this.matchRoute(targetPath, route.children, parentPath)) {
        return true
      }
    }

    return false
  }

  /**
   * 构建完整路径（复用 MenuProcessor 的逻辑）
   */
  private static buildFullPath(path: string, parentPath: string): string {
    if (!path) return ''
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    if (path.startsWith('/')) return path
    if (parentPath) {
      const cleanParent = parentPath.replace(/\/$/, '')
      const cleanChild = path.replace(/^\//, '')
      return `${cleanParent}/${cleanChild}`
    }
    return `/${path}`
  }

  /**
   * 检查目标路径是否匹配动态参数路由，如 /demo/123 匹配 /demo/:id
   */
  static isDynamicRouteMatch(targetPath: string, routePath: string): boolean {
    if (!routePath.includes(':')) {
      return false
    }

    const pattern = routePath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:([^/]+)/g, '[^/]+')
      .replace(/\\\*/g, '.*')

    return new RegExp(`^${pattern}$`).test(targetPath)
  }

  /**
   * 验证并返回有效的路径
   * 如果目标路径无权限，返回首页路径
   * @param targetPath 目标路径
   * @param menuList 菜单列表
   * @param homePath 首页路径
   * @returns 验证后的路径
   */
  static validatePath(
    targetPath: string,
    menuList: AppRouteRecord[],
    homePath: string = '/'
  ): { path: string; hasPermission: boolean } {
    const hasPermission = this.hasPermission(targetPath, menuList)

    if (hasPermission) {
      return { path: targetPath, hasPermission: true }
    }

    return { path: homePath, hasPermission: false }
  }
}
