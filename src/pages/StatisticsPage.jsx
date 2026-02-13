import { useState } from 'react';
import { BarChart3, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import AdvancedStatistics from '../components/AdvancedStatistics';
import ExportButtons from '../components/ExportButtons';

const StatisticsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'trends', label: 'Tendances', icon: TrendingUp },
    { id: 'members', label: 'Membres', icon: Users },
    { id: 'alerts', label: 'Alertes', icon: AlertTriangle }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-100">Statistiques Avancées</h1>
            <p className="text-neutral-400 mt-1">Analyse approfondie de votre équipe</p>
          </div>
          
          <ExportButtons type="all" />
        </div>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-neutral-800">
          <nav className="flex -mb-px space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-400'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <div>
        {activeTab === 'overview' && <AdvancedStatistics />}
        
        {activeTab === 'trends' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4">Analyses de tendances</h2>
            <p className="text-neutral-400">Fonctionnalité en développement...</p>
          </div>
        )}
        
        {activeTab === 'members' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4">Statistiques par membre</h2>
            <p className="text-neutral-400">Fonctionnalité en développement...</p>
          </div>
        )}
        
        {activeTab === 'alerts' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-neutral-100 mb-4">Alertes et notifications</h2>
            <p className="text-neutral-400">Fonctionnalité en développement...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
