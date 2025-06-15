
import { NavLink, Link } from "react-router-dom";
import { Bell, Calendar, Home, Settings, Users, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Sidebar = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      isActive ? "bg-muted text-primary" : "text-muted-foreground"
    }`;

  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Calendar className="h-6 w-6" />
            <span>Event Scheduler</span>
          </Link>
        </div>
        <div className="flex-1">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <NavLink to="/dashboard" end className={navLinkClasses}>
              <Home className="h-4 w-4" />
              Events
            </NavLink>
            <NavLink to="/dashboard/invitations" className={navLinkClasses}>
              <Users className="h-4 w-4" />
              Invitations
            </NavLink>
            <NavLink to="/dashboard/settings" className={navLinkClasses}>
              <Settings className="h-4 w-4" />
              Settings
            </NavLink>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button size="sm" className="w-full" asChild>
            <Link to="/">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
