export type Log = {
  _id: string
  start_date: string
  running_time_in_seconds: number
  log: string
  type: 'github' | 'datocms'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  github_commit_data?: Record<string, any>
}
