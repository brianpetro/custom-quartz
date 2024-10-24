import { i18n } from "../quartz/i18n"
import { FullSlug, joinSegments, pathToRoot } from "../quartz/util/path"
import { JSResourceToScriptElement } from "../quartz/util/resources"
import { googleFontHref } from "../quartz/util/theme"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../quartz/components/types"

export default (() => {
  const createStructuredData = (cfg: any, fileData: any, url: any, ogImagePath: any) => {
    const title = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const description = fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description
    const publishedDate = fileData.frontmatter?.date
    const modifiedDate = fileData.frontmatter?.dateModified ?? fileData.lastModified
    const schemaType = fileData.frontmatter?.type ?? "WebPage" // Default to WebPage
    const language = cfg.locale ?? "en"

    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url.href
      },
      "headline": title,
      "description": description,
      ...(publishedDate && { "datePublished": publishedDate }),
      ...(modifiedDate && { "dateModified": modifiedDate }),
      ...(fileData.frontmatter?.author && {
        "author": {
          "@type": "Person",
          "name": fileData.frontmatter.author
        }
      }),
      ...(cfg.baseUrl && {
        "image": {
          "@type": "ImageObject",
          "url": ogImagePath,
          "width": 1200,
          "height": 675
        }
      }),
      "publisher": {
        "@type": "Organization",
        "name": cfg.organization?.name || "Smart Connections",
        "logo": {
          "@type": "ImageObject",
          "url": `https://${cfg.baseUrl}/static/logo.png`,
          "width": 512,
          "height": 512
        }
      },
      "inLanguage": language
    } as any

    // Add keywords and article section if present in frontmatter
    if (fileData.frontmatter?.keywords) {
      structuredData.keywords = fileData.frontmatter.keywords.join(", ")
    }
    if (fileData.frontmatter?.articleSection) {
      structuredData.articleSection = fileData.frontmatter.articleSection
    }

    return structuredData
  }

  const Head: QuartzComponent = ({ cfg, fileData, externalResources }: QuartzComponentProps) => {
    const title = fileData.frontmatter?.title ?? i18n(cfg.locale).propertyDefaults.title
    const description =
      fileData.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description
    const { css, js } = externalResources

    const url = new URL(`https://${cfg.baseUrl ?? "example.com"}`)
    const path = url.pathname as FullSlug
    const baseDir = fileData.slug === "404" ? path : pathToRoot(fileData.slug!)

    const iconPath = joinSegments(baseDir, "static/icon.png")
    const ogImagePath = fileData.frontmatter?.ogImage
      ? `https://${cfg.baseUrl}/${fileData.frontmatter.ogImage}`
      : `https://${cfg.baseUrl}/static/og-image.png`

    const structuredData = createStructuredData(cfg, fileData, url, ogImagePath)

    return (
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        {cfg.theme.cdnCaching && cfg.theme.fontOrigin === "googleFonts" && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link rel="stylesheet" href={googleFontHref(cfg.theme)} />
          </>
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {cfg.baseUrl && <meta property="og:image" content={ogImagePath} />}
        <meta property="og:width" content="1200" />
        <meta property="og:height" content="675" />
        <link rel="icon" href={iconPath} />
        <meta name="description" content={description} />
        <meta name="generator" content="Quartz" />
        {css.map((href) => (
          <link key={href} href={href} rel="stylesheet" type="text/css" spa-preserve />
        ))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}

        {/* Structured Data - Unescaped */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor

