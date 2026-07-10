import { subtle } from 'node:crypto'
import path from 'node:path'

// Most filesystems cap a single path component at 255 bytes.
const maxFileNameBytes = 200
const encoder = new TextEncoder()

// eslint-disable-next-line no-control-regex
const controlCharacters = /[\u0000-\u001F\u007F]/gu
// `#`, `?` and `%` change how a key is parsed once it is resolved against a storage host.
const urlUnsafeCharacters = /[#%?]/gu

function getByteLength(value: string) {
  return encoder.encode(value).length
}

function truncateToBytes(value: string, maxBytes: number) {
  let result = value
  while (result && getByteLength(result) > maxBytes) {
    result = [...result].slice(0, -1).join('')
  }
  return result
}

/**
 * Reduces an uploaded file's name to a single path component that is safe to use both as a
 * filesystem path and as a URL, falling back to `fallbackName` when nothing usable remains.
 */
export function getSafeFileName(fileName: string, fallbackName: string) {
  const base = fileName.split(/[/\\]/u).at(-1) || ''
  const stripped = base.replaceAll(controlCharacters, '').replaceAll(urlUnsafeCharacters, '_').trim()

  if (!stripped || stripped === '.' || stripped === '..') {
    return fallbackName
  }

  if (getByteLength(stripped) <= maxFileNameBytes) {
    return stripped
  }

  const { ext, name } = path.parse(stripped)
  const truncated = truncateToBytes(name, Math.max(0, maxFileNameBytes - getByteLength(ext)))
  return truncated ? `${truncated}${ext}` : fallbackName
}

export async function getFilePartialDigest(file: File) {
  const header = await file.slice(0, 1024).arrayBuffer()
  const footer = await file.slice(-1024).arrayBuffer()
  const data = new Uint8Array(header.byteLength + footer.byteLength + 8)
  data.set(new Uint8Array(header), 0)
  data.set(new Uint8Array(footer), header.byteLength)
  new DataView(data.buffer).setBigUint64(header.byteLength + footer.byteLength, BigInt(file.size), true)
  const hash = await subtle.digest('SHA-256', data)
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}
