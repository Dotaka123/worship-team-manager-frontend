import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target } from 'lucide-react';
import api from '../services/api';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdvancedStatistics = () => {
  const [cotisationsTrend, setCotisationsTrend] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState(null);
  const [financialInsights, setFinancialInsights] = useState(null);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      const [
        cotisRes,
        attendRes,
        topRes,
        rolesRes,
        finRes,
        goalsRes
      ] = await Promise.all([
        api.get('/stats/charts/cotisations-trend?months=6'),
        api.get('/stats/charts/attendance-trend?days=30'),
        api.get('/stats/top-attendance?limit=5&months=3'),
        api.get('/stats/distribution/roles'),
        api.get('/stats/financial-insights?months=6'),
        api.get('/stats/goals')
      ]);

      setCotisationsTrend(cotisRes.data);
      setAttendanceTrend(attendRes.data);
      setTopPerformers(topRes.data);
      setRoleDistribution(rolesRes.data);
      setFinancialInsights(finRes.data);
      setGoals(goalsRes.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Configuration graphique cotisations
  const cotisationsChartData = cotisationsTrend ? {
    labels: cotisationsTrend.map(d => {
      const [year, month] = d.mois.split('-');
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      return monthNames[parseInt(month) - 1];
    }),
    datasets: [
      {
        label: 'Payées',
        data: cotisationsTrend.map(d => d.paye),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: true
      },
      {
        label: 'Non payées',
        data: cotisationsTrend.map(d => d.nonPaye),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        fill: true
      }
    ]
  } : null;

  // Configuration graphique présences
  const attendanceChartData = attendanceTrend ? {
    labels: attendanceTrend.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
    datasets: [
      {
        label: 'Taux de présence (%)',
        data: attendanceTrend.map(d => d.tauxPresence),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  } : null;

  // Configuration graphique répartition rôles
  const rolesChartData = roleDistribution ? {
    labels: roleDistribution.map(r => r._id),
    datasets: [{
      data: roleDistribution.map(r => r.count),
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(251, 146, 60, 0.8)'
      ],
      borderColor: [
        'rgb(99, 102, 241)',
        'rgb(34, 197, 94)',
        'rgb(251, 146, 60)'
      ],
      borderWidth: 2
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Objectifs du mois */}
      {goals && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Target size={24} />
            <h2 className="text-xl font-bold">Objectif du mois</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-90">Objectif</div>
              <div className="text-2xl font-bold">
                {goals.target.amount.toLocaleString()} Ar
              </div>
              <div className="text-sm opacity-75">
                {goals.target.members} membres actifs
              </div>
            </div>

            <div>
              <div className="text-sm opacity-90">Collecté</div>
              <div className="text-2xl font-bold">
                {goals.current.collected.toLocaleString()} Ar
              </div>
              <div className="text-sm opacity-75">
                {goals.current.paidCount} payés
              </div>
            </div>

            <div>
              <div className="text-sm opacity-90">Progression</div>
              <div className="text-3xl font-bold">
                {goals.progress.percentage}%
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-3 mt-2">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(goals.progress.percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm opacity-90">
            Reste à collecter: {goals.progress.remaining.toLocaleString()} Ar
            ({goals.progress.remainingMembers} membre{goals.progress.remainingMembers > 1 ? 's' : ''})
          </div>
        </div>
      )}

      {/* Insights financiers */}
      {financialInsights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Moyenne mensuelle</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Math.round(financialInsights.averages.avgPaye).toLocaleString()} Ar
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="text-green-600 mr-1" size={16} />
              <span className="text-green-600">Sur 6 mois</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meilleurs payeurs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {financialInsights.bestPayers.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Users className="text-indigo-600" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Toujours à jour
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tendance</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {financialInsights.trend.length > 0 ? 'Stable' : 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des cotisations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Évolution des cotisations</h3>
          {cotisationsChartData && (
            <div className="h-64">
              <Line data={cotisationsChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Évolution des présences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Taux de présence (30 jours)</h3>
          {attendanceChartData && (
            <div className="h-64">
              <Line data={attendanceChartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      {/* Top performers et répartition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Top 5 Présences</h3>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div key={performer.member._id} className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-indigo-100 text-indigo-600'
                } font-bold`}>
                  {index + 1}
                </div>

                {performer.member.photo ? (
                  <img
                    src={performer.member.photo}
                    alt={performer.member.pseudo}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold text-sm">
                      {performer.member.firstName?.[0]}{performer.member.lastName?.[0]}
                    </span>
                  </div>
                )}

                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {performer.member.firstName} {performer.member.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {performer.member.role}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {performer.stats.tauxPresence}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {performer.stats.present + performer.stats.retard}/{performer.stats.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par rôle */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Répartition par rôle</h3>
          {rolesChartData && (
            <div className="h-64">
              <Doughnut data={rolesChartData} options={{
                ...chartOptions,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedStatistics;
