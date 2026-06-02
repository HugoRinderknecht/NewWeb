import type { Directive, DirectiveBinding } from 'vue'

interface LazyOptions {
  threshold?: number
  rootMargin?: string
  placeholder?: string
  errorPlaceholder?: string
}

const imageCache = new Set<string>()

function loadImage(el: HTMLImageElement, src: string, options: LazyOptions) {
  if (imageCache.has(src)) {
    el.src = src
    el.classList.add('lazy-loaded')
    return
  }

  const img = new Image()

  img.onload = () => {
    imageCache.add(src)
    el.src = src
    el.classList.add('lazy-loaded')
    el.classList.remove('lazy-loading', 'lazy-error')
  }

  img.onerror = () => {
    el.classList.add('lazy-error')
    el.classList.remove('lazy-loading')
    if (options.errorPlaceholder) {
      el.src = options.errorPlaceholder
    }
  }

  img.src = src
}

const lazyLoad: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    if (!(el instanceof HTMLImageElement)) {
      console.warn('v-lazy directive can only be used on img elements')
      return
    }

    const options: LazyOptions = binding.arg || {}
    const src = binding.value as string

    if (!src) return

    // 保存原始 src
    el.dataset.lazySrc = src

    // 设置占位图
    if (options.placeholder) {
      el.src = options.placeholder
    } else {
      // 使用透明像素作为默认占位
      el.src =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    }

    el.classList.add('lazy-loading')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lazySrc = el.dataset.lazySrc
            if (lazySrc) {
              loadImage(el, lazySrc, options)
            }
            observer.unobserve(el)
          }
        })
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    )

    observer.observe(el)

    // 保存 observer 引用以便清理
    ;(el as any).__lazyObserver = observer
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (!(el instanceof HTMLImageElement)) return

    const newSrc = binding.value as string
    const oldSrc = el.dataset.lazySrc

    if (newSrc !== oldSrc) {
      el.dataset.lazySrc = newSrc
      el.classList.remove('lazy-loaded', 'lazy-error')
      el.classList.add('lazy-loading')

      // 重新创建 observer
      const oldObserver = (el as any).__lazyObserver
      if (oldObserver) {
        oldObserver.disconnect()
      }

      const options: LazyOptions = binding.arg || {}
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const lazySrc = el.dataset.lazySrc
              if (lazySrc) {
                loadImage(el, lazySrc, options)
              }
              observer.unobserve(el)
            }
          })
        },
        {
          threshold: options.threshold || 0.1,
          rootMargin: options.rootMargin || '50px'
        }
      )

      observer.observe(el)
      ;(el as any).__lazyObserver = observer
    }
  },

  unmounted(el: HTMLElement) {
    const observer = (el as any).__lazyObserver
    if (observer) {
      observer.disconnect()
      delete (el as any).__lazyObserver
    }
  }
}

export default lazyLoad
