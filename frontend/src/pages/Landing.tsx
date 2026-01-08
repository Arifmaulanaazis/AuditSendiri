import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { getTransactions, type Transaction } from "../lib/api";
import { Receipt } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
    const [stats, setStats] = useState({
        totalBalance: 0,
        income: 0,
        expense: 0
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        getTransactions().then((txsData) => {
            const txs = Array.isArray(txsData) ? txsData : [];
            let income = 0;
            let expense = 0;
            const sortedTxs = [...txs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            sortedTxs.forEach(tx => {
                if (tx.type === 'income') {
                    income += tx.amount;
                } else {
                    expense += tx.amount;
                }
            });

            setStats({
                totalBalance: income - expense,
                income,
                expense
            });
            setTransactions(txs);
        });
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="container mx-auto px-4 py-8 pb-20 overflow-x-hidden"
        >
            <div className="text-center mb-16 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/20 blur-[60px] md:blur-[100px] rounded-full -z-10 pointer-events-none"
                />
                <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent relative z-10">
                    Transparansi <span className="text-foreground">Keuangan</span> Warga
                </motion.h1>
                <motion.p variants={itemVariants} className="text-lg md:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed relative z-10 px-4">
                    AuditSendiri memungkinkan warga untuk memantau arus kas dan aset desa secara <span className="text-primary font-semibold">realtime</span> dan <span className="text-primary font-semibold">transparan</span>.
                </motion.p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-16 px-2">
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(101,163,13,0.2)] h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-muted-foreground">Saldo Kas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl md:text-4xl font-bold text-primary break-words">{formatCurrency(stats.totalBalance)}</div>
                            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Update terakhir: Hari ini
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(101,163,13,0.2)] h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-muted-foreground">Pemasukan Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl md:text-4xl font-bold text-green-500 break-words">{formatCurrency(stats.income)}</div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(101,163,13,0.2)] h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-muted-foreground">Pengeluaran Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl md:text-4xl font-bold text-red-500 break-words">{formatCurrency(stats.expense)}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mt-12 px-2">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <span className="w-1 h-8 bg-primary rounded-full" />
                        Transaksi Terakhir
                    </h2>
                </div>

                <div className="space-y-4">
                    {transactions.slice(-10).reverse().map((tx) => (
                        <Card key={tx.id} className="p-4 hover:bg-accent/5 transition-colors">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                    <div className={`h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-full flex items-center justify-center border ${tx.type === 'income' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                                        }`}>
                                        <Receipt className={`h-5 w-5 md:h-6 md:w-6 ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-semibold text-base md:text-lg truncate">{tx.category}</h3>
                                        <p className="text-xs md:text-sm text-muted-foreground truncate">{tx.description} • {new Date(tx.created_at).toLocaleDateString("id-ID")}</p>
                                    </div>
                                </div>
                                <div className={`text-base md:text-xl font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </div>
                            </div>
                        </Card>
                    ))}
                    {transactions.length === 0 && (
                        <Card className="p-12 text-center text-muted-foreground border-dashed border-2 border-primary/20 bg-background/50">
                            <p className="text-lg">Belum ada data transaksi tersimpan.</p>
                        </Card>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
