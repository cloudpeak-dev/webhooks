import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'

import { DateDistance } from '@/components/date-distance'
import { Logo } from '@/components/logo'
import { Status } from '@/components/status'

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
          <Link
            to={log._id}
            key={log._id}
            className='border border-solid border-text p-5 bg-background rounded-md flex flex-col gap-2'
          >
            <header className='text-base flex flex-col gap-1'>
              <Logo type={log.type} />
              <span className='font-bold uppercase'>{log.type}</span>
              <div className='flex gap-1'>
                <div>{Math.round(log.running_time_in_seconds)}s</div>
                <div>
                  ({log.end_date && <DateDistance date={log.end_date} />})
                </div>
              </div>
              <Status success={log.success} />
              {log.github_commit_data && (
                <>
                  <span>{log.github_commit_data.sha.substring(0, 7)}</span>

                  <a
                    href={log.github_commit_data.html_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline text-blue-600'
                  >
                    {log.github_commit_data.commit.message}
                  </a>
                </>
              )}
            </header>
            {/* <pre className='whitespace-pre-wrap break-words text-left text-sm'>
              {log.log}
            </pre> */}
          </Link>
        ))}
      </div>
    )
  }
}
