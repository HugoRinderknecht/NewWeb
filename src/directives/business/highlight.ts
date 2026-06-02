import { App, Directive } from 'vue'
import hljs from 'highlight.js/lib/core'

const languageMap: Record<string, () => Promise<any>> = {
  javascript: () => import('highlight.js/lib/languages/javascript'),
  typescript: () => import('highlight.js/lib/languages/typescript'),
  css: () => import('highlight.js/lib/languages/css'),
  xml: () => import('highlight.js/lib/languages/xml'),
  json: () => import('highlight.js/lib/languages/json'),
  bash: () => import('highlight.js/lib/languages/bash'),
  python: () => import('highlight.js/lib/languages/python'),
  sql: () => import('highlight.js/lib/languages/sql'),
  markdown: () => import('highlight.js/lib/languages/markdown'),
  yaml: () => import('highlight.js/lib/languages/yaml'),
  java: () => import('highlight.js/lib/languages/java'),
  cpp: () => import('highlight.js/lib/languages/cpp'),
  shell: () => import('highlight.js/lib/languages/shell')
}

const aliasMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  html: 'xml',
  py: 'python',
  md: 'markdown',
  yml: 'yaml',
  sh: 'shell'
}

const loadedLanguages = new Set<string>()

async function ensureLanguage(lang: string): Promise<boolean> {
  const resolved = aliasMap[lang] || lang
  if (loadedLanguages.has(resolved)) return true

  const loader = languageMap[resolved]
  if (!loader) return false

  try {
    const mod = await loader()
    hljs.registerLanguage(resolved, mod.default)
    if (aliasMap[lang] && lang !== resolved) {
      hljs.registerLanguage(lang, mod.default)
    }
    loadedLanguages.add(resolved)
    return true
  } catch {
    return false
  }
}

export type HighlightDirective = Directive<HTMLElement>

function highlightCode(block: HTMLElement) {
  hljs.highlightElement(block)
}

function insertLineNumbers(block: HTMLElement) {
  const lines = block.innerHTML.split('\n')
  const numberedLines = lines
    .map((line, index) => {
      return `<span class="line-number">${index + 1}</span> ${line}`
    })
    .join('\n')
  block.innerHTML = numberedLines
}

function addCopyButton(block: HTMLElement) {
  const copyButton = document.createElement('i')
  copyButton.className = 'copy-button'
  copyButton.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1 1 0 0 1 3 21l.003-14c0-.552.45-1 1.006-1zM5.002 8L5 20h10V8zM9 6h8v10h2V4H9z"/></svg>'
  copyButton.onclick = () => {
    const codeContent = block.innerText.replace(/^\d+\s+/gm, '')
    navigator.clipboard.writeText(codeContent).then(() => {
      ElMessage.success('复制成功')
    })
  }

  const preElement = block.parentElement
  if (preElement) {
    let codeWrapper: HTMLElement
    if (!block.parentElement.classList.contains('code-wrapper')) {
      codeWrapper = document.createElement('div')
      codeWrapper.className = 'code-wrapper'
      preElement.replaceChild(codeWrapper, block)
      codeWrapper.appendChild(block)
    } else {
      codeWrapper = block.parentElement
    }
    preElement.appendChild(copyButton)
  }
}

function isBlockProcessed(block: HTMLElement): boolean {
  return (
    block.hasAttribute('data-highlighted') ||
    !!block.querySelector('.line-number') ||
    !!block.parentElement?.querySelector('.copy-button')
  )
}

function markBlockAsProcessed(block: HTMLElement) {
  block.setAttribute('data-highlighted', 'true')
}

async function processBlock(block: HTMLElement) {
  if (isBlockProcessed(block)) {
    return
  }

  const lang = block.className.match(/language-(\w+)/)?.[1]
  if (lang) {
    await ensureLanguage(lang)
  }

  try {
    highlightCode(block)
    insertLineNumbers(block)
    addCopyButton(block)
    markBlockAsProcessed(block)
  } catch (error) {
    console.warn('处理代码块时出错:', error)
  }
}

async function processAllCodeBlocks(el: HTMLElement) {
  const blocks = Array.from(el.querySelectorAll<HTMLElement>('pre code'))
  const unprocessedBlocks = blocks.filter((block) => !isBlockProcessed(block))

  if (unprocessedBlocks.length === 0) {
    return
  }

  if (unprocessedBlocks.length <= 10) {
    await Promise.all(unprocessedBlocks.map((block) => processBlock(block)))
  } else {
    const batchSize = 10
    let currentIndex = 0

    const processBatch = async () => {
      const batch = unprocessedBlocks.slice(currentIndex, currentIndex + batchSize)
      await Promise.all(batch.map((block) => processBlock(block)))

      currentIndex += batchSize
      if (currentIndex < unprocessedBlocks.length) {
        requestAnimationFrame(processBatch)
      }
    }

    await processBatch()
  }
}

function retryProcessing(el: HTMLElement, maxRetries: number = 3, delay: number = 200) {
  let retryCount = 0

  const tryProcess = () => {
    processAllCodeBlocks(el)

    const remainingBlocks = Array.from(el.querySelectorAll<HTMLElement>('pre code')).filter(
      (block) => !isBlockProcessed(block)
    )

    if (remainingBlocks.length > 0 && retryCount < maxRetries) {
      retryCount++
      setTimeout(tryProcess, delay * retryCount)
    }
  }

  tryProcess()
}

const highlightDirective: HighlightDirective = {
  mounted(el: HTMLElement) {
    processAllCodeBlocks(el)

    setTimeout(() => {
      retryProcessing(el)
    }, 100)

    const observer = new MutationObserver((mutations) => {
      let hasNewCodeBlocks = false

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement
              if (element.tagName === 'PRE' || element.querySelector('pre code')) {
                hasNewCodeBlocks = true
              }
            }
          })
        }
      })

      if (hasNewCodeBlocks) {
        setTimeout(() => {
          processAllCodeBlocks(el)
        }, 50)
      }
    })

    observer.observe(el, {
      childList: true,
      subtree: true
    })

    ;(el as any)._highlightObserver = observer
  },

  updated(el: HTMLElement) {
    setTimeout(() => {
      processAllCodeBlocks(el)
    }, 50)
  },

  unmounted(el: HTMLElement) {
    const observer = (el as any)._highlightObserver
    if (observer) {
      observer.disconnect()
      delete (el as any)._highlightObserver
    }
  }
}

export function setupHighlightDirective(app: App) {
  app.directive('highlight', highlightDirective)
}
