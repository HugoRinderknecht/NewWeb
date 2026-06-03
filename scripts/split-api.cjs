const fs = require('fs')
const path = require('path')

// 读取API文档 (使用api-docs.json，它是完整的API文档)
const apiDoc = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/api-docs.json'), 'utf-8'))

// 创建模块目录映射
const modules = {}

// 遍历所有路径，按tags分组
Object.entries(apiDoc.paths).forEach(([apiPath, methods]) => {
  Object.entries(methods).forEach(([method, details]) => {
    if (details.tags && details.tags.length > 0) {
      const tagName = details.tags[0] // 使用第一个tag作为主模块

      if (!modules[tagName]) {
        modules[tagName] = {
          paths: {},
          schemas: new Set()
        }
      }

      if (!modules[tagName].paths[apiPath]) {
        modules[tagName].paths[apiPath] = {}
      }
      modules[tagName].paths[apiPath][method] = details

      // 收集引用的schemas
      collectSchemas(details, modules[tagName].schemas)
    }
  })
})

// 递归收集$ref引用的schemas
function collectSchemas(obj, schemas) {
  if (!obj || typeof obj !== 'object') return

  if (obj['$ref']) {
    const refPath = obj['$ref']
    if (refPath.startsWith('#/components/schemas/')) {
      schemas.add(refPath.replace('#/components/schemas/', ''))
    }
  }

  Object.values(obj).forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach((item) => collectSchemas(item, schemas))
    } else if (typeof value === 'object') {
      collectSchemas(value, schemas)
    }
  })
}

// 创建模块文件夹并保存
const docsDir = path.join(__dirname, '../docs')

Object.entries(modules).forEach(([moduleName, moduleData]) => {
  // 将模块名转换为安全的文件夹名
  const safeName = moduleName.replace(/[\/\\:*?"<>|]/g, '_')
  const moduleDir = path.join(docsDir, safeName)

  // 创建模块目录
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true })
  }

  // 收集该模块需要的schemas
  const moduleSchemas = {}
  moduleData.schemas.forEach((schemaName) => {
    if (apiDoc.components && apiDoc.components.schemas && apiDoc.components.schemas[schemaName]) {
      moduleSchemas[schemaName] = apiDoc.components.schemas[schemaName]
    }
  })

  // 构建模块API文档
  const moduleDoc = {
    openapi: apiDoc.openapi,
    info: {
      ...apiDoc.info,
      title: `${apiDoc.info.title} - ${moduleName}`,
      description: `模块: ${moduleName}`
    },
    servers: apiDoc.servers,
    security: apiDoc.security,
    tags: apiDoc.tags.filter((t) => t.name === moduleName),
    paths: moduleData.paths,
    components: {
      schemas: moduleSchemas
    }
  }

  // 保存模块API文档
  fs.writeFileSync(path.join(moduleDir, 'api.json'), JSON.stringify(moduleDoc, null, 2), 'utf-8')

  console.log(`✅ 已创建模块: ${safeName} (${Object.keys(moduleData.paths).length} 个接口)`)
})

console.log(`\n🎉 拆分完成！共 ${Object.keys(modules).length} 个模块`)
