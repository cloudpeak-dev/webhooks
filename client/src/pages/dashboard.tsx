import { useQuery } from '@tanstack/react-query'

import { fetchAllLogs } from '@/features/logs'
import type { Log } from '@/features/logs.types'

export const Dashboard = () => {
  const allLogs = useQuery({ queryKey: ['logs'], queryFn: fetchAllLogs })

  if (allLogs.isLoading) {
    return <div>Loading...</div>
  }

  if (allLogs.data) {
    return (
      <div className='flex flex-col gap-4'>
        {allLogs.data.map((log: Log) => (
          <article
            key={log._id}
            className='border border-solid border-text p-5 bg-background rounded-md flex flex-col gap-2'
          >
            <header className='text-sm flex flex-col gap-1'>
              <span className='font-bold uppercase'>{log.type}</span>
              <span>{new Date(log.start_date).toLocaleString()}</span>
              {log.github_commit_data && (
                <>
                  <a
                    href={log.github_commit_data.html_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline text-blue-600'
                  >
                    {log.github_commit_data.commit.message}
                  </a>
                  <span>
                    {log.github_commit_data.commit.author.name}{' '}
                    ({new Date(log.github_commit_data.commit.author.date).toLocaleString()})
                  </span>
                  <span className='text-xs'>{log.github_commit_data.sha}</span>
                </>
              )}
            </header>
            <pre className='whitespace-pre-wrap break-words text-left text-sm'>
              {log.log}
            </pre>
            <footer className='text-xs text-gray-500'>
              Runtime: {Math.round(log.running_time_in_seconds)}s
            </footer>
          </article>
        ))}
      </div>
    )
  }
}
