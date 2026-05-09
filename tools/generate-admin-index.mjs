import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import yaml from 'js-yaml'

const rootDir = process.cwd()
const postsDir = 'source/_posts'
const outputPath = 'public/admin-index.json'
const imageExtensions = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
])

const toPosix = (value) => value.split(path.sep).join('/')
const trimExtension = (value) => value.replace(/\.md$/i, '')
const execFileAsync = promisify(execFile)

async function collectMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(fullPath))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

async function collectAssets(assetDirAbsolute, assetDirRepo, postSlug) {
  try {
    const entries = await fs.readdir(assetDirAbsolute, { withFileTypes: true })
    const assets = await Promise.all(entries
      .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
      .map(async (entry) => ({
        filename: entry.name,
        repoPath: `${assetDirRepo}/${entry.name}`,
        markdownPath: `${postSlug}/${entry.name}`,
        size: (await fs.stat(path.join(assetDirAbsolute, entry.name))).size,
      })))
    return assets
      .sort((a, b) => a.filename.localeCompare(b.filename))
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

function parseFrontMatter(markdown) {
  if (!markdown.startsWith('---')) return {}
  const end = markdown.indexOf('\n---', 3)
  if (end === -1) return {}

  const raw = markdown.slice(3, end).trim()
  const parsed = yaml.load(raw)
  return parsed && typeof parsed === 'object' ? parsed : {}
}

function normalizeDate(value) {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed && Number.isFinite(Date.parse(trimmed)) ? trimmed : undefined
  }
  return undefined
}

async function getSourceCommitSha() {
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: rootDir })
    return stdout.trim() || undefined
  } catch {
    return undefined
  }
}

async function getGitFileDate(repoPath) {
  try {
    const { stdout } = await execFileAsync('git', ['log', '--follow', '--format=%aI', '-n', '1', '--', repoPath], { cwd: rootDir })
    return normalizeDate(stdout.trim())
  } catch {
    return undefined
  }
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return [value]
  return []
}

function normalizePublished(value) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true') return true
    if (normalized === 'false') return false
  }
  return true
}

function getRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function getString(value) {
  if (value === null || value === undefined) return undefined
  const text = String(value).trim()
  return text || undefined
}

async function readYamlFile(repoPath) {
  try {
    const raw = await fs.readFile(path.join(rootDir, repoPath), 'utf8')
    const parsed = yaml.load(raw)
    return getRecord(parsed)
  } catch (error) {
    if (error?.code === 'ENOENT') return {}
    throw error
  }
}

async function readJsonFile(repoPath) {
  try {
    const raw = await fs.readFile(path.join(rootDir, repoPath), 'utf8')
    const parsed = JSON.parse(raw)
    return getRecord(parsed)
  } catch (error) {
    if (error?.code === 'ENOENT') return {}
    throw error
  }
}

async function pathExists(repoPath) {
  try {
    await fs.access(path.join(rootDir, repoPath))
    return true
  } catch {
    return false
  }
}

const commonCustomizeFiles = [
  { id: 'site-config', path: '_config.yml', type: 'yaml' },
  { id: 'about-page', path: 'source/about/index.md', type: 'markdown' },
]

const redefineCustomizeFiles = [
  { id: 'redefine-config', path: '_config.redefine.yml', type: 'yaml' },
  { id: 'redefine-bookmarks-page', path: 'source/bookmarks/index.md', type: 'markdown' },
  { id: 'redefine-bookmarks-data', path: 'source/_data/bookmarks.yml', type: 'yaml' },
  { id: 'redefine-links-page', path: 'source/links/index.md', type: 'markdown' },
  { id: 'redefine-links-data', path: 'source/_data/links.yml', type: 'yaml' },
]

const commonCustomizePanels = [
  'site-basic',
  'about-page',
]

const redefineCustomizePanels = [
  'redefine-basic',
  'redefine-visual',
  'redefine-home-banner',
  'redefine-navigation',
  'redefine-bookmarks',
  'redefine-links',
  'redefine-page-templates',
]

async function buildSiteAndCustomizeSummary() {
  const siteConfig = await readYamlFile('_config.yml')
  const detectedTheme = getString(siteConfig.theme)?.toLowerCase()
  const themeConfigPath = detectedTheme ? `_config.${detectedTheme}.yml` : undefined
  const themeConfig = themeConfigPath ? await readYamlFile(themeConfigPath) : {}
  const themeInfo = getRecord(themeConfig.info)
  const packageJson = await readJsonFile('package.json')
  const dependencies = getRecord(packageJson.dependencies)
  const devDependencies = getRecord(packageJson.devDependencies)
  const themePackageName = detectedTheme ? `hexo-theme-${detectedTheme}` : undefined
  const themePackageVersion = themePackageName
    ? getString(dependencies[themePackageName]) ?? getString(devDependencies[themePackageName])
    : undefined
  const isRedefine = detectedTheme === 'redefine'
  const editableFiles = isRedefine
    ? [commonCustomizeFiles[0], redefineCustomizeFiles[0], commonCustomizeFiles[1], ...redefineCustomizeFiles.slice(1)]
    : commonCustomizeFiles
  const availablePanels = [...commonCustomizePanels, ...(isRedefine ? redefineCustomizePanels : [])]

  return {
    site: {
      title: getString(siteConfig.title) ?? getString(themeInfo.title),
      subtitle: getString(siteConfig.subtitle) ?? getString(themeInfo.subtitle),
      author: getString(siteConfig.author) ?? getString(themeInfo.author),
      url: getString(siteConfig.url) ?? getString(themeInfo.url),
      language: getString(siteConfig.language),
      timezone: getString(siteConfig.timezone),
      theme: {
        name: detectedTheme,
        packageName: themePackageName,
        packageVersion: themePackageVersion,
        configPath: themeConfigPath,
      },
    },
    customize: {
      detectedTheme,
      availableAdapters: ['common', ...(isRedefine ? ['redefine'] : [])],
      availablePanels,
      files: await Promise.all(editableFiles.map(async (file) => ({
        ...file,
        exists: await pathExists(file.path),
      }))),
    },
  }
}

function addToTree(tree, post) {
  const segments = post.relativeId.split('/')
  let current = tree
  let idPrefix = ''

  for (const segment of segments.slice(0, -1)) {
    idPrefix = idPrefix ? `${idPrefix}/${segment}` : segment
    let folder = current.find((node) => node.type === 'folder' && node.id === idPrefix)
    if (!folder) {
      folder = {
        id: idPrefix,
        name: segment,
        type: 'folder',
        sortPublishedAt: post.publishedAt,
        children: [],
      }
      current.push(folder)
    }

    folder.sortPublishedAt = olderDate(folder.sortPublishedAt, post.publishedAt)
    current = folder.children
  }

  current.push({
    id: post.relativeId,
    name: segments.at(-1) ?? post.relativeId,
    type: 'post',
    sortPublishedAt: post.publishedAt,
    post,
  })
}

function timestamp(value) {
  const time = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(time) ? time : 0
}

function olderDate(a, b) {
  if (!a) return b
  if (!b) return a
  return timestamp(a) <= timestamp(b) ? a : b
}

function sortTree(nodes) {
  nodes.sort((a, b) => {
    const dateDiff = timestamp(b.sortPublishedAt) - timestamp(a.sortPublishedAt)
    if (dateDiff !== 0) return dateDiff
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name)
  })

  for (const node of nodes) {
    if (node.children) sortTree(node.children)
  }
}

const markdownFiles = await collectMarkdownFiles(path.join(rootDir, postsDir))
const posts = []

for (const absolutePath of markdownFiles) {
  const repoPath = toPosix(path.relative(rootDir, absolutePath))
  const relativeMarkdownPath = toPosix(path.relative(path.join(rootDir, postsDir), absolutePath))
  const relativeId = trimExtension(relativeMarkdownPath)
  const postSlug = path.basename(relativeId)
  const folderPath = toPosix(path.dirname(relativeId)).replace(/^\.$/, '')
  const assetDirRepo = [postsDir, folderPath, postSlug].filter(Boolean).join('/')
  const markdown = await fs.readFile(absolutePath, 'utf8')
  const frontMatter = parseFrontMatter(markdown)
  const publishedAt = normalizeDate(frontMatter.date) ?? await getGitFileDate(repoPath)
  const published = normalizePublished(frontMatter.published)

  posts.push({
    relativeId,
    title: typeof frontMatter.title === 'string' ? frontMatter.title : postSlug,
    path: repoPath,
    metadata: {
      publishedAt,
      published,
    },
    publishedAt,
    published,
    folderPath,
    postSlug,
    assetDir: `${assetDirRepo}/`,
    markdownAssetPrefix: postSlug,
    date: publishedAt,
    updated: normalizeDate(frontMatter.updated),
    tags: normalizeStringArray(frontMatter.tags),
    categories: normalizeStringArray(frontMatter.categories),
    assets: await collectAssets(path.join(rootDir, assetDirRepo), assetDirRepo, postSlug),
  })
}

posts.sort((a, b) => {
  const dateDiff = timestamp(b.publishedAt) - timestamp(a.publishedAt)
  return dateDiff || a.relativeId.localeCompare(b.relativeId)
})

const tree = []
for (const post of posts) {
  addToTree(tree, post)
}
sortTree(tree)
const assets = posts.flatMap((post) => post.assets.map((asset) => ({
  ...asset,
  postRelativeId: post.relativeId,
})))

const index = {
  version: 2,
  generatedAt: new Date().toISOString(),
  sourceCommitSha: await getSourceCommitSha(),
  postsDir,
  assetMode: 'post-folder',
  ...await buildSiteAndCustomizeSummary(),
  posts,
  tree,
  assets,
}

await fs.mkdir(path.dirname(path.join(rootDir, outputPath)), { recursive: true })
await fs.writeFile(path.join(rootDir, outputPath), `${JSON.stringify(index, null, 2)}\n`, 'utf8')

console.log(`Generated ${outputPath} with ${posts.length} posts.`)
