import clsx from 'clsx'

type Props = {
  success: boolean
}

export const Status = ({ success }: Props) => {
  return (
    <div className='flex items-center gap-2'>
      <div
        className={clsx('w-4 h-4 rounded-full', {
          'bg-ready': success,
          'bg-failed': !success,
        })}
      ></div>
      <span>{success ? 'Ready' : 'Failed'}</span>
    </div>
  )
}
