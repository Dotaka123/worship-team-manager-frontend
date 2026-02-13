import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { membersAPI, attendanceAPI } from '../services/api';
import { Trophy, TrendingUp, Calendar, Clock, UserX, CheckCircle } from 'lucide-react';

/* ── Skeleton row ── */
const StatRowSkeleton = () => (
  <div className="p-3 md:p-4 flex items-center gap-4 border-b border-neutral-800">
    <div className="skeleton w-10 h-6 rounded" />
    <div className="skeleton w-10 h-10 rounded-full" />
    <div className="flex-1">
      <div className="skeleton h-3.5 w-32 mb-1.5 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
    <div className="skeleton h-8 w-16 rounded" />
  </div>
);

const Statistics = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');
  const [sortBy, setSortBy] = useState('presence');
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

  const getDateRange = () => {
    const today = new Date();
    let startDate, endDate;

    if (period === 'week') {
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (period === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (period === 'custom' && customStartDate && customEndDate) {
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    return { startDate, endDate };
  };

  const getFilteredAttendance = () => {
    const { startDate, endDate } = getDateRange();
    return attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });
  };

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

  const memberStats = useMemo(() => calculateMemberStats(), [members, attendance, period, customStartDate, customEndDate, sortBy]);

  const getMedalBadge = (index) => {
    if (index === 0) return { symbol: '1', cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', size: 'text-xs font-bold' };
    if (index === 1) return { symbol: '2', cls: 'bg-neutral-400/15 text-neutral-300 border border-neutral-500/25', size: 'text-xs font-bold' };
    if (index === 2) return { symbol: '3', cls: 'bg-amber-700/20 text-amber-600 border border-amber-700/25', size: 'text-xs font-bold' };
    return { symbol: `${index + 1}`, cls: 'text-neutral-600', size: 'text-xs' };
  };

  const getRateColor = (rate) => {
    if (rate >= 90) return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (rate >= 70) return { text: 'text-amber-400',   bar: 'bg-amber-500' };
    if (rate >= 50) return { text: 'text-orange-400',  bar: 'bg-orange-500' };
    return           { text: 'text-red-400',    bar: 'bg-red-500' };
  };

  const { startDate, endDate } = getDateRange();

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
          <p className="text-red-400">Erreur: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-6 space-y-4 md:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-neutral-100 flex items-center gap-2">
          <Trophy className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
          Statistiques
        </h1>
        <p className="text-sm text-neutral-400">
          Classement des membres
        </p>
      </div>

      {/* Filtres */}
      <div className="space-y-4">
        {/* Période */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 md:p-4">
          <label className="block text-sm font-medium text-neutral-400 mb-2 md:mb-3">
            <Calendar className="w-4 h-4 inline mr-2" />
            Période
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                period === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                period === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setPeriod('custom')}
              className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                period === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              Personnalisé
            </button>
          </div>

          {period === 'custom' && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Du</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Au</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 text-sm"
                />
              </div>
            </div>
          )}

          <div className="mt-3 text-xs text-neutral-500">
            Période: {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
          </div>
        </div>

        {/* Tri */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 md:p-4">
          <label className="block text-sm font-medium text-neutral-400 mb-2 md:mb-3">
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Trier par
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'presence', label: 'Taux de présence' },
              { key: 'absence', label: 'Absences' },
              { key: 'retard', label: 'Retards' },
              { key: 'excused', label: 'Excusés' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                  sortBy === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classement */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/50">
          <h2 className="font-semibold text-neutral-200 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Classement
          </h2>
        </div>

        {loading ? (
          <div className="divide-y divide-neutral-800">
            {Array.from({ length: 5 }).map((_, i) => <StatRowSkeleton key={i} />)}
          </div>
        ) : memberStats.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
              <UserX className="w-5 h-5 text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-500">Aucune donnée disponible</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800">
            {memberStats.map((member, index) => (
              <div
                key={member._id}
                onClick={() => navigate(`/members/${member._id}`)}
                className={`p-3 md:p-4 hover:bg-neutral-900/60 transition cursor-pointer ${
                  index < 3 ? 'bg-neutral-900/40' : ''
                }`}
              >
                {/* Version Mobile */}
                <div className="flex flex-col gap-3 md:hidden">
                  {/* Rang + Photo + Nom */}
                  <div className="flex items-center gap-3">
                    {(() => {
                      const m = getMedalBadge(index);
                      return (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${m.cls}`}>
                          <span className={m.size}>{m.symbol}</span>
                        </div>
                      );
                    })()}

                    <div className="flex-shrink-0">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.pseudo || `${member.firstName} ${member.lastName}`}
                          className="w-10 h-10 rounded-full object-cover border-2 border-neutral-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm border-2 border-neutral-700">
                          {member.pseudo?.[0]?.toUpperCase()}{member.pseudo?.[1]?.toUpperCase() || member.lastName?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-100 text-sm truncate">
                        {member.pseudo}
                      </h3>
                      <p className="text-xs text-neutral-400 truncate">
                        {member.role || 'Membre'}
                      </p>
                    </div>

                    {/* Taux de présence */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xl font-bold tabular-nums ${getRateColor(member.stats.presenceRate).text}`}>
                        {member.stats.presenceRate.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-4 gap-2 ml-11">
                    <div className="text-center bg-neutral-800 rounded-lg p-2">
                      <div className="text-green-400 font-semibold text-sm">
                        {member.stats.present}
                      </div>
                      <div className="text-xs text-neutral-500">✓</div>
                    </div>
                    <div className="text-center bg-neutral-800 rounded-lg p-2">
                      <div className="text-orange-400 font-semibold text-sm">
                        {member.stats.late}
                      </div>
                      <div className="text-xs text-neutral-500">⏰</div>
                    </div>
                    <div className="text-center bg-neutral-800 rounded-lg p-2">
                      <div className="text-red-400 font-semibold text-sm">
                        {member.stats.absent}
                      </div>
                      <div className="text-xs text-neutral-500">✗</div>
                    </div>
                    <div className="text-center bg-neutral-800 rounded-lg p-2">
                      <div className="text-violet-400 font-semibold text-sm">
                        {member.stats.excused}
                      </div>
                      <div className="text-xs text-neutral-500">📝</div>
                    </div>
                  </div>
                </div>

                {/* Version Desktop */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    {(() => {
                      const m = getMedalBadge(index);
                      return (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.cls}`}>
                          <span className={m.size}>{m.symbol}</span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.pseudo || `${member.firstName} ${member.lastName}`}
                          className="w-12 h-12 rounded-full object-cover border-2 border-neutral-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg border-2 border-neutral-700">
                          {member.pseudo?.[0]?.toUpperCase()}{member.pseudo?.[1]?.toUpperCase() || member.lastName?.[0]}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-100 truncate">
                        {member.pseudo}
                      </h3>
                      <p className="text-sm text-neutral-400 truncate">
                        {member.role || 'Membre'} {member.instrument && `• ${member.instrument}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-center">
                      <div className={`text-2xl font-bold tabular-nums ${getRateColor(member.stats.presenceRate).text}`}>
                        {member.stats.presenceRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-neutral-500">Présence</div>
                    </div>

                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-400 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {member.stats.present}
                        </div>
                        <div className="text-xs text-neutral-500">Présent</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-orange-400 font-semibold">
                          <Clock className="w-4 h-4" />
                          {member.stats.late}
                        </div>
                        <div className="text-xs text-neutral-500">Retard</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-red-400 font-semibold">
                          <UserX className="w-4 h-4" />
                          {member.stats.absent}
                        </div>
                        <div className="text-xs text-neutral-500">Absent</div>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center gap-1 text-violet-400 font-semibold">
                          📝 {member.stats.excused}
                        </div>
                        <div className="text-xs text-neutral-500">Excusé</div>
                      </div>
                    </div>

                    <div className="text-center px-3 py-1 bg-neutral-800 rounded-lg">
                      <div className="text-lg font-bold text-neutral-100">
                        {member.stats.total}
                      </div>
                      <div className="text-xs text-neutral-400">Total</div>
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
