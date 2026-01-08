import { useEffect, useState, useCallback } from "react";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Plus, User, X } from "lucide-react";
import { getUsers, type User as UserType, default as api } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../components/ui/use-toast";

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<UserType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'user'
    });
    const [editingId, setEditingId] = useState<string | null>(null);

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

    const fetchUsers = useCallback(() => {
        setLoading(true);
        getUsers()
            .then(data => {
                setUsers(data);
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    title: "Gagal memuat data",
                    description: "Gagal mengambil data pengguna. Cek console untuk detail."
                });
            })
            .finally(() => setLoading(false));
    }, [toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await api.put(`/users/${editingId}`, formData);
                const currentUser = localStorage.getItem('user');
                if (currentUser) {
                    const parsedUser = JSON.parse(currentUser);
                    if (parsedUser.id === editingId) {
                        const updatedUser = {
                            ...parsedUser,
                            full_name: formData.full_name || parsedUser.full_name,
                            username: formData.username || parsedUser.username,
                            role: formData.role || parsedUser.role
                        };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }
            } else {
                await api.post('/users', formData);
            }
            setIsModalOpen(false);
            setFormData({ username: '', password: '', full_name: '', role: 'user' });
            setEditingId(null);
            fetchUsers();
            toast({
                variant: "success",
                title: "Berhasil",
                description: editingId ? "Data user berhasil diperbarui" : "User baru berhasil dibuat"
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal menyimpan user"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: UserType) => {
        setFormData({
            username: user.username,
            password: '',
            full_name: user.full_name,
            role: user.role as any
        });
        setEditingId(user.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (user: UserType) => {
        if (!confirm(`Apakah anda yakin ingin menghapus user ${user.username}?`)) return;

        try {
            await api.delete(`/users/${user.id}`);
            fetchUsers();
            toast({
                variant: "success",
                title: "Berhasil",
                description: "User berhasil dihapus"
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal menghapus user"
            });
        }
    };

    const openAddModal = () => {
        setFormData({ username: '', password: '', full_name: '', role: 'user' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 relative"
        >
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-2xl md:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent"
                >
                    Manajemen Pengguna
                </motion.h1>
                {isAdmin() && (
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <Button variant="neon" onClick={openAddModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Button>
                    </motion.div>
                )}
            </div>

            {users.length === 0 && !loading ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">Tidak ada pengguna</h3>
                    <p>Belum ada pengguna yang terdaftar selain anda.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {users.map(user => (
                        <div key={user.id} className="block w-full">
                            <Card className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_20px_rgba(101,163,13,0.1)] border-t-4 border-t-primary/20 h-full w-full">
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-lg truncate">{user.full_name}</CardTitle>
                                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${user.role === 'admin'
                                            ? 'bg-primary/10 text-primary border-primary/20'
                                            : 'bg-muted text-muted-foreground border-white/10'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrator' : 'Warga/User'}
                                        </span>
                                        {isAdmin() && (
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} className="h-8 w-8 p-0 text-muted-foreground hover:text-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 text-right">
                                        <span className="text-xs text-muted-foreground">ID: {user.id.substring(0, 6)}...</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md p-6 bg-background/90 glass border border-white/10 rounded-lg shadow-2xl relative"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullname">Nama Lengkap</Label>
                                    <Input id="fullname" type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input id="username" type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password {editingId && '(Kosongkan jika tidak ingin mengubah)'}</Label>
                                    <Input id="password" type="password" required={!editingId} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role ACCESS</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={() => setFormData({ ...formData, role: 'user' })} className="accent-primary" />
                                            User Biasa
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={() => setFormData({ ...formData, role: 'admin' })} className="accent-primary" />
                                            Administrator
                                        </label>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end gap-2">
                                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
                                    <Button type="submit" variant="neon" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
