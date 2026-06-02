import { onLCP, onCLS, onFCP, onTTFB, onINP } from 'web-vitals'

interface PerformanceMetric {
  name: string
  value: number
  rating: string
  delta: number
  navigationType: string
}

function sendToAnalytics(metric: PerformanceMetric) {
  if (import.meta.env.DEV) {
    console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`)
    return
  }

  const url = '/api/analytics/web-vitals'
  const body = JSON.stringify({
    name: metric.name,
    value: Math.round(metric.value),
    rating: metric.rating,
    delta: Math.round(metric.delta),
    page: window.location.pathname,
    timestamp: Date.now()
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    fetch(url, { body, method: 'POST', keepalive: true }).catch(() => {})
  }
}

export function initWebVitals() {
  onLCP((metric) => sendToAnalytics(metric as unknown as PerformanceMetric))
  onCLS((metric) => sendToAnalytics(metric as unknown as PerformanceMetric))
  onFCP((metric) => sendToAnalytics(metric as unknown as PerformanceMetric))
  onTTFB((metric) => sendToAnalytics(metric as unknown as PerformanceMetric))
  onINP((metric) => sendToAnalytics(metric as unknown as PerformanceMetric))
}
