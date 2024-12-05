import { ComponentType } from "preact"
import { StaticResources } from "../quartz/util/resources"
import { QuartzPluginData } from "../quartz/plugins/vfile"
import { GlobalConfiguration } from "../quartz/cfg"
import { Node } from "hast"
import { BuildCtx } from "../quartz/util/ctx"

export type QuartzComponentProps = {
  ctx: BuildCtx
  externalResources: StaticResources
  fileData: QuartzPluginData
  cfg: GlobalConfiguration
  children: (QuartzComponent | JSX.Element)[]
  tree: Node
  allFiles: QuartzPluginData[]
  displayClass?: "mobile-only" | "desktop-only"
} & JSX.IntrinsicAttributes & {
    [key: string]: any
  }

export type QuartzComponent = ComponentType<QuartzComponentProps> & {
  css?: string
  beforeDOMLoaded?: string
  afterDOMLoaded?: string
}

export type QuartzComponentConstructor<Options extends object | undefined = undefined> = (
  opts: Options,
) => QuartzComponent

declare const createExplorer: QuartzComponentConstructor
export default createExplorer 