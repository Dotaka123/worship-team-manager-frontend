import { useState, useEffect } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Cotisations = () => {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Mois actuel par défaut
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };
  
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  // Charger les cotisations
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

  // Charger les stats
  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/cotisations/stats/${currentMonth}`);
      setStats(data);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  useEffect(() => {
    fetchCotisations();
    fetchStats();
  }, [currentMonth]);

  // Générer les cotisations du mois
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      await api.post('/cotisations/generate', { mois: currentMonth });
      await fetchCotisations();
      await fetchStats();
    } catch (error) {
      console.error('Erreur génération:', error);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  // Marquer comme payé
  const handlePay = async (id, method = 'cash') => {
    try {
      await api.patch(`/cotisations/${id}/pay`, { paymentMethod: method });
      await fetchCotisations();
      await fetchStats();
    } catch (error) {
      console.error('Erreur paiement:', error);
    }
  };

  // Annuler paiement
  const handleCancel = async (id) => {
    try {
      await api.patch(`/cotisations/${id}/cancel`);
      await fetchCotisations();
      await fetchStats();
    } catch (error) {
      console.error('Erreur annulation:', error);
    }
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Formater le mois pour l'affichage
    const [year, month] = currentMonth.split('-');
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthDisplay = `${monthNames[parseInt(month) - 1]} ${year}`;
    
    // Titre
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text('Rapport des Cotisations', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(monthDisplay, 14, 30);
    
    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);
    
    // Stats
    const paid = cotisations.filter(c => c.statut === 'paye');
    const unpaid = cotisations.filter(c => c.statut !== 'paye');
    const totalCollecte = paid.reduce((sum, c) => sum + c.montant, 0);
    const totalAttendu = cotisations.reduce((sum, c) => sum + c.montant, 0);
    
    doc.setFontSize(11);
    doc.text(`Total membres: ${cotisations.length}`, 14, 45);
    doc.text(`Payées: ${paid.length}`, 14, 52);
    doc.text(`Non payées: ${unpaid.length}`, 14, 59);
    doc.text(`Montant collecté: ${totalCollecte.toLocaleString()} FCFA`, 100, 45);
    doc.text(`Montant attendu: ${totalAttendu.toLocaleString()} FCFA`, 100, 52);
    doc.text(`Taux de recouvrement: ${cotisations.length > 0 ? Math.round((paid.length / cotisations.length) * 100) : 0}%`, 100, 59);
    
    // Tableau des cotisations
    const tableData = cotisations.map(c => [
      `${c.membre?.firstName || ''} ${c.membre?.lastName || ''}`,
      c.membre?.role || '-',
      c.membre?.instrument || '-',
      `${c.montant.toLocaleString()} FCFA`,
      c.statut === 'paye' ? 'Payé' : 'Non payé',
      c.paymentMethod || '-',
      c.paidAt ? new Date(c.paidAt).toLocaleDateString('fr-FR') : '-'
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Membre', 'Rôle', 'Instrument', 'Montant', 'Statut', 'Méthode', 'Date']],
      body: tableData,
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: { 
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250]
      },
      columnStyles: {
        0: { cellWidth: 35 },
        4: { 
          cellWidth: 22,
          fontStyle: 'bold'
        }
      },
      didParseCell: (data) => {
        if (data.column.index === 4) {
          if (data.cell.raw === 'Payé') {
            data.cell.styles.textColor = [34, 197, 94];
          } else {
            data.cell.styles.textColor = [239, 68, 68];
          }
        }
      }
    });

    // Pied de page
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} / ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }

    // Télécharger
    doc.save(`cotisations-${currentMonth}.pdf`);
  };

  // Navigation mois
  const changeMonth = (delta) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newMonth = month + delta;
    let newYear = year;
    
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  // Formater le mois pour l'affichage
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
          <h1 className="text-2xl font-bold text-gray-800">Cotisations</h1>
          <p className="text-gray-600">Gestion des cotisations mensuelles</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
            Export PDF
          </button>
        </div>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
          {formatMonth(currentMonth)}
        </h2>
        
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Total membres</p>
          <p className="text-2xl font-bold text-gray-800">{cotisations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Payées</p>
          <p className="text-2xl font-bold text-green-600">{paid.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Non payées</p>
          <p className="text-2xl font-bold text-red-600">{unpaid.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-gray-500 text-sm">Collecté</p>
          <p className="text-2xl font-bold text-blue-600">
            {paid.reduce((sum, c) => sum + c.montant, 0).toLocaleString()} F
          </p>
        </div>
      </div>

      {/* Liste des cotisations */}
      {loading ? (
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : cotisations.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 mb-4">Aucune cotisation pour ce mois</p>
          <button
            onClick={handleGenerate}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Générer les cotisations
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cotisations.map((cotisation) => (
                <tr key={cotisation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {cotisation.membre?.firstName} {cotisation.membre?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {cotisation.membre?.instrument || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {cotisation.membre?.role || '-'}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {cotisation.montant.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4">
                    {cotisation.statut === 'paye' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Payé
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ Non payé
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {cotisation.statut === 'paye' ? (
                      <button
                        onClick={() => handleCancel(cotisation._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Annuler
                      </button>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handlePay(cotisation._id, 'cash')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Cash
                        </button>
                        <button
                          onClick={() => handlePay(cotisation._id, 'mobile_money')}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Mobile
                        </button>
                      </div>
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
