import { useState, useEffect } from "react";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { User } from "lucide-react";
import { default as api, type User as UserType } from "../lib/api";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const { toast } = useToast();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        password: ''
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setFormData(prev => ({ ...prev, full_name: parsed.full_name }));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        try {
            const updateData = {
                ...user,
                full_name: formData.full_name,
                password: formData.password || undefined
            };

            const res = await api.put<UserType>(`/users/${user.id}`, updateData);
            const updatedUser = res.data;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFormData(prev => ({ ...prev, password: '' }));

            toast({
                variant: "success",
                title: "Berhasil",
                description: "Profil berhasil diperbarui!"
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal memperbarui profil."
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div className="p-6">Loading profile...</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto space-y-6"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                    <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user.full_name}</h1>
                    <p className="text-muted-foreground">{user.role === 'admin' ? 'Administrator' : 'User'} • @{user.username}</p>
                </div>
            </div>

            <Card className="border-t-4 border-t-primary/20">
                <CardHeader>
                    <CardTitle>Edit Profil</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={user.username} disabled className="bg-muted opacity-70" />
                            <p className="text-xs text-muted-foreground">Username tidak dapat diubah.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullname">Nama Lengkap</Label>
                            <Input
                                id="fullname"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password Baru</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Kosongkan jika tidak ingin mengubah"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="bg-background/50"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" variant="neon" disabled={loading}>
                                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
