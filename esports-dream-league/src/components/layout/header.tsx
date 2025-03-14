// src/components/layout/header.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">Esports Dream League</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80">
              Home
            </Link>
            <Link href="/match-simulation" className="transition-colors hover:text-foreground/80">
              Match Simulation
            </Link>
            <Link href="/teams" className="transition-colors hover:text-foreground/80">
              Teams
            </Link>
            <Link href="/players" className="transition-colors hover:text-foreground/80">
              Players
            </Link>
            <Link href="/tournaments" className="transition-colors hover:text-foreground/80">
              Tournaments
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="secondary">Connect Wallet</Button>
        </div>
      </div>
    </header>
  )
}