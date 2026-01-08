import { useState } from "react";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/Card";

export default function Setup() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const target = e.target as typeof e.target & {
            rt: { value: string };
            rw: { value: string };
            kelurahan: { value: string };
            kecamatan: { value: string };
            address: { value: string };
            username: { value: string };
            password: { value: string };
            "confirm-password": { value: string };
        };

        const rt = target.rt.value;
        const rw = target.rw.value;
        const kelurahan = target.kelurahan.value;
        const kecamatan = target.kecamatan.value;
        const address = target.address.value;
        const username = target.username.value;
        const password = target.password.value;
        const confirmPassword = target["confirm-password"].value;

        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Password tidak sama"
            });
            setLoading(false);
            return;
        }

        try {
            const { default: api } = await import("../lib/api");
            await api.post("/setup", {
                rt_name: rt,
                rw_name: rw,
                kelurahan,
                kecamatan,
                address,
                username,
                password
            });
            window.location.href = "/login";
        } catch (error: any) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Setup gagal",
                description: error.response?.data?.error || error.message || "Terjadi kesalahan saat setup"
            });
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full gradient-mesh -z-20" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full -z-10 animate-float" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 blur-[120px] rounded-full -z-10 animate-float" style={{ animationDelay: "1.5s" }} />

            <Card className="w-full max-w-lg glass-card border-none shadow-2xl animate-fade-in relative z-10 my-8">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Setup Awal Aplikasi</CardTitle>
                    <CardDescription>
                        Lengkapi identitas wilayah dan akun administrator.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSetup}>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rt">RT</Label>
                                <Input id="rt" type="text" placeholder="005" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="rw">RW</Label>
                                <Input id="rw" type="text" placeholder="002" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kelurahan">Kelurahan / Desa</Label>
                            <Input id="kelurahan" type="text" placeholder="Contoh: Sukamaju" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="kecamatan">Kecamatan</Label>
                            <Input id="kecamatan" type="text" placeholder="Contoh: Lowokwaru" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Alamat Sekretariat</Label>
                            <Input id="address" type="text" placeholder="Jl. Mawar No. 10" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                        </div>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground glass rounded-full">Akun Admin</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="username">Username Admin</Label>
                            <Input id="username" type="text" placeholder="admin" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirm-password">Konfirmasi</Label>
                                <Input id="confirm-password" type="password" required className="bg-background/50 border-white/10 focus:border-primary/50" />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="neon" type="submit" disabled={loading}>
                            {loading ? "Memproses..." : "Selesai Setup"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
