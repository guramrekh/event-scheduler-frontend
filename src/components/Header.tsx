
import { NavLink, Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  Menu,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { mockNotifications } from "@/data/mockData";
import UserProfile from "./dashboard/UserProfile";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const Header = () => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `transition-colors hover:text-foreground ${
      isActive ? "text-foreground font-semibold" : "text-muted-foreground"
    }`;
  
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="/"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <Calendar className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Event Scheduler</span>
            </Link>
            <NavLink to="/dashboard" end className={({isActive}) => isActive ? "font-bold" : ""}>
              Events
            </NavLink>
            <NavLink to="/dashboard/invitations" className={({isActive}) => isActive ? "font-bold" : ""}>
              Invitations
            </NavLink>
          </nav>
        </SheetContent>
      </Sheet>
      
      <div className="relative ml-auto flex-1 md:grow-0">
         <Link to="/" className="hidden items-center gap-2 font-semibold sm:flex">
            <Calendar className="h-6 w-6" />
            <span>Event Scheduler</span>
          </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium mx-auto">
          <NavLink to="/dashboard" end className={navLinkClasses}>Events</NavLink>
          <NavLink to="/dashboard/invitations" className={navLinkClasses}>Invitations</NavLink>
      </nav>

      <div className="relative ml-auto flex items-center gap-4 md:grow-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0" variant="destructive">{unreadCount}</Badge>}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockNotifications.length > 0 ? mockNotifications.map(notif => (
              <DropdownMenuItem key={notif.id} className={`p-2 items-start ${!notif.read ? 'bg-secondary/50' : ''}`}>
                <div className="flex items-start gap-3">
                  {notif.user ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notif.user.avatar} alt={notif.user.name} />
                      <AvatarFallback>{notif.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                        <Calendar className="h-4 w-4" />
                    </div>
                  )}
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-snug">
                      {notif.user ? <UserProfile user={notif.user} /> : <strong>{notif.eventName}</strong>}
                      <span className="font-normal text-muted-foreground ml-1">{notif.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            )) : (
              <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <img src="/placeholder.svg" className="rounded-full h-8 w-8" alt="user avatar"/>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/dashboard/settings">Settings</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/">Logout</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
