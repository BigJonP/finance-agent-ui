'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">Finance Agent</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="flex space-x-2">
              <Button
                variant={pathname === '/' ? 'default' : 'ghost'}
                asChild
                className="w-full md:w-auto"
              >
                <Link href="/">Dashboard</Link>
              </Button>
              <Button
                variant={pathname === '/profile' ? 'default' : 'ghost'}
                asChild
                className="w-full md:w-auto"
              >
                <Link href="/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
