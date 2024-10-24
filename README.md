# Using Custom Quartz Components (setup)

## 1. Create symbolic links to the custom components directory adjacent to your `content` and `quartz` folders.

Windows example:
```bash
mklink /D "C:\Users\brian\Documents\docs.sc\custom-quartz" "C:\Users\brian\Documents\custom-quartz"
```

MacOS example:
```bash
ln -s "/Users/brian/Documents/custom-quartz" "/Users/brian/Documents/docs.sc/custom-quartz"
```

## 2. Add `preserveSymlinks: true,` to `handleBuild()` in `cli/handlers.js`

```diff
export async function handleBuild(argv) {
  console.log(chalk.bgGreen.black(`\n Quartz v${version} \n`))
  const ctx = await esbuild.context({
    entryPoints: [fp],
    outfile: cacheFile,
    bundle: true,
    keepNames: true,
    minifyWhitespace: true,
    minifySyntax: true,
    platform: "node",
    format: "esm",
    jsx: "automatic",
    jsxImportSource: "preact",
    packages: "external",
+   preserveSymlinks: true,
```

# CustomHead.tsx - Added Structured Data Support in Quartz

This component automatically adds structured data (`JSON-LD`) to the page's `<head>` tag. It uses the page's frontmatter and content to populate key SEO-related fields, including support for FAQ structured data. This document outlines the frontmatter options and content parsing that the component uses to create structured data.

## Frontmatter Options

The following frontmatter properties influence the structured data output:

**`title`**
- **Type**: `string`
- **Description**: The title of the content, used in structured data for `headline` and `og:title`.
- **Fallback**: Uses locale-specific default title from i18n configuration.

**`description`**
- **Type**: `string`
- **Description**: A description of the content, used for the `description` and `og:description` fields.
- **Fallback**: Uses locale-specific default description from i18n configuration.

**`date`**
- **Type**: `string` (ISO 8601 date format)
- **Description**: The date the content was originally published.
- **Fallback**: Field is omitted if not provided.

**`dateModified`**
- **Type**: `string` (ISO 8601 date format)
- **Description**: The date the content was last modified.
- **Fallback**: Uses `lastModified` from file metadata.

**`author`**
- **Type**: `string`
- **Description**: The name of the author of the content. Generates a Person schema type.
- **Fallback**: Field is omitted if not provided.

**`type`**
- **Type**: `string` (Schema.org types)
- **Description**: Specifies the Schema.org type of the page.
- **Default**: `"WebPage"`
- **Example**: `type: "BlogPosting"`

**`keywords`**
- **Type**: `string[]`
- **Description**: An array of keywords that get joined with commas in the structured data.
- **Example**: `keywords: ["obsidian", "note-taking", "productivity"]`

**`articleSection`**
- **Type**: `string`
- **Description**: The section of the article.
- **Example**: `articleSection: "Technology"`

**`ogImage`**
- **Type**: `string`
- **Description**: Path to the Open Graph image for the page.
- **Fallback**: Uses `/static/og-image.png`

## FAQ Structured Data

### Automatic Extraction of Q&A Pairs

The `CustomHead.tsx` component can automatically extract question and answer pairs from your content to generate FAQ structured data. It does this by parsing the content for headings that end with a question mark (`?`) and considers the subsequent content as the answer.

#### How It Works

- **Question Identification**: Any heading (`h1` to `h6`) that ends with a question mark is identified as a question.
- **Answer Content**: The content following the question heading, up until the next question heading or end of the document, is considered the answer.
- **FAQ Schema Generation**: The extracted Q&A pairs are formatted according to the [FAQPage schema](https://schema.org/FAQPage) and included in the page's structured data.

#### Example Content

```markdown
# How do I install the Smart Connections plugin?

To install the Smart Connections plugin, navigate to the plugin marketplace and search for "Smart Connections." Click "Install" and then "Enable."

# What features does the Smart Connections plugin offer?

The plugin offers features such as automatic linking, backlink management, and enhanced search capabilities to improve your productivity.
```

#### Generated FAQ Structured Data Example

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I install the Smart Connections plugin?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "To install the Smart Connections plugin, navigate to the plugin marketplace and search for \"Smart Connections.\" Click \"Install\" and then \"Enable.\""
      }
    },
    {
      "@type": "Question",
      "name": "What features does the Smart Connections plugin offer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The plugin offers features such as automatic linking, backlink management, and enhanced search capabilities to improve your productivity."
      }
    }
  ]
}
```

### Important Notes

- **Content Structure**: For the automatic FAQ extraction to work correctly, ensure your content follows the structure of questions as headings and answers as the content following them.
- **Limitations**: Only headings that end with a question mark are considered. Other content will not be included in the FAQ structured data.
- **Nested Questions**: Currently, nested questions or multiple levels of headings are not differentiated; all headings ending with a question mark are treated equally.

## Additional Features

### Publisher Information

The structured data automatically includes publisher information:

- **Organization Name**: Uses `cfg.organization.name` or defaults to "Smart Connections"
- **Logo**: Uses `/static/logo.png` from your base URL
- **Logo Dimensions**: Fixed at 512x512 pixels

### Language Support

- Automatically includes the page's language using the `cfg.locale` setting (defaults to "en")

## Example Frontmatter

```yaml
title: "How to Use Smart Connections"
description: "A detailed guide on setting up and using the Smart Connections plugin."
datePublished: "2024-10-20"
dateModified: "2024-10-22"
author: "Brian Petro"
type: "BlogPosting"
keywords: ["obsidian", "smart connections", "productivity"]
articleSection: "Technology"
ogImage: "assets/featured_image.jpg"
```

## Generated Structured Data Example

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/page"
  },
  "headline": "How to Use Smart Connections",
  "description": "A detailed guide on setting up and using the Smart Connections plugin.",
  "datePublished": "2024-10-20",
  "dateModified": "2024-10-22",
  "author": {
    "@type": "Person",
    "name": "Brian Petro"
  },
  "image": {
    "@type": "ImageObject",
    "url": "https://example.com/assets/featured_image.jpg",
    "width": 1200,
    "height": 675
  },
  "publisher": {
    "@type": "Organization",
    "name": "Smart Connections",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/static/logo.png",
      "width": 512,
      "height": 512
    }
  },
  "keywords": "obsidian, smart connections, productivity",
  "articleSection": "Technology",
  "inLanguage": "en"
}
```