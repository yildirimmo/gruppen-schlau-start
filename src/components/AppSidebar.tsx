
import { useState } from "react";
import { 
  Home, 
  Users, 
  Calendar, 
  Shield, 
  LogOut,
  User,
  Loader2
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminCheck } from "@/hooks/useAdminCheck";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Debug logging
  console.log('AppSidebar - User:', user?.id);
  console.log('AppSidebar - Is Admin:', isAdmin);
  console.log('AppSidebar - Is Checking Admin:', isCheckingAdmin);

  // Navigation items for all users
  const userItems = [
    { title: "Startseite", url: "/", icon: Home },
    { title: "Dashboard", url: "/dashboard", icon: User },
    { title: "Verfügbarkeit", url: "/availability", icon: Calendar },
  ];

  // Additional items for admins
  const adminItems = [
    { title: "Admin Panel", url: "/admin", icon: Shield },
  ];

  // Build navigation items based on user state
  let allItems = [];
  
  if (!user) {
    // Not logged in - only show home page
    allItems = [{ title: "Startseite", url: "/", icon: Home }];
  } else {
    // Logged in - show user items
    allItems = [...userItems];
    
    // If admin check is still loading, show loading placeholder for admin items
    if (isCheckingAdmin) {
      allItems.push({
        title: state !== "collapsed" ? "Admin wird geladen..." : "...",
        url: "#",
        icon: Loader2,
        isLoading: true
      });
    } else if (isAdmin) {
      // Admin check complete and user is admin - show admin items
      allItems.push(...adminItems);
      console.log('Admin items added to sidebar');
    } else {
      console.log('User is not admin, no admin items shown');
    }
    // If not admin and not loading, don't show admin items at all
  }

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-blue-600" />
          {state !== "collapsed" && <span className="font-bold text-gray-900">GruppenSchlau</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item, index) => (
                <SidebarMenuItem key={item.title || `loading-${index}`}>
                  <SidebarMenuButton asChild={!item.isLoading}>
                    {item.isLoading ? (
                      <div className="flex items-center gap-2 px-2 py-2 text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </div>
                    ) : (
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className={({ isActive }) => 
                          `flex items-center gap-2 px-2 py-2 rounded transition-colors ${
                            isActive 
                              ? "bg-blue-100 text-blue-900 font-medium" 
                              : "hover:bg-gray-100"
                          }`
                        }
                        onClick={(e) => {
                          console.log(`Navigating to: ${item.url}`);
                          if (item.url === "#") {
                            e.preventDefault();
                          }
                        }}
                      >
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                {state !== "collapsed" && <span>Abmelden</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
