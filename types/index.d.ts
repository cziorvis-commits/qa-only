export type QaFlag = boolean

declare module 'claude-code' {
  interface PluginState {
    'qa-only': { isActive: QaFlag; isEnabled: QaFlag }
  }
}
