import { SchemeProvider } from "./_lib/schemeStore";
import { LogProvider } from "./_lib/logStore";   // ✅ add this
import { ToastProvider } from "./_lib/toastStore";
import Sidebar from "./_components/Sidebar";
import Topbar from "./_components/Topbar";

export const metadata = {
  title: "Aula — Admin",
  description: "Finance & Insurance Scheme Management Console",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SchemeProvider>
      <LogProvider>   {/* ✅ wrap logs here */}
        <ToastProvider>
          <div className="flex h-screen overflow-hidden bg-slate-100 py-20">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </ToastProvider>
      </LogProvider>
    </SchemeProvider>
  );
}