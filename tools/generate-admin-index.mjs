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
  if (typeof value === 'string') return value
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

function normalizeStringArray(value) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') return [value]
  return []
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
  const publishedAt = normalizeDate(frontMatter.date)

  posts.push({
    relativeId,
    title: typeof frontMatter.title === 'string' ? frontMatter.title : postSlug,
    path: repoPath,
    metadata: {
      publishedAt,
    },
    publishedAt,
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

const index = {
  version: 1,
  generatedAt: new Date().toISOString(),
  sourceCommitSha: await getSourceCommitSha(),
  postsDir,
  assetMode: 'post-folder',
  posts,
  tree,
}

await fs.mkdir(path.dirname(path.join(rootDir, outputPath)), { recursive: true })
await fs.writeFile(path.join(rootDir, outputPath), `${JSON.stringify(index, null, 2)}\n`, 'utf8')

console.log(`Generated ${outputPath} with ${posts.length} posts.`)
