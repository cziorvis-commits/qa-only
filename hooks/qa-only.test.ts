import { expect, test } from 'claude-code/testing'

import { isQuestion } from './detect'

test('detects question prompts', () => {
  for (const text of ['question: why?', 'Q how does genlock work', 'q: x', 'q']) {
    expect(isQuestion(text)).toBe(true)
  }
  for (const text of ['quick fix the bug', 'query the db', 'add a button', '/qa-only off', 'qualify this', '', 'what is this?', 'can you fix the build?']) {
    expect(isQuestion(text)).toBe(false)
  }
})

test('a question gets answer-only context and edits are denied', async ($, on) => {
  let context: readonly string[] | undefined
  on('prompt.submit', (_, e) => {
    context = e.context
    return { text: e.text, context: e.context }
  })
  on('tool.call', () => ({ ref: 'r', result: {}, text: 'ran' }) as never)

  await $.prompt.submit({ text: 'Q what does stage.yaml do' })
  expect((context ?? []).join(' ')).toContain('QA-only mode')
  const denied = await $.tool.call({ tool: 'Write', file_path: '/tmp/x', content: 'y' })
  expect(JSON.stringify(denied)).toContain('no edits')

  await $.prompt.submit({ text: 'add a health check' })
  expect(context).toBeUndefined()
})
