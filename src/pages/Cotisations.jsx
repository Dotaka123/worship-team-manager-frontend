import { useState, useEffect } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Cotisations = () => {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const fetchCotisations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/cotisations/month/${currentMonth}`);
      setCotisations(data);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotisations();
  }, [currentMonth]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await api.post('/cotisations/generate', { mois: currentMonth });
      await fetchCotisations();
    } catch (error) {
      console.error('Erreur génération:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handlePay = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/pay`);
      await fetchCotisations();
    } catch (error) {
      console.error('Erreur paiement:', error);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/cancel`);
      await fetchCotisations();
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const [year, month] = currentMonth.split('-');
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthDisplay = `${monthNames[parseInt(month) - 1]} ${year}`;
    
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Rapport des Cotisations', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(monthDisplay, 14, 30);
    
    doc.line(14, 35, 196, 35);
    
    const paid = cotisations.filter(c => c.statut === 'paye');
    const totalCollecte = paid.reduce((sum, c) => sum + c.montant, 0);
    const totalAttendu = cotisations.reduce((sum, c) => sum + c.montant, 0);
    
    doc.setFontSize(11);
    doc.text(`Total membres: ${cotisations.length}`, 14, 45);
    doc.text(`Payées: ${paid.length}`, 14, 52);
    doc.text(`Non payées: ${cotisations.length - paid.length}`, 14, 59);
    doc.text(`Collecté: ${totalCollecte.toLocaleString()} Ar`, 100, 45);
    doc.text(`Attendu: ${totalAttendu.toLocaleString()} Ar`, 100, 52);
    
    const tableData = cotisations.map(c => [
      `${c.membre?.firstName || ''} ${c.membre?.lastName || ''}`,
      c.membre?.role || '-',
      `${c.montant.toLocaleString()} Ar`,
      c.statut === 'paye' ? 'Payé' : 'Non payé',
      c.paidAt ? new Date(c.paidAt).toLocaleDateString('fr-FR') : '-'
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Membre', 'Rôle', 'Montant', 'Statut', 'Date']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
      didParseCell: (data) => {
        if (data.column.index === 3) {
          data.cell.styles.textColor = data.cell.raw === 'Payé' ? [34, 197, 94] : [239, 68, 68];
        }
      }
    });

    doc.save(`cotisations-${currentMonth}.pdf`);
  };

  const changeMonth = (delta) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month + delta;
    let newYear = year;
    
    if (newMonth > 12) { newMonth = 1; newYear++; }
    else if (newMonth < 1) { newMonth = 12; newYear--; }
    
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const paid = cotisations.filter(c => c.statut === 'paye');
  const unpaid = cotisations.filter(c => c.statut !== 'paye');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cotisations</h1>
          <p className="text-gray-400">Gestion des cotisations mensuelles</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            Générer
          </button>
          
          <button
            onClick={exportToPDF}
            disabled={cotisations.length === 0}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF
          </button>
        </div>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-white min-w-[200px] text-center">
          {formatMonth(currentMonth)}
        </h2>
        
        <button onClick={() => changeMonth(1)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{cotisations.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Payées</p>
          <p className="text-2xl font-bold text-green-500">{paid.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Non payées</p>
          <p className="text-2xl font-bold text-red-500">{unpaid.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Collecté</p>
          <p className="text-2xl font-bold text-blue-500">
            {paid.reduce((sum, c) => sum + c.montant, 0).toLocaleString()} Ar
          </p>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : cotisations.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <p className="text-gray-400 mb-4">Aucune cotisation pour ce mois</p>
          <button onClick={handleGenerate} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Générer les cotisations
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Membre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {cotisations.map((c) => (
                <tr key={c._id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{c.membre?.firstName} {c.membre?.lastName}</p>
                    <p className="text-sm text-gray-400">{c.membre?.instrument || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{c.membre?.role || '-'}</td>
                  <td className="px-6 py-4 text-white font-medium">{c.montant.toLocaleString()} Ar</td>
                  <td className="px-6 py-4">
                    {c.statut === 'paye' ? (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Payé</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">Non payé</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {c.statut === 'paye' ? (
                      <button onClick={() => handleCancel(c._id)} className="text-red-400 hover:text-red-300 text-sm">
                        Annuler
                      </button>
                    ) : (
                      <button onClick={() => handlePay(c._id)} className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-sm">
                        Payer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Cotisations;
