// src/components/layout/footer.tsx
export default function Footer() {
    return (
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Esports Dream League. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built with Next.js 14 and Solana Kit
            </p>
          </div>
        </div>
      </footer>
    )
  }