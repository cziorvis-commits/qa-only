import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { isQuestion } from './detect'

const isActive = atom({ plugin: 'qa-only', key: 'isActive' } as const, false)
const isEnabled = atom({ plugin: 'qa-only', key: 'isEnabled' } as const, true)

// Tools that change things or start a plan; reading and searching stay allowed.
const BLOCKED = new Set(['Edit', 'Write', 'NotebookEdit', 'EnterPlanMode', 'ExitPlanMode'])

const CONTEXT = [
  'QA-only mode: the user is asking a question and wants a chat answer, not work done.',
  'Answer directly in conversation. Do not edit or create files, run commands that change state,',
  'write a coding plan, or start implementing. Reading files or searching to inform the answer is fine.',
  'If the answer implies a change, describe it briefly and stop; the user will ask for it explicitly.',
].join(' ')

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const stored = await $.store.get('isEnabled')
    if (typeof stored === 'boolean') await update($, isEnabled, () => stored)
    await $.command.register({
      name: 'qa-only',
      description: 'Turn QA-only auto-detect on or off (on | off | toggle)',
    })

    return next(e)
  })

  on('command.run', { command: 'qa-only' }, async ($, e) => {
    const word = e.args.trim().toLowerCase()
    const current = await read($, isEnabled)
    const wanted = word === 'on' ? true : word === 'off' ? false : !current
    await update($, isEnabled, () => wanted)
    await $.store.set('isEnabled', wanted)
    if (!wanted) await update($, isActive, () => false)

    return { text: `QA-only auto-detect is ${wanted ? 'on' : 'off'}.` }
  })

  on('prompt.submit', async ($, e, next) => {
    const isQa = (await read($, isEnabled)) && isQuestion(e.text)
    await update($, isActive, () => isQa)

    return isQa ? next({ ...e, context: [...(e.context ?? []), CONTEXT] }) : next(e)
  }).catch(($, e, next) => next(e))

  on('tool.call', async ($, e, next) => {
    if (BLOCKED.has(e.tool) && (await read($, isActive))) {
      return { deny: `${$.plugin.name}: this was a question, so no edits or plans. Answer in chat instead.` }
    }

    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isEnabled))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    const active = await read($, isActive)

    return (
      <Box flexDirection="row" justifyContent="flex-end" width="100%">
        <Text color="black" backgroundColor={active ? 'green' : 'gray'} bold>
          {' ? '}
        </Text>
      </Box>
    )
  })
}
