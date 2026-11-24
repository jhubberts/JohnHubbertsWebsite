export type FrontmatterValue = string | number | boolean

export type Frontmatter = Record<string, FrontmatterValue>

const BLOCK = /^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/
const LINE = /^([A-Za-z_][\w-]*)[ \t]*:(?:[ \t]+(.*?))?[ \t]*$/

function parseValue(raw: string): FrontmatterValue {
  if (raw.length >= 2) {
    const quote = raw[0]
    if ((quote === "'" || quote === '"') && raw.endsWith(quote)) {
      const inner = raw.slice(1, -1)
      return quote === "'" ? inner.replace(/''/g, "'") : inner.replace(/\\(["\\])/g, '$1')
    }
  }
  if (raw === 'true') return true
  if (raw === 'false') return false
  if (/^-?\d+$/.test(raw)) return Number(raw)
  return raw
}

/** The fields of a blog post that its frontmatter gives. */
export interface PostMeta {
  slug: string
  /** The `title` field, or the slug when there is none. */
  title: string
  /** The `date` field as written, or an empty string when there is none. */
  date: string
  description: string
  series?: string
  part?: number
  draft: boolean
}

function stringField(value: FrontmatterValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined
}

/**
 * Parses the leading `---` block of an MDX file. Supports `key: value` lines whose value is a
 * quoted or bare string, a whole number, or `true`/`false`. Returns an empty object when the text
 * has no frontmatter block. Lines that are blank or not `key: value` are ignored.
 */
export function parseFrontmatter(text: string): Frontmatter {
  const match = BLOCK.exec(text)
  if (!match) return {}
  const result: Frontmatter = {}
  for (const line of match[1].split(/\r?\n/)) {
    const parts = LINE.exec(line)
    if (parts) result[parts[1]] = parseValue(parts[2] ?? '')
  }
  return result
}

/**
 * Reads a post's fields from the text of its MDX file. A field of the wrong type counts as
 * absent.
 */
export function postMeta(slug: string, source: string): PostMeta {
  const meta = parseFrontmatter(source)
  return {
    slug,
    title: stringField(meta.title) ?? slug,
    date: stringField(meta.date) ?? '',
    description: stringField(meta.description) ?? '',
    series: stringField(meta.series),
    part: typeof meta.part === 'number' ? meta.part : undefined,
    draft: meta.draft === true,
  }
}
