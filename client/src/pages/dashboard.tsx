import { useQuery } from '@tanstack/react-query'

import { fetchAllLogs } from '@/features/logs'

export const Dashboard = () => {
  const allLogs = useQuery({ queryKey: ['logs'], queryFn: fetchAllLogs })

  if (allLogs.isLoading) {
    return <div>Loading...</div>
  }

  if (allLogs.data) {
    return (
      <>
        {allLogs.data.map((log) => (
          <div
            key={log._id}
            className='border border-solid border-text p-5 bg-background h-full box-border flex justify-center items-start rounded-md min-h-0 text-center'
          >
            {log.type}
            Ready main
            {new Date(log.date).toLocaleString()}
            {log.github_commit_data?.sha}
            {log.github_commit_data?.commit?.message}
          </div>
        ))}
      </>
    )
  }
}
