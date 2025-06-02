import { Outlet } from 'react-router'

export const Layout = () => {
  return (
    <div className='h-screen w-screen flex flex-col gap-10 p-5'>
      <header className='text-xl'>
        Portfolio [
        <a href='https://rokas.site' target='_blank'>
          rokas.site
        </a>
        ]
      </header>

      <main className='flex flex-col h-full gap-5 min-h-0'>
        <Outlet />
      </main>
    </div>
  )
}
