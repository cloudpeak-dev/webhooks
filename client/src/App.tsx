import { useEffect, useState } from 'react'

function App() {
  const [isHealthy, setIsHealthy] = useState(true)
  const [output, setOutput] = useState('')
  // const [all, setAll] = useState()

  useEffect(() => {
    const handleFetch = async () => {
      const response = await fetch('/api/logs/current')

      if (!response.ok) {
        setIsHealthy(false)
      }

      const text = await response.text()
      setOutput(text)
    }

    const intervalId = setInterval(async () => {
      await handleFetch()
    }, 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const handleFetch = async () => {
      // const response = await fetch('/api/logs')
      // const result = await response.json()
      // setAll(result)
      // setOutput(result.results[0].log);
    }

    handleFetch()
  }, [])

  return (
    <>
      <div className='text-xl flex justify-between'>
        <div>Latest Build Log</div>
        <div>Webhook Status: {isHealthy ? 'OK' : 'Unavailable'}</div>
      </div>

      <div className='border border-solid border-text p-5 bg-background h-full box-border flex justify-center items-start rounded-md min-h-0 text-center'>
        <div className='flex flex-col-reverse overflow-y-scroll max-h-full'>
          <pre className='w-full whitespace-pre-wrap m-0 text-sm'>{output}</pre>
        </div>
      </div>
    </>
  )
}

export default App
