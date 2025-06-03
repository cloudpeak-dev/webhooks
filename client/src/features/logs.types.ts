export type GithubCommitAuthor = {
  name: string
  date: string
}

export type GithubCommitData = {
  sha: string
  html_url: string
  commit: {
    message: string
    author: GithubCommitAuthor
  }
}

export type Log = {
  _id: string
  start_date: string
  running_time_in_seconds: number
  log: string
  type: 'github' | 'datocms'
  github_commit_data?: GithubCommitData
}
