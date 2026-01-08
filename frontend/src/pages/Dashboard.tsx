import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Receipt, Users, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { getTransactions, getUsers, type Transaction } from "../lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

export default function Dashboard() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [userCount, setUserCount] = useState(0);
    const [stats, setStats] = useState({
        totalBalance: 0,
        income: 0,
        expense: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([getTransactions(), getUsers()]).then(([txs, users]) => {
            setTransactions(txs);
            setUserCount(users.length);

            let income = 0;
            let expense = 0;
            const sortedTxs = [...txs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

            const runningBalance: any[] = [];
            let currentBalance = 0;

            sortedTxs.forEach(tx => {
                if (tx.type === 'income') {
                    income += tx.amount;
                    currentBalance += tx.amount;
                } else {
                    expense += tx.amount;
                    currentBalance -= tx.amount;
                }
                runningBalance.push({
                    date: new Date(tx.created_at).toLocaleDateString("id-ID"),
                    balance: currentBalance,
                    amount: tx.amount
                });
            });

            setStats({
                totalBalance: income - expense,
                income,
                expense
            });
            setChartData(runningBalance.slice(-20));
        });
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
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
            className="space-y-8 pb-10"
        >
            <div className="flex items-center justify-between">
                <motion.h1 variants={itemVariants} className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    Dashboard Overview
                </motion.h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(101,163,13,0.1)] border-l-4 border-l-primary/50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Saldo</CardTitle>
                            <Receipt className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <span className="text-green-500 font-medium">+0%</span> dari periode lalu
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(101,163,13,0.1)] border-l-4 border-l-green-500/50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pemasukan</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">+{formatCurrency(stats.income)}</div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(101,163,13,0.1)] border-l-4 border-l-red-500/50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pengeluaran</CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">-{formatCurrency(stats.expense)}</div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Card className="hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(101,163,13,0.1)] border-l-4 border-l-blue-500/50 h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total User</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{userCount}</div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <motion.div variants={itemVariants} className="col-span-4">
                    <Card className="glass-card border-none shadow-lg h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Tren Saldo Kas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#84cc16" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={30} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                            formatter={(value: number | undefined | string | Array<any>) => formatCurrency(Number(value) || 0)}
                                        />
                                        <Area type="monotone" dataKey="balance" stroke="#84cc16" fillOpacity={1} fill="url(#colorBalance)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={itemVariants} className="col-span-3">
                    <Card className="glass-card border-none shadow-lg h-full">
                        <CardHeader>
                            <CardTitle>Transaksi Terakhir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {transactions.slice(-5).reverse().map((tx) => (
                                    <div key={tx.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border transition-colors ${tx.type === 'income' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                                }`}>
                                                <Receipt className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{tx.category}</p>
                                                <p className="text-xs text-muted-foreground" title={tx.description}>{tx.description || '-'}</p>
                                            </div>
                                        </div>
                                        <div className={`font-medium px-2 py-1 rounded text-xs ${tx.type === 'income' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                                            }`}>
                                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </div>
                                    </div>
                                ))}
                                {transactions.length === 0 && <p className="text-center text-muted-foreground text-sm">Belum ada transaksi</p>}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
