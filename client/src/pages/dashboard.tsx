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
            <header className='text-sm flex flex-col'>
              <span className='font-bold uppercase'>{log.type}</span>
              <span>{new Date(log.start_date).toLocaleString()}</span>
              {log.github_commit_data?.sha && (
                <span>{log.github_commit_data.sha}</span>
              )}
              {log.github_commit_data?.commit?.message && (
                <span>{log.github_commit_data.commit.message}</span>
              )}
            </header>
            <pre className='whitespace-pre-wrap break-words text-left text-sm'>
              {log.log}
            </pre>
          </article>
        ))}
      </div>
    )
  }
}
