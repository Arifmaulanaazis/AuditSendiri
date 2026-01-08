import { useState } from "react";
import { useToast } from "../components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";
import { motion } from "framer-motion";

export default function Login() {
    const { toast } = useToast();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { default: api } = await import("../lib/api");
            const res = await api.post('/login', { username, password });
            const data = res.data;

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate("/dashboard");
        } catch (err: any) {
            console.error(err);
            toast({
                variant: "destructive",
                title: "Login Gagal",
                description: err.response?.data?.error || err.message || "Periksa username dan password anda."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-background">
            <div className="absolute top-0 left-0 w-full h-full gradient-mesh -z-20 opacity-50 dark:opacity-20" />
            <motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-primary/20 blur-[80px] md:blur-[120px] rounded-full -z-10"
            />
            <motion.div
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0],
                    scale: [1, 1.2, 1]
                }}
                transition={{ duration: 7, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-accent/20 blur-[80px] md:blur-[120px] rounded-full -z-10"
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-sm"
            >
                <Card className="glass-card border-white/20 dark:border-white/10 shadow-2xl relative z-10 overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    <CardHeader className="text-center space-y-2 relative">
                        <div className="flex justify-center mb-2">
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg border border-white/20"
                            >
                                <span className="text-3xl font-bold text-white">A</span>
                            </motion.div>
                        </div>
                        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Login Admin</CardTitle>
                        <CardDescription>
                            Masuk untuk mengelola data keuangan desa.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="grid gap-4 relative">
                            <div className="grid gap-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" type="text" placeholder="admin" required value={username} onChange={e => setUsername(e.target.value)} className="bg-background/30 border-primary/20 focus:border-primary/50 focus:ring-primary/20 transition-all hover:border-primary/40" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="bg-background/30 border-primary/20 focus:border-primary/50 focus:ring-primary/20 transition-all hover:border-primary/40" />
                            </div>
                        </CardContent>
                        <CardFooter className="relative">
                            <Button className="w-full shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02]" variant="default" type="submit" disabled={loading}>
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                ) : "Login"}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
