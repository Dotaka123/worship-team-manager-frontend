import { useState, useEffect } from 'react';
import { X, Download, Check, AlertCircle, Calendar } from 'lucide-react';
import { cotisationsAPI } from '../services/api';
import { generateMemberHistory, generateReceipt } from '../services/pdfService';

const MONTHS = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'
];

const MemberContributionHistory = ({ member, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchHistory();
  }, [member._id, selectedYear]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await contributionsAPI.getMemberHistory(member._id, selectedYear);
      setHistory(res.data);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créer une vue calendrier pour l'année
  const getMonthStatus = (monthNum) => {
    const record = history.find(h => h.month === monthNum && h.year === selectedYear);
    return record?.isPaid ? 'paid' : 'unpaid';
  };

  const getMonthRecord = (monthNum) => {
    return history.find(h => h.month === monthNum && h.year === selectedYear);
  };

  const totalPaid = history.filter(h => h.isPaid && h.year === selectedYear).length;
  const totalAmount = history.filter(h => h.isPaid && h.year === selectedYear)
    .reduce((sum, h) => sum + h.amount, 0);

  const handleDownloadHistory = () => {
    generateMemberHistory(member, history);
  };

  const handleDownloadReceipt = (monthNum) => {
    const record = getMonthRecord(monthNum);
    if (record && record.isPaid) {
      generateReceipt({
        member,
        year: selectedYear,
        month: monthNum,
        amount: record.amount,
        paidAt: record.paidAt,
        paymentMethod: record.paymentMethod
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Historique des cotisations
            </h2>
            <p className="text-sm text-gray-400">
              {member.firstName} {member.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
          
          {/* Sélecteur d'année */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedYear === year
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleDownloadHistory}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Mois payés en {selectedYear}</p>
              <p className="text-2xl font-bold text-white">{totalPaid} / 12</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-sm">Total payé</p>
              <p className="text-2xl font-bold text-green-500">
                {totalAmount.toLocaleString()} Ar
              </p>
            </div>
          </div>

          {/* Calendrier des mois */}
          {loading ? (
            <div className="text-center text-gray-400 py-8">Chargement...</div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {MONTHS.map((monthName, index) => {
                const monthNum = index + 1;
                const status = getMonthStatus(monthNum);
                const record = getMonthRecord(monthNum);
                const isPast = new Date(selectedYear, monthNum - 1) <= new Date();
                
                return (
                  <div
                    key={monthNum}
                    className={`relative p-3 rounded-lg border ${
                      status === 'paid'
                        ? 'bg-green-600/10 border-green-600/30'
                        : isPast
                          ? 'bg-red-600/10 border-red-600/30'
                          : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        {monthName}
                      </span>
                      {status === 'paid' ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : isPast ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Calendar className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    
                    <p className={`text-xs ${
                      status === 'paid' 
                        ? 'text-green-400' 
                        : isPast 
                          ? 'text-red-400' 
                          : 'text-gray-500'
                    }`}>
                      {status === 'paid' ? '3 000 Ar' : isPast ? 'Non payé' : 'À venir'}
                    </p>
                    
                    {status === 'paid' && record?.paidAt && (
                      <>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(record.paidAt).toLocaleDateString('fr-FR')}
                        </p>
                        <button
                          onClick={() => handleDownloadReceipt(monthNum)}
                          className="absolute top-2 right-2 p-1 hover:bg-green-600/20 rounded transition opacity-0 hover:opacity-100"
                          title="Télécharger le reçu"
                        >
                          <Download className="w-3 h-3 text-green-400" />
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Liste détaillée */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Détail des paiements
            </h3>
            <div className="space-y-2">
              {history
                .filter(h => h.year === selectedYear && h.isPaid)
                .sort((a, b) => b.month - a.month)
                .map(record => (
                  <div
                    key={`${record.year}-${record.month}`}
                    className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {MONTHS[record.month - 1]} {record.year}
                      </p>
                      <p className="text-xs text-gray-500">
                        Payé le {new Date(record.paidAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-500 font-medium">
                        {record.amount.toLocaleString()} Ar
                      </span>
                      <button
                        onClick={() => handleDownloadReceipt(record.month)}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition"
                        title="Télécharger le reçu"
                      >
                        <Download className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                ))}
              
              {history.filter(h => h.year === selectedYear && h.isPaid).length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Aucun paiement enregistré pour {selectedYear}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberContributionHistory;
