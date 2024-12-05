const explorerScript = `
let observer
let cleanupFns = new Set()
let isCleaningUp = false

// Define addCleanup if it doesn't exist
if (typeof window !== 'undefined' && !window.addCleanup) {
  window.addCleanup = (fn) => {
    if (typeof fn === 'function') {
      cleanupFns.add(fn)
    }
  }
}

function toggleExplorer(evt) {
  if (evt.target.id !== 'explorer' && !evt.target.closest('#explorer')) return
  
  const explorer = document.getElementById('explorer')
  explorer.classList.toggle("collapsed")
  explorer.setAttribute(
    "aria-expanded",
    explorer.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = explorer.nextElementSibling
  if (!content) return

  content.classList.toggle("collapsed")
}

function toggleFolder(evt) {
  evt.stopPropagation()
  const target = evt.target
  if (!target) return

  const folderContainer = target.closest('.folder-container')
  if (!folderContainer) return

  const folderContent = folderContainer.nextElementSibling
  if (!folderContent || !folderContent.classList.contains('folder-outer')) return

  folderContent.classList.toggle("open")
}

function setupExplorer() {
  const explorer = document.getElementById("explorer")
  if (!explorer) return

  // Handle explorer toggle
  explorer.removeEventListener("click", toggleExplorer)
  explorer.addEventListener("click", toggleExplorer)

  // Add click handlers to all folder containers
  const folderContainers = document.querySelectorAll('.folder-container')
  folderContainers.forEach(container => {
    container.removeEventListener('click', toggleFolder)
    container.addEventListener('click', toggleFolder)
  })

  // Set up intersection observer for the end marker
  if ('IntersectionObserver' in window) {
    if (observer) {
      observer.disconnect()
    }
    
    observer = new IntersectionObserver((entries) => {
      const explorerUl = document.getElementById("explorer-ul")
      if (!explorerUl) return
      for (const entry of entries) {
        if (entry.isIntersecting) {
          explorerUl.classList.add("no-background")
        } else {
          explorerUl.classList.remove("no-background")
        }
      }
    })

    const lastItem = document.getElementById("explorer-end")
    if (lastItem && observer) {
      observer.observe(lastItem)
    }
  }
}

function cleanup() {
  // Prevent recursive cleanup
  if (isCleaningUp) return
  isCleaningUp = true

  try {
    if (observer) {
      observer.disconnect()
      observer = null
    }

    const explorer = document.getElementById("explorer")
    if (explorer) {
      explorer.removeEventListener("click", toggleExplorer)
    }

    const folderContainers = document.querySelectorAll('.folder-container')
    folderContainers.forEach(container => {
      container.removeEventListener('click', toggleFolder)
    })

    // Run any registered cleanup functions
    const fns = Array.from(cleanupFns)
    cleanupFns.clear()
    
    fns.forEach(fn => {
      try {
        fn()
      } catch (e) {
        console.error('Error during cleanup:', e)
      }
    })
  } finally {
    isCleaningUp = false
  }
}

// Handle navigation events
document.addEventListener("nav", () => {
  cleanup()
  setupExplorer()
})

// Handle resize events
const resizeHandler = () => setupExplorer()
window.addEventListener("resize", resizeHandler)

// Register cleanup for resize handler
if (typeof window.addCleanup === 'function') {
  const cleanupResize = () => {
    window.removeEventListener("resize", resizeHandler)
  }
  window.addCleanup(cleanupResize)
}

// Initial setup
setupExplorer()
`

export default explorerScript 