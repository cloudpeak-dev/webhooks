import Dato from '@/assets/dato.png'
import Github from '@/assets/github.png'

type Props = {
  type: 'github' | 'datocms'
}

export const Logo = ({ type }: Props) => {
  return (
    <div className='w-24'>
      {type === 'github' && <img className='-ml-1.5' src={Github} />}
      {type === 'datocms' && <img src={Dato} />}
    </div>
  )
}
