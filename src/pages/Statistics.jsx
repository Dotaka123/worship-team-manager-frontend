import { useState, useEffect } from 'react';
import { membersAPI, attendanceAPI } from '../services/api';
import { Trophy, TrendingUp, Calendar, Clock, UserX, CheckCircle } from 'lucide-react';

const Statistics = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'custom'
  const [sortBy, setSortBy] = useState('presence'); // 'presence', 'absence', 'retard', 'excused'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, attendanceRes] = await Promise.all([
        membersAPI.getAll(),
        attendanceAPI.getAll()
      ]);
      
      setMembers(membersRes.data || []);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les dates de début et fin selon la période
  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (period === 'week') {
      // Cette semaine (du lundi au dimanche)
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (period === 'month') {
      // Ce mois-ci
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (period === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      // Par défaut, ce mois-ci
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  // Filtrer les présences selon la période
  const getFilteredAttendance = () => {
    const { startDate, endDate } = getDateRange();
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

  // Calculer les statistiques pour chaque membre
  const calculateMemberStats = () => {
    const filteredAttendance = getFilteredAttendance();
    
    return members
      .filter(m => m.status === 'actif')
      .map(member => {
        const memberRecords = filteredAttendance.filter(
          record => String(record.member?._id || record.member) === String(member._id)
        );

        const total = memberRecords.length;
        const present = memberRecords.filter(r => r.status === 'present').length;
        const absent = memberRecords.filter(r => r.status === 'absent').length;
        const late = memberRecords.filter(r => r.status === 'en_retard').length;
        const excused = memberRecords.filter(r => r.status === 'excused').length;

        const presenceRate = total > 0 ? ((present + late) / total * 100) : 0;

        return {
          ...member,
          stats: {
            total,
            present,
            absent,
            late,
            excused,
            presenceRate
          }
        };
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'presence':
            return b.stats.presenceRate - a.stats.presenceRate;
          case 'absence':
            return b.stats.absent - a.stats.absent;
          case 'retard':
            return b.stats.late - a.stats.late;
          case 'excused':
            return b.stats.excused - a.stats.excused;
          default:
            return b.stats.presenceRate - a.stats.presenceRate;
        }
      });
  };

  const memberStats = calculateMemberStats();

  // Obtenir le badge de médaille
  const getMedalBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  // Obtenir la couleur selon le taux
  const getRateColor = (rate) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    if (rate >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const { startDate, endDate } = getDateRange();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-400">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
            Statistiques & Leaderboard
          </h1>
          <p className="text-gray-400 mt-1">
            Classement des membres par performance
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Période */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            <Calendar className="w-4 h-4 inline mr-2" />
            Période
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Cette semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Ce mois-ci
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                period === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Personnalisé
            </button>
          </div>

          {period === 'custom' && (
            <div className="mt-3 flex gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="Date début"
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                placeholder="Date fin"
              />
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Du {startDate.toLocaleDateString('fr-FR')} au {endDate.toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Trier par */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-400 mb-3">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trier par
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSortBy('presence')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === 'presence'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ✓ Taux de présence
            </button>
            <button
              onClick={() => setSortBy('absence')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === 'absence'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ✗ Absences
            </button>
            <button
              onClick={() => setSortBy('retard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === 'retard'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ⏰ Retards
            </button>
            <button
              onClick={() => setSortBy('excused')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                sortBy === 'excused'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📝 Excusés
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-lg font-semibold text-white">
            Classement des Membres
          </h2>
        </div>

        {memberStats.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <UserX className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucune donnée disponible pour cette période</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {memberStats.map((member, index) => (
              <div
                key={member._id}
                className={`p-4 hover:bg-gray-900/50 transition ${
                  index < 3 ? 'bg-gray-900/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rang */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${
                      index < 3 ? 'text-3xl' : 'text-gray-500'
                    }`}>
                      {getMedalBadge(index)}
                    </span>
                  </div>

                  {/* Photo + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 border-gray-700">
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {member.role || 'Membre'} {member.instrument && `• ${member.instrument}`}
                      </p>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Taux de présence */}
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getRateColor(member.stats.presenceRate)}`}>
                        {member.stats.presenceRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">Présence</div>
                    </div>

                    {/* Détails */}
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-400 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {member.stats.present}
                        </div>
                        <div className="text-xs text-gray-500">Présent</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400 font-semibold">
                          <Clock className="w-4 h-4" />
                          {member.stats.late}
                        </div>
                        <div className="text-xs text-gray-500">Retard</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-red-400 font-semibold">
                          <UserX className="w-4 h-4" />
                          {member.stats.absent}
                        </div>
                        <div className="text-xs text-gray-500">Absent</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-violet-400 font-semibold">
                          📝 {member.stats.excused}
                        </div>
                        <div className="text-xs text-gray-500">Excusé</div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="text-center px-3 py-1 bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-white">
                        {member.stats.total}
                      </div>
                      <div className="text-xs text-gray-400">Total</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
