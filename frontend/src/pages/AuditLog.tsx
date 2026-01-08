import { useEffect, useState } from 'react';
import { getAuditLogs, restoreAuditLog, type AuditLog as IAuditLog } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";

const AuditLog = () => {
    const [logs, setLogs] = useState<IAuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await getAuditLogs();
            const sorted = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setLogs(sorted);
        } catch (err) {
            console.error("Failed to fetch audit logs", err);
            setError("Failed to load audit logs. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (id: string, action: string) => {
        if (!window.confirm(`Are you sure you want to restore this ${action} action?`)) {
            return;
        }

        try {
            setLoading(true);
            await restoreAuditLog(id);
            await fetchLogs();
            alert("Restored successfully!");
        } catch (err) {
            console.error("Failed to restore", err);
            alert("Failed to restore. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const getActionColorClass = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create':
            case 'setup_admin':
                return "bg-primary/10 text-primary border-primary/20";
            case 'update':
            case 'correction':
                return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case 'delete':
                return "bg-destructive/10 text-destructive border-destructive/20";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading audit logs...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
                <p className="text-muted-foreground">
                    Lihat aktivitas dan perubahan sistem.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Daftar semua kejadian sistem yang tercatat.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                                    <tr>
                                        <th className="px-4 py-3">Waktu</th>
                                        <th className="px-4 py-3">Tindakan</th>
                                        <th className="px-4 py-3">Jenis Entitas</th>
                                        <th className="px-4 py-3">ID Entitas</th>
                                        <th className="px-4 py-3">Catatan</th>
                                        <th className="px-4 py-3">Dibuat Oleh</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Tidak ada log audit ditemukan.
                                            </td>
                                        </tr>
                                    ) : (
                                        logs.map((log) => (
                                            <tr key={log.id || Math.random().toString()} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(log.created_at))}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActionColorClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 capitalize">{log.entity_type}</td>
                                                <td className="px-4 py-3 font-mono text-xs">{log.entity_id}</td>
                                                <td className="px-4 py-3 max-w-xs truncate" title={log.note}>{log.note || '-'}</td>
                                                <td className="px-4 py-3">{log.created_by || 'System'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {['update', 'delete', 'correction'].includes(log.action.toLowerCase()) && (
                                                        <button
                                                            onClick={() => handleRestore(log.id, log.action)}
                                                            className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded hover:opacity-90 transition-opacity"
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AuditLog;
