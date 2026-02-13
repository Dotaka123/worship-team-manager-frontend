import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';

const Layout = () => {
  const location = useLocation();
  const [animKey, setAnimKey] = useState(location.pathname);

  useEffect(() => {
    // Légère pause pour laisser l'ancienne page "sortir" si besoin
    setAnimKey(location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      {/* Barre de progression subtile sous la navbar */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div key={animKey} className="page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
