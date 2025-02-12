import { Link } from "wouter";
import { Leaf, Plus, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-semibold">PlantCare</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/"><span className="hidden md:inline">My Plants</span></Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/add"><Plus className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Add Plant</span></Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/guide/all"><Book className="h-4 w-4 md:mr-2" /><span className="hidden md:inline">Care Guides</span></Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}