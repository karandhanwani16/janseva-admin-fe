import { useEffect, useState } from 'react'
import { Moon, Sun, User, Settings, LogOut, Menu, FileText, LayoutDashboard, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTheme } from '@/store/useTheme'
import { Outlet, useNavigate } from 'react-router-dom'
import { ADMIN_HOME_UI, ADMIN_CATEGORIES_UI, ADMIN_PRODUCTS_UI, ADMIN_ORDERS_UI, ADMIN_USERS_UI, ADMIN_PAYMENTS_UI, ADMIN_SETTINGS_UI, ADMIN_COMPANIES_UI } from '@/utils/ROUTES'
import useAuthStore from '@/store/useAuth'
import { capitalizeWords } from '@/utils/utils'
import { toast } from 'react-hot-toast'

export default function AdminLayout() {
    const { isDarkMode, toggleTheme } = useTheme();

    const [activeTab, setActiveTab] = useState('task')
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
            if (window.innerWidth < 768) {
                setIsSidebarCollapsed(true)
            }
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', value: 'dashboard', path: ADMIN_HOME_UI },
        { icon: FileText, label: 'Companies', value: 'companies', path: ADMIN_COMPANIES_UI },
        { icon: FileText, label: 'Categories', value: 'categories', path: ADMIN_CATEGORIES_UI },
        { icon: FileText, label: 'Products', value: 'products', path: ADMIN_PRODUCTS_UI },
        { icon: FileText, label: 'Orders', value: 'orders', path: ADMIN_ORDERS_UI },
        { icon: FileText, label: 'Users', value: 'users', path: ADMIN_USERS_UI },
        { icon: FileText, label: 'Payments', value: 'payments', path: ADMIN_PAYMENTS_UI },
        { icon: FileText, label: 'Settings', value: 'settings', path: ADMIN_SETTINGS_UI },

    ]

    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
    }

    const currentUserName = user?.name;

    return (
        <SidebarProvider>
            <div className={`flex h-screen w-full ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}>

                <Sidebar
                    className={`${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border-r transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-0 md:w-16' : 'w-64'
                        } ${isMobile ? 'absolute z-50 h-full' : ''}`}
                    collapsible="icon"
                >
                    <SidebarHeader className="p-4">
                        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
                            {!isSidebarCollapsed && <h2 className="text-xl font-bold">Janseva Admin</h2>}
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <ScrollArea className="flex-1 px-2">
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.value}>
                                        <TooltipProvider delayDuration={0}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <SidebarMenuButton
                                                        onClick={() => {
                                                            setActiveTab(item.value)
                                                            navigate(item.path)
                                                        }}
                                                        isActive={activeTab === item.value}
                                                        className={`w-full justify-start transition-colors duration-200 ${activeTab === item.value
                                                            ? isDarkMode
                                                                ? 'bg-zinc-800 text-zinc-100'
                                                                : 'bg-zinc-200 text-zinc-900'
                                                            : isDarkMode
                                                                ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                                                                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                                                            }`}
                                                    >
                                                        <item.icon className="h-5 w-5 mr-2" />
                                                        {!isSidebarCollapsed && <span>{item.label}</span>}

                                                    </SidebarMenuButton>
                                                </TooltipTrigger>
                                                {isSidebarCollapsed && (
                                                    <TooltipContent side="right">
                                                        {item.label}
                                                    </TooltipContent>
                                                )}
                                            </Tooltip>
                                        </TooltipProvider>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </ScrollArea>
                    </SidebarContent>
                </Sidebar>

                <div className="flex flex-col flex-1 overflow-hidden w-full">
                    <header className={`flex items-center justify-between p-2 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border-b`}>
                        <div className="flex items-center">
                            <SidebarTrigger onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="mr-4">
                                <Menu className={`h-5 w-5 ${isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'} transition-colors duration-200`} />
                            </SidebarTrigger>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" onClick={toggleTheme} className={isDarkMode ? 'text-zinc-400 hover:text-zinc-100' : 'text-zinc-600 hover:text-zinc-900'}>
                                {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            </Button>
                            <DropdownMenu>

                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-10 rounded-full flex items-center gap-2 px-3">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage className='rounded-md' src="https://github.com/shadcn.png" />
                                            <AvatarFallback>CN</AvatarFallback>
                                        </Avatar>
                                        {!isSidebarCollapsed && !isMobile && (
                                            <>
                                                <span className="text-sm font-medium">{capitalizeWords(currentUserName || '')}</span>
                                                <ChevronDown className="h-4 w-4 text-zinc-500" />
                                            </>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className={`w-56 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`} align="end" forceMount>
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className={isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className={isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className={isDarkMode ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <main className={`flex-1 overflow-auto p-6 ${isDarkMode ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}