import { Sun } from "lucide-react";
const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center gap-2">
          {/* Logo Icon */}
          <Sun className="h-6 w-6 text-yellow-500 rotate-0 transition-all hover:rotate-45" />

          <span className="hidden font-bold sm:inline-block">
            Solar Tracker Control
          </span>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none"></div>
          <nav className="flex items-center">
            <span className="text-sm text-muted-foreground">v1.0.0</span>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
