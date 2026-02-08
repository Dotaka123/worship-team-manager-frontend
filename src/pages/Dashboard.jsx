import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membersAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    chanteurs: 0,
    musiciens: 0,
    techniciens: 0,
    actifs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await membersAPI.getAll();
        setStats({
          total: data.length,
          chanteurs: data.filter(m => m.role === 'chanteur').length,
          musiciens: data.filter(m => m.role === 'musicien').length,
          techniciens: data.filter(m => m.role === 'technicien').length,
          actifs: data.filter(m => m.isActive).length
        });
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    fetchStats();
  }, []);

  const StatCard = ({ title, value, color }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total membres" value={stats.total} color="text-white" />
        <StatCard title="Chanteurs" value={stats.chanteurs} color="text-purple-400" />
        <StatCard title="Musiciens" value={stats.musiciens} color="text-blue-400" />
        <StatCard title="Techniciens" value={stats.techniciens} color="text-green-400" />
        <StatCard title="Actifs" value={stats.actifs} color="text-primary-400" />
      </div>

      {/* Actions rapides */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/members"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
          >
            Gérer les membres
          </Link>
          <Link
            to="/attendance"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Marquer les présences
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
