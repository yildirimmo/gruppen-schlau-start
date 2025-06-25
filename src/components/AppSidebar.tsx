
import { useState } from "react";
import { 
  Home, 
  Users, 
  Calendar, 
  Shield, 
  LogOut,
  User
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
  const { isAdmin } = useAdminCheck();
  const navigate = useNavigate();
  const { state } = useSidebar();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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

  const allItems = user ? (isAdmin ? [...userItems, ...adminItems] : userItems) : [
    { title: "Startseite", url: "/", icon: Home }
  ];

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
              {allItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={({ isActive }) => 
                        isActive 
                          ? "bg-blue-100 text-blue-900 font-medium" 
                          : "hover:bg-gray-100"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
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
