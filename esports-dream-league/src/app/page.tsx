// src/app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Blockchain-based Esports Management
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Collect athlete NFTs, form teams, and compete in AI-driven tournaments on the Solana blockchain.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/match-simulation">
                  <Button className="w-full">Try Match Simulation</Button>
                </Link>
                <Link href="/teams">
                  <Button variant="outline" className="w-full">Browse Teams</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-xl bg-secondary p-8">
              <div className="grid gap-4 text-center">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Game Features</h2>
                  <p className="text-muted-foreground">Experience the future of esports management</p>
                </div>
                <ul className="grid gap-2 text-left">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Collect and train esports athlete NFTs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Form teams with complementary skills</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Compete in AI-simulated tournaments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Earn rewards for victories</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Create exclusive athletes as verified creators</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}