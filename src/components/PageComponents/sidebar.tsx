import { LayoutGrid, Plus, Users, ClipboardList, UserCog, Calendar, LogOut, User, ChevronDown, Home, Settings, X, ChevronsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {toast} from "sonner";
import { useState, useMemo } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {auth} from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar = ({ isMobileOpen, setMobileOpen }: SidebarProps) => {
  const [programsOpen, setProgramsOpen] = useState(true);
  const router =useRouter();  
  const programs = [
  { id: 1, name: 'Program 1', rounds: [{ id: 1, name: 'Round 1' }] },
  { id: 2, name: 'Program 2', rounds: [{ id: 2, name: 'Round 2' }] },
  { id: 3, name: 'Program 3', rounds: [{ id: 3, name: 'Round 3' }] },
];
  
  // Get user data from auth service
  const currentUser = auth.api.accountInfo;
  
  // Process user data for display
  const userName = currentUser.name || currentUser?.name || "";
  const userRole = "User";
  
  // Create user initials from name
  const userInitials = useMemo(() => {
    console.log(currentUser);
    if (!userName) return "GU";
    return userName
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }, [userName]);
  
  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();  
    router.push("/");
    closeMobileMenu();
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Create Program", href: "/create-program", icon: Plus },
    { name: "Manage Panelists", href: "/manage-panelists", icon: Users },
    { name: "Schedule Interviews", href: "/schedule-interviews", icon: Calendar },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Mobile close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 md:hidden"
        onClick={() => setMobileOpen(false)}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard">
          <span className="text-xl font-bold">HireGrid</span>
        </Link>
      </div>

      {/* User profile section */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-slate-500">{userRole}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobileMenu}
              className="group flex items-center rounded-md p-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
    
      
      {/* Logout button */}
      <div className="p-2 border-t border-slate-200">
        <div 
          onClick={handleLogout}
          className="flex items-center px-4 py-2.5 rounded-md cursor-pointer hover:bg-red-50 text-slate-700 hover:text-red-600 transition-colors duration-200"
        >
          <div className="flex items-center justify-center h-9 w-9 rounded-md mr-3 bg-red-100 text-red-500">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </div>
      </div>
    </div>
  );}

export default Sidebar;
