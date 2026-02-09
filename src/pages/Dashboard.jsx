import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membersAPI } from '../services/api';
import { Users, Mic2, Guitar, Zap, CheckCircle, Wallet } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    chanteurs: 0,
    musiciens: 0,
    techniciens: 0,
    actifs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await membersAPI.getAll();
        
        // Fonction pour normaliser les rôles
        const normalizeRole = (role) => {
          if (!role) return '';
          return role.toLowerCase().replace('(euse)', '').trim();
        };

        setStats({
          total: data.length,
          chanteurs: data.filter(m => normalizeRole(m.role) === 'chanteur').length,
          musiciens: data.filter(m => normalizeRole(m.role) === 'musicien').length,
          techniciens: data.filter(m => normalizeRole(m.role) === 'technicien').length,
          actifs: data.filter(m => m.status === 'actif').length
        });

        // Debug
        console.log('📊 Statistiques calculées:', {
          total: data.length,
          roles: [...new Set(data.map(m => m.role))],
          statuts: [...new Set(data.map(m => m.status))]
        });

      } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6 transition-all hover:border-neutral-700 ${color}`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2 truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-neutral-100">{value}</p>
        </div>
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-700 shrink-0 ml-2" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-neutral-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-100 mb-6 sm:mb-8">
        Tableau de bord
      </h1>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard 
          icon={Users}
          title="Total" 
          value={stats.total} 
          color="hover:border-indigo-500/50"
        />
        <StatCard 
          icon={Mic2}
          title="Chanteurs" 
          value={stats.chanteurs} 
          color="hover:border-emerald-500/50"
        />
        <StatCard 
          icon={Guitar}
          title="Musiciens" 
          value={stats.musiciens} 
          color="hover:border-blue-500/50"
        />
        <StatCard 
          icon={Zap}
          title="Techniciens" 
          value={stats.techniciens} 
          color="hover:border-amber-500/50"
        />
        <StatCard 
          icon={CheckCircle}
          title="Actifs" 
          value={stats.actifs} 
          color="hover:border-green-500/50"
        />
      </div>

      {/* Actions rapides */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-neutral-100 mb-4">
          Actions rapides
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link
            to="/members"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Gérer les membres
          </Link>
          <Link
            to="/attendance"
            className="flex-1 sm:flex-initial text-center px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors font-medium text-sm border border-neutral-700"
          >
            Marquer les présences
          </Link>
          <Link
            to="/cotisations"
            className="flex-1 sm:flex-initial text-center flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <Wallet className="w-4 h-4" />
            Gérer les cotisations
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
