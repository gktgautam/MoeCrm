import { useMemo } from "react"
import { NavLink, useLocation, matchPath } from "react-router-dom"
import { ChevronDown } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
 


import { cn } from "@/lib/utils"
import { NAV, type NavItem } from "@/app/layouts/navigation"

function normalizePath(p: string) {
  // normalize trailing slashes except for root
  return p.length > 1 ? p.replace(/\/+$/, "") : p
}

function isActivePath(pathname: string, to: string) {
  const pn = normalizePath(pathname)
  const target = normalizePath(to)

  if (target === "/") return pn === "/"
  return matchPath({ path: target, end: false }, pn) != null
}

export function AppSidebar({ allowedRoutes }: { allowedRoutes: string[] }) {
  const { pathname } = useLocation()

  
  const {
    state, 
    setOpen,   
  } = useSidebar()


  const isCollapsed = state === "collapsed"

  // type-guard to remove null values safely
  const isNavItem = (x: NavItem | null): x is NavItem => x !== null

  // Keep item if:
  // - its own route is allowed OR
  // - it has any allowed descendants
  const filterNav = (items: NavItem[]): NavItem[] =>
    items
      .map((item): NavItem | null => {
        const filteredChildren = item.children ? filterNav(item.children) : undefined

        const isAllowedSelf = allowedRoutes.includes(item.to)
        const hasAllowedChildren = !!filteredChildren?.length

        if (!isAllowedSelf && !hasAllowedChildren) return null

        return {
          ...item,
          children: hasAllowedChildren ? filteredChildren : undefined,
        }
      })
      .filter(isNavItem)

  const nav = useMemo(() => filterNav(NAV), [allowedRoutes])

  return (
    <Sidebar collapsible="icon">
       
        <SidebarHeader className=" border-b items-start pb-4">
          <img src="/images/equentis_logo.svg" alt="Logo" className="h-8 w-auto" />
          { !isCollapsed &&  
             <p className="text-xs text-nowrap">Marketing Platform</p> 
          }
        </SidebarHeader>


      <SidebarContent className="mt-10">
        <SidebarGroup>
          <SidebarMenu>
            {nav.map((item) => {
              if (item.children?.length) {
                const parentActive = item.children.some((c) =>
                  isActivePath(pathname, c.to)
                )

              

                return (
                  <Collapsible key={item.label} defaultOpen={parentActive}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild 
                       onClick={() => {
                           setOpen(true)
                        }}
                        >
                        <SidebarMenuButton className={cn(parentActive && "bg-accent text-accent-foreground font-medium")} tooltip={item.label}> 
                            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                            {item.label}  
                          <ChevronDown className="ml-auto transition-transform data-[state=open]:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                        <div className="p-1">
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const childActive = isActivePath(pathname, child.to)

                              return (
                                <SidebarMenuSubItem key={child.label}>
                                  <SidebarMenuButton asChild>
                                    <NavLink to={child.to}  className={cn(childActive && "bg-accent text-accent-foreground font-medium")} end={false} >
                                      {child.label}
                                    </NavLink>
                                  </SidebarMenuButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </div>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                )
              }

              const linkActive = isActivePath(pathname, item.to)

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton tooltip={item.label}
                    asChild
                    className={cn(
                      linkActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <NavLink to={item.to} end={normalizePath(item.to) === "/"}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.label}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
