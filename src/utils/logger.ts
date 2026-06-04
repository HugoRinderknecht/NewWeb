type LogLevel = 'info' | 'warn' | 'error' | 'log'

function formatTime(): string {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

function createLogger() {
  const log = (level: LogLevel, module: string, ...args: any[]) => {
    const prefix = `[${formatTime()}][${module}]`
    switch (level) {
      case 'info':
        console.info(prefix, ...args)
        break
      case 'warn':
        console.warn(prefix, ...args)
        break
      case 'error':
        console.error(prefix, ...args)
        break
      default:
        console.log(prefix, ...args)
    }
  }

  return {
    info(module: string, message: string, ...args: any[]) {
      log('info', module, message, ...args)
    },

    warn(module: string, action: string, message?: string, ...args: any[]) {
      log('warn', module, `[${action}]`, message || '', ...args)
    },

    error(module: string, action: string, message?: string, error?: any) {
      log('error', module, `[${action}]`, message || '', error || '')
    },

    apiRequest(module: string, action: string, data?: any) {
      log('info', module, `[API→] ${action}`, data || '')
    },

    apiSuccess(module: string, action: string, message?: string) {
      log('info', module, `[API✓] ${action}`, message || '')
    },

    apiError(module: string, action: string, error?: any) {
      log('error', module, `[API✗] ${action}`, error || '')
    },
  }
}

export const logger = createLogger()