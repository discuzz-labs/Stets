import { Button } from '@/components/ui/button';
import { Terminal, Cog, ShieldHalf, PartyPopper, LibraryBig} from "lucide-react"
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center gap-10 min-h-screen dark:homeGradient">
      <p className="text-3xl text-center font-semibold">A <Cog size={30} className="inline-block align-middle mx-1 text-zinc-500"/> zero-config, type-safe, <ShieldHalf size={30} className="inline-block align-middle mx-1 text-green-500" /> TypeScript-native <br /> testing framework and runner <PartyPopper size={30} className="inline-block align-middle mx-1 text-yellow-500" />!</p>
      <div className="flex gap-5 items-center justify-center w-full">
        <Link href="/docs"> 
        <Button><LibraryBig /> Documentation</Button>
        </Link>
        <Button variant="outline"><Terminal /> npm i -g veve </Button>
      </div>
    </main>
  );
}