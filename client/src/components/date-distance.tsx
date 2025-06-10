import { formatDistanceToNowStrict } from 'date-fns'
import { Tooltip } from 'radix-ui'

type Props = {
  date: string
}

export const DateDistance = ({ date }: Props) => {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className='cursor-pointer'>
            {formatDistanceToNowStrict(date)} ago
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className='bg-dark py-1 px-2 rounded-lg text-sm'
            sideOffset={5}
          >
            {new Date(date).toLocaleString()}
            <Tooltip.Arrow className='fill-dark' />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
