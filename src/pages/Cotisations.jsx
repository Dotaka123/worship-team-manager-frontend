import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Wallet,
  TrendingUp,
  AlertCircle,
  Download,
  History,
  FileText
} from 'lucide-react';
import { cotisationsAPI } from '../services/api';
import { generateMonthlyReport, generateReceipt } from '../services/pdfService';
import MemberContributionHistory from '../components/MemberContributionHistory';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const AMOUNT = 3000;

const Cotisations = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contributions, setContributions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const mois = `${year}-${String(month).padStart(2, '0')}`;

  useEffect(() => {
    fetchData();
  }, [mois]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contribRes, statsRes] = await Promise.all([
        cotisationsAPI.getByMonth(mois),
        cotisationsAPI.getStats(mois)
      ]);
      setContributions(contribRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handlePayment = async (cotisationId) => {
    setSaving(prev => ({ ...prev, [cotisationId]: true }));

    try {
      await cotisationsAPI.markAsPaid(cotisationId, { paymentMethod });
      await fetchData();
      setShowPaymentModal(null);
      setPaymentMethod('cash');
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(prev => ({ ...prev, [cotisationId]: false }));
    }
  };

  const handleCancelPayment = async (cotisationId) => {
    if (!confirm('Annuler ce paiement ?')) return;
    
    setSaving(prev => ({ ...prev, [cotisationId]: true }));

    try {
      await cotisationsAPI.update(cotisationId, { statut: 'non_paye', paidAt: null });
      await fetchData();
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Erreur lors de l\'annulation');
    } finally {
      setSaving(prev => ({ ...prev, [cotisationId]: false }));
    }
  };

  const handleDownloadReceipt = (contrib) => {
    generateReceipt({
      member: contrib.membre,
      year,
      month,
      amount: contrib.montant,
      paidAt: contrib.paidAt,
      paymentMethod: contrib.paymentMethod
    });
  };

  const handleDownloadMonthlyReport = () => {
    generateMonthlyReport(contributions, year, month, stats);
  };

  const paidCount = contributions.filter(c => c.statut === 'paye').length;
  const unpaidCount = contributions.filter(c => c.statut !== 'paye').length;
  const monthTotal = paidCount * AMOUNT;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Cotisations</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">
            {AMOUNT.toLocaleString()} Ar / mois
          </span>
          <button
            onClick={handleDownloadMonthlyReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm transition"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Navigation Mois */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        
        <div className="text-center min-w-[200px]">
          <h2 className="text-xl font-semibold text-white">
            {MONTHS[month - 1]} {year}
          </h2>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600/20 rounded-lg">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Payé</p>
              <p className="text-xl font-bold text-white">{paidCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">En attente</p>
              <p className="text-xl font-bold text-white">{unpaidCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Collecté ce mois</p>
              <p className="text-xl font-bold text-white">
                {monthTotal.toLocaleString()} Ar
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total {year}</p>
              <p className="text-xl font-bold text-white">
                {stats?.totalCollected?.toLocaleString() || 0} Ar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Annuel */}
      {stats && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progression annuelle</span>
            <span className="text-white font-medium">{stats.percentage || 0}%</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
              style={{ width: `${stats.percentage || 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-gray-400">Chargement...</div>
        ) : contributions.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            Aucune cotisation pour ce mois
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900">
                <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Membre</th>
                <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Rôle</th>
                <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">Montant</th>
                <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">Statut</th>
                <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((contrib) => {
                const isLoading = saving[contrib._id];
                const isPaid = contrib.statut === 'paye';
                
                return (
                  <tr key={contrib._id} className="border-b border-gray-800 hover:bg-gray-900/50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-white text-sm">
                        {contrib.membre?.firstName} {contrib.membre?.lastName}
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-sm text-gray-400">
                      {contrib.membre?.role || 'N/A'}
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-medium">
                        {(contrib.montant || AMOUNT).toLocaleString()} Ar
                      </span>
                    </td>
                    
                    <td className="py-4 px-4 text-center">
                      {isPaid ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 text-green-500 rounded-full text-sm">
                            <Check className="w-4 h-4" />
                            Payé
                          </span>
                          {contrib.paidAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(contrib.paidAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-600/20 text-red-500 rounded-full text-sm">
                          <X className="w-4 h-4" />
                          Non payé
                        </span>
                      )}
                    </td>
                    
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {isPaid ? (
                          <>
                            <button
                              onClick={() => handleDownloadReceipt(contrib)}
                              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                              title="Télécharger le reçu"
                            >
                              <Download className="w-4 h-4 text-gray-300" />
                            </button>
                            <button
                              onClick={() => handleCancelPayment(contrib._id)}
                              disabled={isLoading}
                              className="p-2 bg-gray-700 hover:bg-red-600/20 rounded-lg transition"
                              title="Annuler le paiement"
                            >
                              <X className="w-4 h-4 text-gray-300 hover:text-red-400" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setShowPaymentModal(contrib._id)}
                            disabled={isLoading}
                            className={`px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-medium transition ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isLoading ? '...' : 'Marquer payé'}
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedMember(contrib.membre)}
                          className="p-2 bg-gray-700 hover:bg-indigo-600/20 rounded-lg transition"
                          title="Voir l'historique"
                        >
                          <History className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Enregistrer le paiement
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Mode de paiement
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  <option value="cash">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank">Virement bancaire</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(null);
                    setPaymentMethod('cash');
                  }}
                  className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handlePayment(showPaymentModal)}
                  disabled={saving[showPaymentModal]}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition disabled:opacity-50"
                >
                  {saving[showPaymentModal] ? '...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal historique */}
      {selectedMember && (
        <MemberContributionHistory
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
};

export default Cotisations;
