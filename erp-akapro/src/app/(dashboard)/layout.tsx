export const dynamic = 'force-dynamic';

import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Sidebar />
            <main className="ml-[260px] min-h-screen bg-slate-50 text-slate-900">
                {children}
            </main>
        </>
    );
}
