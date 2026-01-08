import { useEffect, useState } from "react";
import { useToast } from "../components/ui/use-toast";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { getTransactions, updateTransaction, deleteTransaction, type Transaction, default as api } from "../lib/api";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { motion, AnimatePresence } from "framer-motion";

export default function Transactions() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        type: 'expense',
        amount: '',
        category: '',
        description: ''
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

    const fetchTransactions = () => {
        getTransactions().then((data) => {
            setTransactions(Array.isArray(data) ? data : []);
        });
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingId) {
                await updateTransaction(editingId, {
                    ...formData,
                    type: formData.type as 'income' | 'expense',
                    amount: Number(formData.amount)
                });
                toast({
                    variant: "success",
                    title: "Berhasil",
                    description: "Transaksi berhasil diperbarui"
                });
            } else {
                await api.post('/transactions', {
                    ...formData,
                    amount: Number(formData.amount)
                });
                toast({
                    variant: "success",
                    title: "Berhasil",
                    description: "Transaksi berhasil disimpan"
                });
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ id: '', type: 'expense', amount: '', category: '', description: '' });
            fetchTransactions();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: editingId ? "Gagal memperbarui transaksi" : "Gagal menyimpan transaksi"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (tx: Transaction) => {
        setEditingId(tx.id);
        setFormData({
            id: tx.id,
            type: tx.type,
            amount: String(tx.amount),
            category: tx.category,
            description: tx.description
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

        try {
            await deleteTransaction(id);
            toast({
                variant: "success",
                title: "Berhasil",
                description: "Transaksi berhasil dihapus"
            });
            fetchTransactions();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Gagal",
                description: "Gagal menghapus transaksi"
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
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
                    Data Transaksi
                </motion.h1>
                {isAdmin() && (
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                    >
                        <Button variant="neon" onClick={() => {
                            setEditingId(null);
                            setFormData({ id: '', type: 'expense', amount: '', category: '', description: '' });
                            setIsModalOpen(true);
                        }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Transaksi Baru
                        </Button>
                    </motion.div>
                )}
            </div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass-card border-none shadow-lg overflow-hidden">
                    <CardHeader>
                        <CardTitle>Riwayat Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="border-t border-white/10 overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-primary/5 text-muted-foreground whitespace-nowrap">
                                    <tr>
                                        <th className="h-12 px-4 font-medium align-middle">Tanggal</th>
                                        <th className="h-12 px-4 font-medium align-middle">Keterangan</th>
                                        <th className="h-12 px-4 font-medium align-middle">Kategori</th>
                                        <th className="h-12 px-4 font-medium align-middle">User</th>
                                        <th className="h-12 px-4 font-medium align-middle text-right">Jumlah</th>
                                        {isAdmin() && <th className="h-12 px-4 font-medium align-middle text-center">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.slice().reverse().map((tx, index) => (
                                        <motion.tr
                                            key={tx.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 transition-colors hover:bg-primary/5"
                                        >
                                            <td className="p-4 align-middle whitespace-nowrap">{new Date(tx.created_at).toLocaleDateString("id-ID")}</td>
                                            <td className="p-4 align-middle min-w-[200px]">{tx.description}</td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent ${tx.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.type === 'income' ? 'Masuk' : 'Keluar'}
                                                </span>
                                            </td>
                                            <td className="p-4 align-middle text-muted-foreground">Admin</td>
                                            <td className={`p-4 align-middle text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                                                }`}>
                                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </td>
                                            {isAdmin() && (
                                                <td className="p-4 align-middle text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tx)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tx.id)} className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">Belum ada transaksi</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

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
                            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Jenis Transaksi</Label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="type" value="income" checked={formData.type === 'income'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="accent-primary" />
                                            Pemasukan
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="type" value="expense" checked={formData.type === 'expense'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="accent-primary" />
                                            Pengeluaran
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Jumlah (Rp)</Label>
                                    <Input id="amount" type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Input id="category" type="text" placeholder="Contoh: Iuran Warga, Listrik" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="bg-background/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Keterangan</Label>
                                    <Input id="desc" type="text" placeholder="Detail transaksi..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-background/50" />
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
