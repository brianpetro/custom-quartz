// Import utilities from Quartz
import { h } from 'preact'
import { joinSegments, resolveRelative, simplifySlug } from "../quartz/util/path.js"

// Helper function to get path segment
function getPathSegment(fp, idx) {
  if (!fp) {
    return undefined
  }
  return fp.split("/").at(idx)
}

// Helper function to check if a folder should be initially open
function shouldBeOpen(node, fileData, isDefaultOpen) {
  // Root folder is always open
  if (node.depth === 0) return true
  
  // If we have a current file path, check if this folder is in the path
  if (fileData.filePath) {
    const currentPath = fileData.filePath.split('/')
    return currentPath.some(segment => segment === node.displayName)
  }
  
  // Otherwise use the default state
  return isDefaultOpen
}

export class FileNode {
  constructor(slugSegment, displayName, file, depth) {
    this.children = []
    this.name = slugSegment
    this.displayName = displayName ?? file?.frontmatter?.title ?? slugSegment
    this.file = file ? JSON.parse(JSON.stringify(file)) : null
    this.depth = depth ?? 0
  }

  insert(fileData) {
    if (fileData.path.length === 0) {
      return
    }

    const nextSegment = fileData.path[0]

    if (fileData.path.length === 1) {
      if (nextSegment === "") {
        const title = fileData.file.frontmatter?.title
        if (title && title !== "index") {
          this.displayName = title
        }
      } else {
        this.children.push(new FileNode(nextSegment, undefined, fileData.file, this.depth + 1))
      }
      return
    }

    fileData.path = fileData.path.splice(1)
    const child = this.children.find((c) => c.name === nextSegment)
    if (child) {
      child.insert(fileData)
      return
    }

    const newChild = new FileNode(
      nextSegment,
      getPathSegment(fileData.file.relativePath, this.depth),
      undefined,
      this.depth + 1,
    )
    newChild.insert(fileData)
    this.children.push(newChild)
  }

  add(file) {
    this.insert({ file: file, path: simplifySlug(file.slug).split("/") })
  }

  filter(filterFn) {
    this.children = this.children.filter(filterFn)
    this.children.forEach((child) => child.filter(filterFn))
  }

  map(mapFn) {
    mapFn(this)
    this.children.forEach((child) => child.map(mapFn))
  }

  getFolderPaths(collapsed) {
    const folderPaths = []

    const traverse = (node, currentPath) => {
      if (!node.file) {
        const folderPath = joinSegments(currentPath, node.name)
        if (folderPath !== "") {
          folderPaths.push({ path: folderPath, collapsed })
        }
        node.children.forEach((child) => traverse(child, folderPath))
      }
    }

    traverse(this, "")
    return folderPaths
  }

  sort(sortFn) {
    this.children = this.children.sort(sortFn)
    this.children.forEach((e) => e.sort(sortFn))
  }
}

export function ExplorerNode({ node, opts, fullPath, fileData }) {
  const folderBehavior = opts.folderClickBehavior
  const isDefaultOpen = opts.folderDefaultState === "open"
  const folderPath = node.name !== "" ? joinSegments(fullPath ?? "", node.name) : ""
  const href = resolveRelative(fileData.slug, folderPath) + "/"
  
  // Only force open state for folders in the current file's path
  const isOpen = node.depth === 0 || (fileData.filePath && shouldBeOpen(node, fileData, isDefaultOpen))

  if (node.file) {
    return h('li', { key: node.file.slug }, 
      h('a', { 
        href: resolveRelative(fileData.slug, node.file.slug),
        "data-for": node.file.slug
      }, node.displayName)
    )
  }

  return h('li', {}, [
    node.name !== "" && h('div', { 
      class: "folder-container",
      "data-folderpath": folderPath
    }, [
      h('div', { class: "folder-icon-container" },
        h('svg', {
          xmlns: "http://www.w3.org/2000/svg",
          width: "12",
          height: "12",
          viewBox: "5 8 14 8",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          class: "folder-icon"
        }, h('polyline', { points: "6 9 12 15 18 9" }))
      ),
      folderBehavior === "link" 
        ? h('a', { 
            href: href, 
            "data-for": node.name,
            class: "folder-title"
          }, node.displayName)
        : h('button', { 
            class: "folder-button",
            type: "button"
          }, node.displayName)
    ]),
    h('div', { 
      class: `folder-outer ${isOpen ? "open" : ""}`
    }, [
      h('ul', {
        style: `padding-left: ${node.name !== "" ? "1.4rem" : "0"}`,
        class: "content",
        "data-folderul": folderPath
      }, node.children.map((childNode) => 
        h(ExplorerNode, {
          node: childNode,
          opts,
          fullPath: folderPath,
          fileData
        })
      ))
    ])
  ])
}
