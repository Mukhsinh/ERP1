import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <body className="bg-slate-50 text-slate-900 h-screen overflow-hidden flex">
                <Sidebar />
                <main className="flex-1 h-full overflow-y-auto p-8">
                    {children}
                </main>
            </body>
        </html>
    );
}
