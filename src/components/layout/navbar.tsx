import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "../../components/mode-toggle";
import { MainNav } from "../../components/layout/main-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export function Navbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold">
            Feest
          </Link>
          <MainNav />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/events/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </div>
  );
}
