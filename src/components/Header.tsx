import { NavLink } from "@/components/NavLink";
import { Coins } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">PigMint Finance</h1>
        </div>
        
        <nav className="flex gap-6">
          <NavLink 
            to="/dashboard" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-primary font-semibold"
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/reports" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-primary font-semibold"
          >
            Reports
          </NavLink>
        </nav>
      </div>
    </header>
  );
};
