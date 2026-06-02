import { ref } from 'vue'
import { getApiAdapter, resetAdapter } from '@/api/adapter'

const currentMode = ref<string>(import.meta.env.VITE_API_MODE || 'http')

export function useApiMode() {
  const switchMode = (mode: 'http' | 'mock' | 'hybrid') => {
    currentMode.value = mode
    resetAdapter()
  }

  const getMode = () => currentMode.value

  const isMockMode = () => currentMode.value === 'mock'

  const isHybridMode = () => currentMode.value === 'hybrid'

  return {
    currentMode,
    switchMode,
    getMode,
    isMockMode,
    isHybridMode
  }
}
