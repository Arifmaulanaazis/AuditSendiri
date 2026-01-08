import { Outlet, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";

export default function PublicLayout() {
    const { theme, setTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background flex flex-col gradient-mesh transition-colors duration-300">
            <header className="sticky top-0 z-50 border-b glass">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
                            <span className="text-primary font-bold">A</span>
                        </div>
                        AuditSendiri
                    </Link>
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
                        <Button asChild variant="neon">
                            <Link to="/login">Login</Link>
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <footer className="border-t py-6 glass text-center text-sm text-muted-foreground mt-auto">
                &copy; {new Date().getFullYear()} AuditSendiri. All rights reserved.
            </footer>
        </div>
    );
}
