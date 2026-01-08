import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Receipt,
    Users,
    Menu,
    Sun,
    Moon,
    LogOut,
    Settings,
    X,
    User,
    ScrollText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import { useTheme } from "../components/ThemeProvider";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<{ full_name: string, username: string, role: string } | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error(e);
            }
        }

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsSidebarOpen(false);
        }
        setIsProfileOpen(false);
    }, [location.pathname, isMobile]);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/transactions", label: "Transaksi", icon: Receipt },
        { href: "/users", label: "Pengguna", icon: Users },
        { href: "/audit-log", label: "Audit Log", icon: ScrollText },
        { href: "/settings", label: "Pengaturan", icon: Settings },
    ];

    const SidebarContent = () => (
        <>
            <div className="flex h-16 items-center justify-between px-6 border-b border-border/50">
                <span className="text-xl font-bold text-primary flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
                        <span className="text-primary font-bold">A</span>
                    </div>
                    AuditSendiri
                </span>
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <nav className="space-y-1 p-4 flex-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                                isActive
                                    ? "text-primary shadow-[0_0_10px_rgba(101,163,13,0.2)] border border-primary/30 bg-primary/20"
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeNavIndicator"
                                    className="absolute inset-0 bg-primary/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                            )}
                            <Icon className="h-5 w-5 relative z-10" />
                            <span className="relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border/50 text-xs text-muted-foreground text-center">
                v1.0.0
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-background gradient-mesh overflow-hidden">
            <AnimatePresence>
                {isMobile && isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {(isSidebarOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? { x: "-100%" } : { width: 0, opacity: 0 }}
                        animate={isMobile ? { x: 0 } : { width: "16rem", opacity: 1 }}
                        exit={isMobile ? { x: "-100%" } : { width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "fixed inset-y-0 left-0 z-50 flex flex-col glass border-r",
                            isMobile ? "w-64 h-full" : "relative translate-x-0 m-4 rounded-xl border h-[calc(100vh-2rem)]"
                        )}
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            <div className="flex flex-1 flex-col overflow-hidden relative">
                <header className="flex h-16 items-center justify-between mx-4 md:mx-6 mt-4 rounded-xl glass px-4 md:px-6 transition-all duration-300 relative z-40">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="hover:bg-primary/10"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="md:hidden font-bold text-lg">AuditSendiri</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="rounded-full hover:bg-primary/10"
                        >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <div className="relative">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                <div className="h-9 w-9 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center shadow-sm cursor-pointer hover:bg-primary/30 transition-colors">
                                    <span className="text-xs font-bold text-primary">{user ? user.full_name.substring(0, 2).toUpperCase() : 'AD'}</span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-2 w-56 rounded-lg glass border border-white/20 shadow-xl p-1 z-50"
                                    >
                                        <div className="px-2 py-1.5 border-b border-white/10 mb-1">
                                            <p className="text-sm font-medium">{user?.full_name || 'Admin'}</p>
                                            <p className="text-xs text-muted-foreground truncate">@{user?.username || 'admin'}</p>
                                        </div>
                                        <Link to="/profile" className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-primary/10 transition-colors w-full text-left" onClick={() => setIsProfileOpen(false)}>
                                            <User className="h-4 w-4" />
                                            Profil Saya
                                        </Link>
                                        <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors w-full text-left">
                                            <LogOut className="h-4 w-4" />
                                            Keluar
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
