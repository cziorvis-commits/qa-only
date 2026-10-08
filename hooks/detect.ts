// "question …", "Q …", "q: …" at the start of the first line (not "quick", "query").
// Slash commands are never questions.
const PREFIX = /^(question|q)(?![a-z0-9])/i

export const isQuestion = (text: string): boolean => {
  const trimmed = text.trim()
  if (trimmed === '' || trimmed.startsWith('/')) return false

  return PREFIX.test(trimmed.split('\n', 1)[0].trim())
}
