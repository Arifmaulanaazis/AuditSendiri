import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { getSettings, updateSettings, type AppSettings } from "../lib/api";
import { Save } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings>({
        rt_name: "",
        rw_name: "",
        kelurahan: "",
        kecamatan: "",
        address: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const isAdmin = () => {
        const user = localStorage.getItem('user');
        if (!user) return false;
        try {
            const parsed = JSON.parse(user);
            return parsed.role === 'admin';
        } catch {
            return false;
        }
    };

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            await updateSettings(settings);
            setMessage({ text: "Pengaturan berhasil disimpan!", type: 'success' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error(error);
            setMessage({ text: "Gagal menyimpan pengaturan.", type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        window.location.href = "/";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 pb-20"
        >
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Pengaturan</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="glass-card border-none shadow-lg h-full">
                        <CardHeader>
                            <CardTitle>Identitas Wilayah (RT/RW)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="rt_name">RT</Label>
                                        <Input
                                            id="rt_name"
                                            name="rt_name"
                                            value={settings.rt_name}
                                            onChange={handleChange}
                                            placeholder="001"
                                            className="bg-background/50"
                                            disabled={!isAdmin()}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rw_name">RW</Label>
                                        <Input
                                            id="rw_name"
                                            name="rw_name"
                                            value={settings.rw_name}
                                            onChange={handleChange}
                                            placeholder="005"
                                            className="bg-background/50"
                                            disabled={!isAdmin()}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kelurahan">Kelurahan / Desa</Label>
                                    <Input
                                        id="kelurahan"
                                        name="kelurahan"
                                        value={settings.kelurahan}
                                        onChange={handleChange}
                                        placeholder="Contoh: Sukamaju"
                                        className="bg-background/50"
                                        disabled={!isAdmin()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="kecamatan">Kecamatan</Label>
                                    <Input
                                        id="kecamatan"
                                        name="kecamatan"
                                        value={settings.kecamatan}
                                        onChange={handleChange}
                                        placeholder="Contoh: Lowokwaru"
                                        className="bg-background/50"
                                        disabled={!isAdmin()}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Alamat Sekretariat</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        value={settings.address}
                                        onChange={handleChange}
                                        placeholder="Jl. Mawar No. 10"
                                        className="bg-background/50"
                                        disabled={!isAdmin()}
                                    />
                                </div>

                                {message && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                                    >
                                        {message.text}
                                    </motion.div>
                                )}

                                {isAdmin() && (
                                    <div className="pt-2">
                                        <Button type="submit" variant="neon" disabled={loading} className="w-full">
                                            {loading ? "Menyimpan..." : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                                {!isAdmin() && (
                                    <div className="pt-2 text-center text-sm text-muted-foreground">
                                        Hanya admin yang dapat mengubah pengaturan
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <Card className="glass-card border-none shadow-lg">
                        <CardHeader>
                            <CardTitle>Tentang Aplikasi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg">AuditSendiri v1.0.0</h3>
                                <p className="text-sm text-muted-foreground italic">"Karena kepercayaan itu dibangun dari catatan."</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Aplikasi pembukuan kas warga yang transparan dan dapat diaudit oleh warga sendiri.
                                </p>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <polyline points="16 18 22 12 16 6"></polyline>
                                        <polyline points="8 6 2 12 8 18"></polyline>
                                    </svg>
                                    Technology Stack
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Backend</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Go 1.25</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Fiber v2</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">SawitDB</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">JWT</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">bcrypt</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Frontend</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">JokoUI</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">React 19</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">TypeScript</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">Vite</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">TailwindCSS v4</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">Framer Motion</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-1">Database & Query</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">SawitDB</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent-foreground border border-accent/20">AQL</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    Security Features
                                </h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>Password hashing dengan bcrypt</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>JWT authentication</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>Protected API routes</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500 mt-0.5">✓</span>
                                        <span>Audit trail untuk semua perubahan</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h4 className="font-semibold text-sm mb-2">Prinsip Design</h4>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span><strong>Local-first:</strong> Semua data tersimpan lokal</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span><strong>Single source of truth:</strong> Append-only log</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        <span><strong>Transparent:</strong> Semua perubahan tercatat</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="border-t border-white/10 pt-4">
                                <h4 className="font-semibold text-sm mb-2">Developer</h4>
                                <p className="text-sm text-muted-foreground">Open Source Community</p>
                                <p className="text-xs text-muted-foreground mt-1">Built with ❤️ for Indonesian communities</p>
                            </div>

                            <div className="pt-4">
                                <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 w-full" onClick={handleLogout}>
                                    Keluar Aplikasi / Logout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
