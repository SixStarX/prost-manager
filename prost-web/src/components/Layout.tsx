import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Topbar from './Topbar';
import GlobalSearch from './search/GlobalSearch';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={mobileOpen} onNavigate={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden bg-base min-w-0">
        <Topbar onMenuClick={() => setMobileOpen((v) => !v)} onSearchClick={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 pb-10 animate-fade-in">
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
