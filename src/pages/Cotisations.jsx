import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Download, Plus, ChevronLeft, ChevronRight, Loader2, Check, X, FileText, FileSpreadsheet } from 'lucide-react';

// Charge SheetJS depuis CDN si pas encore chargé
const loadSheetJS = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) { resolve(window.XLSX); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => reject(new Error('Impossible de charger SheetJS'));
    document.head.appendChild(script);
  });
};

const Cotisations = () => {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef(null);

  // Fermer le menu export si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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

  // Génère le nom de fichier : Cotisation-MM-YYYY
  const getFileName = (ext) => {
    const [year, month] = currentMonth.split('-');
    return `Cotisation-${month}-${year}.${ext}`;
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
      `${c.membre?.pseudo || ''}`,
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

    doc.save(getFileName('pdf'));
    setShowExportMenu(false);
  };

  const exportToXLS = async () => {
    const [year, month] = currentMonth.split('-');
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const monthDisplay = `${monthNames[parseInt(month) - 1]} ${year}`;

    try {
      const XLSX = await loadSheetJS();

      const paid = cotisations.filter(c => c.statut === 'paye');
      const totalCollecte = paid.reduce((sum, c) => sum + c.montant, 0);
      const totalAttendu = cotisations.reduce((sum, c) => sum + c.montant, 0);

      const rows = cotisations.map(c => ({
        'Membre': `${c.membre?.pseudo || ''}`.trim(),
        'Rôle': c.membre?.role || '-',
        'Instrument': c.membre?.instrument || '-',
        'Montant (Ar)': c.montant,
        'Statut': c.statut === 'paye' ? 'Payé' : 'Non payé',
        'Date paiement': c.paidAt ? new Date(c.paidAt).toLocaleDateString('fr-FR') : '-',
      }));

      // Feuille principale
      const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A4' });

      // En-tête info
      XLSX.utils.sheet_add_aoa(ws, [
        [`Rapport des Cotisations — ${monthDisplay}`],
        [],
        [`Total: ${cotisations.length}  |  Payées: ${paid.length}  |  Collecté: ${totalCollecte.toLocaleString()} Ar  |  Attendu: ${totalAttendu.toLocaleString()} Ar`],
      ], { origin: 'A1' });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, monthDisplay);
      XLSX.writeFile(wb, getFileName('xlsx'));
    } catch (err) {
      alert('Erreur lors de la génération Excel : ' + err.message);
    }
    setShowExportMenu(false);
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
    <div className="p-4 sm:p-6">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Cotisations</h1>
          <p className="text-sm text-gray-400">Gestion des cotisations mensuelles</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
            <span className="hidden sm:inline">Générer</span>
          </button>
          
          {/* Bouton export avec dropdown PDF / XLS */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(prev => !prev)}
              disabled={cotisations.length === 0}
              className="flex items-center gap-2 bg-neutral-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-neutral-600 disabled:opacity-50 text-sm"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Exporter</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl z-10 min-w-[160px] overflow-hidden">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors"
                >
                  <FileText className="w-4 h-4 text-red-400" />
                  Télécharger PDF
                </button>
                <div className="border-t border-neutral-700" />
                <button
                  onClick={exportToXLS}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-white hover:bg-neutral-700 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-400" />
                  Télécharger Excel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation mois - Responsive */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
        <button 
          onClick={() => changeMonth(-1)} 
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        
        <h2 className="text-lg sm:text-xl font-semibold text-white min-w-[160px] sm:min-w-[200px] text-center">
          {formatMonth(currentMonth)}
        </h2>
        
        <button 
          onClick={() => changeMonth(1)} 
          className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs sm:text-sm">Total</p>
          <p className="text-xl sm:text-2xl font-bold text-white">{cotisations.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs sm:text-sm">Payées</p>
          <p className="text-xl sm:text-2xl font-bold text-green-500">{paid.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs sm:text-sm">Non payées</p>
          <p className="text-xl sm:text-2xl font-bold text-red-500">{unpaid.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-700">
          <p className="text-gray-400 text-xs sm:text-sm truncate">Collecté</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-500 truncate">
            {paid.reduce((sum, c) => sum + c.montant, 0).toLocaleString()} Ar
          </p>
        </div>
      </div>

      {/* Liste - Responsive */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : cotisations.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-700">
          <p className="text-gray-400 mb-4 text-sm sm:text-base">Aucune cotisation pour ce mois</p>
          <button 
            onClick={handleGenerate} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            Générer les cotisations
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
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
                      <p className="font-medium text-white">{c.membre?.pseudo}</p>
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
                        <button 
                          onClick={() => handleCancel(c._id)} 
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Annuler
                        </button>
                      ) : (
                        <button 
                          onClick={() => handlePay(c._id)} 
                          className="bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-sm"
                        >
                          Payer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {cotisations.map((c) => (
              <div 
                key={c._id} 
                className="bg-gray-800 rounded-lg border border-gray-700 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {c.membre?.pseudo}
                    </p>
                    <p className="text-sm text-gray-400">{c.membre?.role || '-'}</p>
                    {c.membre?.instrument && (
                      <p className="text-xs text-gray-500">{c.membre.instrument}</p>
                    )}
                  </div>
                  <div className="ml-2">
                    {c.statut === 'paye' ? (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400 whitespace-nowrap">
                        <Check className="w-3 h-3" />
                        Payé
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400 whitespace-nowrap">
                        <X className="w-3 h-3" />
                        Non payé
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-white">
                    {c.montant.toLocaleString()} Ar
                  </p>
                  
                  {c.statut === 'paye' ? (
                    <button 
                      onClick={() => handleCancel(c._id)} 
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1.5 border border-red-400/30 rounded-lg"
                    >
                      Annuler
                    </button>
                  ) : (
                    <button 
                      onClick={() => handlePay(c._id)} 
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Marquer payé
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Cotisations;
