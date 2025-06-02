export type Log = {
  _id: string
  date: string
  log: string
  type: 'github' | 'datocms'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  github_commit_data?: Record<string, any>
}
