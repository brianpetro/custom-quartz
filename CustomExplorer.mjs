import { h } from 'preact'
import { FileNode, ExplorerNode } from './CustomExplorerNode.mjs'
import explorerScript from './custom_explorer.inline.mjs'
import { classNames } from '../quartz/util/lang.js'

const explorerStyle = `
.explorer {
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

@media all and (min-width: 600px) {
  .explorer.desktop-only {
    display: flex;
  }
}

button#explorer {
  background-color: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 0;
  color: var(--dark);
  display: flex;
  align-items: center;
}

button#explorer h2 {
  font-size: 1rem;
  display: inline-block;
  margin: 0;
}

button#explorer .fold {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
  opacity: 0.8;
}

button#explorer.collapsed .fold {
  transform: rotateZ(-90deg);
}

.folder-outer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease-in-out;
}

.folder-outer.open {
  grid-template-rows: 1fr;
}

.folder-outer > ul {
  overflow: hidden;
}

#explorer-content {
  list-style: none;
  overflow: hidden;
  overflow-y: auto;
  max-height: 100%;
  transition:
    max-height 0.35s ease,
    visibility 0s linear 0s;
  margin-top: 0.5rem;
  visibility: visible;
}

#explorer-content.collapsed {
  max-height: 0;
  transition:
    max-height 0.35s ease,
    visibility 0s linear 0.35s;
  visibility: hidden;
}

#explorer-content ul {
  list-style: none;
  margin: 0.08rem 0;
  padding: 0;
  transition:
    max-height 0.35s ease,
    transform 0.35s ease,
    opacity 0.2s ease;
}

#explorer-content ul li > a {
  color: var(--dark);
  opacity: 0.75;
  pointer-events: all;
  text-decoration: none;
}

#explorer-content > #explorer-ul {
  max-height: none;
}

.folder-container {
  display: flex;
  align-items: center;
  user-select: none;
  cursor: pointer;
  padding: 0.2rem 0;
}

.folder-icon-container {
  display: flex;
  align-items: center;
  margin-right: 5px;
}

.folder-icon {
  color: var(--secondary);
  transition: transform 0.3s ease;
  backface-visibility: visible;
}

.folder-container:hover .folder-icon,
.folder-container:hover .folder-title {
  color: var(--tertiary);
}

.folder-title {
  color: var(--secondary);
  font-family: var(--headerFont);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5rem;
}

.folder-button {
  all: unset;
  cursor: pointer;
  width: 100%;
}

li:has(> .folder-outer:not(.open)) > .folder-container .folder-icon {
  transform: rotate(-90deg);
}

.no-background::after {
  background: none !important;
}

#explorer-end {
  height: 4px;
  margin: 0;
}
`

const defaultOptions = {
  folderClickBehavior: "collapse",
  folderDefaultState: "collapsed",
  useSavedState: true,
  mapFn: (node) => node,
  sortFn: (a, b) => {
    if ((!a.file && !b.file) || (a.file && b.file)) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }
    return a.file ? 1 : -1
  },
  filterFn: (node) => node.name !== "tags",
  order: ["filter", "map", "sort"],
}

function createExplorer(userOpts = {}) {
  const opts = { ...defaultOptions, ...userOpts }
  let fileTree
  let jsonTree
  let lastBuildId = ""

  function constructFileTree(allFiles) {
    fileTree = new FileNode("")
    allFiles.forEach((file) => fileTree.add(file))

    if (opts.order) {
      for (let i = 0; i < opts.order.length; i++) {
        const functionName = opts.order[i]
        if (functionName === "map") {
          fileTree.map(opts.mapFn)
        } else if (functionName === "sort") {
          fileTree.sort(opts.sortFn)
        } else if (functionName === "filter") {
          fileTree.filter(opts.filterFn)
        }
      }
    }

    const folders = fileTree.getFolderPaths(opts.folderDefaultState === "collapsed")
    jsonTree = JSON.stringify(folders)
  }

  function Explorer({ ctx, cfg, allFiles, displayClass, fileData }) {
    if (ctx.buildId !== lastBuildId) {
      lastBuildId = ctx.buildId
      constructFileTree(allFiles)
    }

    return h('div', { class: classNames(displayClass, "explorer") }, [
      h('button', {
        type: "button",
        id: "explorer",
        "data-behavior": opts.folderClickBehavior,
        "data-collapsed": opts.folderDefaultState,
        "data-savestate": "false",
        "data-tree": jsonTree,
        "aria-controls": "explorer-content",
        "aria-expanded": opts.folderDefaultState === "open"
      }, [
        h('h2', null, opts.title ?? cfg?.locale?.components?.explorer?.title ?? "Explorer"),
        h('svg', {
          xmlns: "http://www.w3.org/2000/svg",
          width: "14",
          height: "14",
          viewBox: "5 8 14 8",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          class: "fold"
        }, [
          h('polyline', { points: "6 9 12 15 18 9" })
        ])
      ]),
      h('div', { id: "explorer-content" }, 
        h('ul', { class: "overflow", id: "explorer-ul" }, [
          h(ExplorerNode, { node: fileTree, opts, fileData }),
          h('li', { id: "explorer-end" })
        ])
      )
    ])
  }

  Explorer.css = explorerStyle
  Explorer.afterDOMLoaded = explorerScript

  return Explorer
}

export default createExplorer
