import { useState, useEffect } from 'react';
import { cotisationsAPI } from '../services/api';
import CotisationTable from '../components/CotisationTable';
import CotisationStats from '../components/CotisationStats';
import { Plus, Calendar } from 'lucide-react';

const Cotisations = () => {
  const [cotisations, setCotisations] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // Format YYYY-MM
  );
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cotisationsRes, statsRes] = await Promise.all([
        cotisationsAPI.getByMonth(selectedMonth),
        cotisationsAPI.getStats(selectedMonth)
      ]);
      
      setCotisations(cotisationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('❌ Error:', error);
      setCotisations([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await cotisationsAPI.generate(selectedMonth);
      await fetchData(); // Recharger les données
      alert('Cotisations générées avec succès !');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (id, paymentData) => {
    try {
      await cotisationsAPI.markAsPaid(id, paymentData);
      await fetchData(); // Recharger
    } catch (error) {
      alert('Erreur lors du paiement');
    }
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cotisations</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gestion des cotisations mensuelles (3000 Ar/mois)
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sélecteur de mois */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>

          {/* Bouton générer */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {generating ? 'Génération...' : 'Générer le mois'}
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {stats && <CotisationStats stats={stats} month={getMonthName(selectedMonth)} />}

      {/* Tableau des cotisations */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Chargement des cotisations...
          </div>
        ) : cotisations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p>Aucune cotisation pour {getMonthName(selectedMonth)}</p>
            <button
              onClick={handleGenerate}
              className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Cliquer pour générer les cotisations
            </button>
          </div>
        ) : (
          <CotisationTable 
            cotisations={cotisations} 
            onMarkAsPaid={handleMarkAsPaid}
          />
        )}
      </div>
    </div>
  );
};

export default Cotisations;
