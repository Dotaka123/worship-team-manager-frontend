import { useState, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  DollarSign,
  Users,
  Clock,
  Plus
} from 'lucide-react';
import api from '../api';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const Cotisations = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [cotisations, setCotisations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const moisKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cotisationsRes, statsRes] = await Promise.all([
        api.get(`/cotisations/month/${moisKey}`),
        api.get(`/cotisations/stats/${moisKey}`)
      ]);
      setCotisations(cotisationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // BOUTON GÉNÉRER
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/cotisations/generate', { mois: moisKey });
      await fetchData(); // Recharger
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  // MARQUER PAYÉ
  const handlePay = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/pay`, { paymentMethod: 'cash' });
      await fetchData();
    } catch (error) {
      console.error('Erreur paiement:', error);
    }
  };

  // ANNULER PAIEMENT
  const handleCancel = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/cancel`);
      await fetchData();
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Cotisations</h1>
          <p className="text-gray-400">Gestion des cotisations mensuelles</p>
        </div>
      </div>

      {/* Navigation mois + Bouton Générer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-800/50 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-[180px] justify-center">
            <Calendar className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-semibold">
              {MONTHS[currentMonth - 1]} {currentYear}
            </span>
          </div>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* BOUTON GÉNÉRER */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          {generating ? 'Génération...' : 'Générer les cotisations'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Check className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.month?.paid || 0}</p>
              <p className="text-sm text-gray-400">Payé</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.month?.unpaid || 0}</p>
              <p className="text-sm text-gray-400">En attente</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(stats?.month?.collected || 0).toLocaleString()} Ar
              </p>
              <p className="text-sm text-gray-400">Ce mois</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {(stats?.totalCollected || 0).toLocaleString()} Ar
              </p>
              <p className="text-sm text-gray-400">Total {currentYear}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des cotisations */}
      <div className="bg-gray-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Chargement...</div>
        ) : cotisations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">Aucune cotisation pour ce mois</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition"
            >
              Générer les cotisations maintenant
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left p-4 font-medium">Membre</th>
                <th className="text-left p-4 font-medium hidden sm:table-cell">Rôle</th>
                <th className="text-center p-4 font-medium">Montant</th>
                <th className="text-center p-4 font-medium">Statut</th>
                <th className="text-center p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {cotisations.map((cotisation) => (
                <tr key={cotisation._id} className="hover:bg-gray-700/30">
                  <td className="p-4">
                    <p className="font-medium">
                      {cotisation.membre?.firstName} {cotisation.membre?.lastName}
                    </p>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-gray-400">
                    {cotisation.membre?.role}
                  </td>
                  <td className="p-4 text-center">
                    {cotisation.montant?.toLocaleString()} Ar
                  </td>
                  <td className="p-4 text-center">
                    {cotisation.statut === 'paye' ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        Payé
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {cotisation.statut === 'paye' ? (
                      <button
                        onClick={() => handleCancel(cotisation._id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm transition"
                      >
                        Annuler
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePay(cotisation._id)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm transition"
                      >
                        Marquer payé
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Cotisations;
