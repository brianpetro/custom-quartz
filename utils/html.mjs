import { h } from 'preact'

// Create a component factory
export function safeHtml(strings, ...values) {
  const raw = strings.raw
  let result = ''

  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
    if (i < values.length) {
      const value = values[i]
      if (Array.isArray(value)) {
        result += value.join('')
      } else {
        result += value?.toString() ?? ''
      }
    }
  }

  // Create a Quartz-compatible component
  function QuartzComponent(props) {
    return h('div', {
      dangerouslySetInnerHTML: { __html: result }
    })
  }
  
  QuartzComponent.css = ""
  QuartzComponent.beforeDOMLoaded = undefined
  QuartzComponent.afterDOMLoaded = undefined
  
  return QuartzComponent
}

// Mark a string as a component
export function safe(str) {
  function QuartzComponent(props) {
    return h('div', {
      dangerouslySetInnerHTML: { __html: str }
    })
  }
  
  QuartzComponent.css = ""
  QuartzComponent.beforeDOMLoaded = undefined
  QuartzComponent.afterDOMLoaded = undefined
  
  return QuartzComponent
}
