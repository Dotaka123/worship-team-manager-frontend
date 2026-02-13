import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import api from '../services/api';

const ExportButtons = ({ type = 'all', month = null, memberStatus = null }) => {
  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState(null);

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const exportMonthlyReport = async () => {
    setLoading(true);
    setLoadingType('monthly-excel');
    try {
      const targetMonth = month || getCurrentMonth();
      const response = await api.get(`/exports/excel/monthly/${targetMonth}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const [year, monthNum] = targetMonth.split('-');
      link.setAttribute('download', `Rapport-${monthNum}-${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export Excel:', error);
      alert('Erreur lors de l\'export Excel');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const exportMembersList = async () => {
    setLoading(true);
    setLoadingType('members-excel');
    try {
      const params = memberStatus ? `?status=${memberStatus}` : '';
      const response = await api.get(`/exports/excel/members${params}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const statusSuffix = memberStatus ? `-${memberStatus}` : '';
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `Membres${statusSuffix}-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export membres:', error);
      alert('Erreur lors de l\'export des membres');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const exportCotisationsCSV = async () => {
    setLoading(true);
    setLoadingType('cotisations-csv');
    try {
      const targetMonth = month || getCurrentMonth();
      const response = await api.get(`/exports/csv/cotisations/${targetMonth}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const [year, monthNum] = targetMonth.split('-');
      link.setAttribute('download', `Cotisations-${monthNum}-${year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export CSV:', error);
      alert('Erreur lors de l\'export CSV');
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  if (type === 'monthly') {
    return (
      <div className="flex gap-2">
        <button
          onClick={exportMonthlyReport}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && loadingType === 'monthly-excel' ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <FileSpreadsheet size={18} />
          )}
          <span>Excel</span>
        </button>

        <button
          onClick={exportCotisationsCSV}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && loadingType === 'cotisations-csv' ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <FileText size={18} />
          )}
          <span>CSV</span>
        </button>
      </div>
    );
  }

  if (type === 'members') {
    return (
      <button
        onClick={exportMembersList}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Download size={18} />
        )}
        <span>Exporter Excel</span>
      </button>
    );
  }

  // Type 'all' - Tous les exports
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={exportMonthlyReport}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && loadingType === 'monthly-excel' ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <FileSpreadsheet size={18} />
        )}
        <span>Rapport Mensuel</span>
      </button>

      <button
        onClick={exportMembersList}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && loadingType === 'members-excel' ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Download size={18} />
        )}
        <span>Liste Membres</span>
      </button>

      <button
        onClick={exportCotisationsCSV}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && loadingType === 'cotisations-csv' ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <FileText size={18} />
        )}
        <span>CSV Cotisations</span>
      </button>
    </div>
  );
};

export default ExportButtons;
