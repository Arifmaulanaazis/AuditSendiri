import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const isCitizenMode = location.pathname.includes('citizen');

    return (
        <div className={`min-h-screen ${isCitizenMode ? 'bg-blue-50' : 'bg-gray-50'}`}>
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-xl font-bold text-lime-600 flex items-center gap-2">
                        AuditSendiri
                    </Link>
                    <div className="flex gap-4 text-sm font-medium">
                        <Link to="/" className="hover:text-lime-600">Home</Link>
                        <Link to="/transactions" className="hover:text-lime-600">Transaksi</Link>
                        <Link to="/citizen" className={`px-3 py-1 rounded-full ${isCitizenMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                            Mode Warga
                        </Link>
                    </div>
                </div>
            </nav>
            <main className="max-w-4xl mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="text-center py-8 text-gray-500 text-sm">
                <p>Data disimpan lokal. Tidak dikirim ke siapa pun.</p>
            </footer>
        </div>
    );
}
