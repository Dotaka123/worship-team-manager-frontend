import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { membersAPI } from '../services/api';
import api from '../services/api';
import {
  Users, Mic2, Guitar, Zap, CheckCircle2,
  CalendarCheck, Wallet, ArrowRight, Music4,
  TrendingUp, Award, Clock, AlertCircle, Download
} from 'lucide-react';
import BirthdayConfetti from '../components/BirthdayConfetti';

/* ── Config des stats cards ── */
const statConfig = [
  {
    key: 'total',
    label: 'Total membres',
    icon: Users,
    gradient: 'from-indigo-500 to-purple-600',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/40',
    filterRole: 'all',
  },
  {
    key: 'chanteurs',
    label: 'Chanteurs',
    icon: Mic2,
    gradient: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/40',
    filterRole: 'chanteur',
  },
  {
    key: 'musiciens',
    label: 'Musiciens',
    icon: Guitar,
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/40',
    filterRole: 'musicien',
  },
  {
    key: 'techniciens',
    label: 'Techniciens',
    icon: Zap,
    gradient: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/40',
    filterRole: 'technicien',
  },
  {
    key: 'actifs',
    label: 'Actifs',
    icon: CheckCircle2,
    gradient: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/40',
    filterRole: 'all',
  },
];

/* ── Skeleton card ── */
const StatCardSkeleton = () => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
    <div className="skeleton w-10 h-10 rounded-lg mb-4" />
    <div className="skeleton h-10 w-16 mb-2 rounded" />
    <div className="skeleton h-4 w-24 rounded" />
  </div>
);

/* ── Stat card cliquable ── */
const StatCard = ({ icon: Icon, label, value, gradient, iconBg, iconColor, hoverBorder, filterRole, navigate, trend }) => (
  <button
    onClick={() => {
      if (filterRole && filterRole !== 'all') {
        navigate('/members', { state: { filterRole } });
      } else {
        navigate('/members');
      }
    }}
    className={`bg-neutral-900 border border-neutral-800 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${hoverBorder} cursor-pointer text-left w-full group relative overflow-hidden`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && (
          <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-neutral-100 tabular-nums leading-none mb-2">
        {value}
      </p>
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
        {label}
      </p>
    </div>
  </button>
);

/* ── Activity Item ── */
const ActivityItem = ({ type, text, time }) => {
  const colors = {
    presence: 'bg-green-500',
    member: 'bg-blue-500',
    cotisation: 'bg-yellow-500',
    update: 'bg-purple-500',
  };

  return (
    <div className="flex items-start space-x-3 pb-4 border-b border-neutral-800 last:border-0 last:pb-0">
      <div className={`w-2 h-2 rounded-full ${colors[type] || 'bg-neutral-500'} mt-2`}></div>
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-300">{text}</p>
        <p className="text-xs text-neutral-600 mt-1">{time}</p>
      </div>
    </div>
  );
};

/* ── Member Row ── */
const MemberRow = ({ member, rank }) => {
  const navigate = useNavigate();
  
  const rankColors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-slate-400 to-slate-600',
    3: 'from-orange-400 to-orange-600',
  };

  const rankBg = {
    1: 'bg-yellow-500/20 border-yellow-600/30',
    2: 'bg-slate-700/20 border-slate-600/30',
    3: 'bg-orange-700/20 border-orange-600/30',
  };

  return (
    <tr 
      onClick={() => navigate(`/members/${member._id}`)}
      className="border-b border-neutral-800/50 hover:bg-indigo-500/5 transition-all cursor-pointer group"
    >
      <td className="py-4 px-2">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rankColors[rank] || 'from-indigo-400 to-purple-600'} flex items-center justify-center font-bold text-sm`}>
                {member.firstName?.[0]}{member.lastName?.[0]}
              </div>
            )}
            {rank && rank <= 3 && (
              <div className={`absolute -top-1 -right-1 w-5 h-5 ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : 'bg-orange-500'} rounded-full flex items-center justify-center text-xs font-bold border-2 border-neutral-900 ${rank === 2 ? 'text-neutral-900' : ''}`}>
                {rank}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-neutral-200 truncate">
              {member.firstName} {member.lastName}
            </p>
            <p className="text-xs text-neutral-500 truncate">{member.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-2">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          member.role?.toLowerCase().includes('chanteur') ? 'bg-indigo-600/20 text-indigo-400' :
          member.role?.toLowerCase().includes('musicien') ? 'bg-amber-600/20 text-amber-400' :
          member.role?.toLowerCase().includes('technicien') ? 'bg-violet-600/20 text-violet-400' :
          'bg-neutral-600/20 text-neutral-400'
        }`}>
          {member.role}
        </span>
      </td>
      <td className="py-4 px-2 text-center">
        <p className="font-semibold text-neutral-200">{member.presences || 0}/{member.totalServices || 0}</p>
      </td>
      <td className="py-4 px-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-16 bg-neutral-800 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                member.attendanceRate >= 90 ? 'bg-green-500' :
                member.attendanceRate >= 70 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${member.attendanceRate || 0}%` }}
            ></div>
          </div>
          <span className={`text-sm font-bold ${
            member.attendanceRate >= 90 ? 'text-green-400' :
            member.attendanceRate >= 70 ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {member.attendanceRate || 0}%
          </span>
        </div>
      </td>
      <td className="py-4 px-2 text-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          member.cotisationStatus === 'a_jour' ? 'bg-green-600/20 text-green-400' :
          'bg-red-600/20 text-red-400'
        }`}>
          {member.cotisationStatus === 'a_jour' ? 'À jour' : 'En retard'}
        </span>
      </td>
      <td className="py-4 px-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${
            member.status === 'actif' ? 'bg-green-500' :
            member.status === 'en_pause' ? 'bg-yellow-500' :
            'bg-red-500'
          }`}></span>
          <span className="text-xs text-neutral-400 capitalize">
            {member.status?.replace('_', ' ')}
          </span>
        </div>
      </td>
    </tr>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0, chanteurs: 0, musiciens: 0, techniciens: 0, actifs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [birthdayMember, setBirthdayMember] = useState(null);
  const [allMembers, setAllMembers] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState({ cotisations: 0, inactifs: 0 });
  const [quickStats, setQuickStats] = useState({ cotisationsAJour: 0, tauxPresence: 0, membresActifs: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch members
        const { data: members } = await membersAPI.getAll();
        
        // Calculer les statistiques de base
        const normalizeRole = (role) =>
          role ? role.toLowerCase().replace('(euse)', '').trim() : '';

        setStats({
          total: members.length,
          chanteurs: members.filter(m => normalizeRole(m.role) === 'chanteur').length,
          musiciens: members.filter(m => normalizeRole(m.role) === 'musicien').length,
          techniciens: members.filter(m => normalizeRole(m.role) === 'technicien').length,
          actifs: members.filter(m => m.status === 'actif').length,
        });

        // Récupérer les présences pour chaque membre
        const membersWithStats = await Promise.all(
          members.map(async (member) => {
            try {
              const response = await api.get(`/statistics/members/${member._id}`);
              return {
                ...member,
                presences: response.data.attendance?.present || 0,
                totalServices: response.data.attendance?.total || 0,
                attendanceRate: response.data.attendance?.tauxPresence || 0,
                cotisationStatus: response.data.cotisations?.nonPaye > 0 ? 'en_retard' : 'a_jour',
              };
            } catch (error) {
              return {
                ...member,
                presences: 0,
                totalServices: 0,
                attendanceRate: 0,
                cotisationStatus: 'a_jour',
              };
            }
          })
        );

        setAllMembers(membersWithStats);

        // Top performers (membres avec meilleur taux de présence)
        const sorted = [...membersWithStats]
          .filter(m => m.totalServices > 0)
          .sort((a, b) => b.attendanceRate - a.attendanceRate)
          .slice(0, 3);
        setTopPerformers(sorted);

        // Alerts
        const cotisationsEnRetard = membersWithStats.filter(m => m.cotisationStatus === 'en_retard').length;
        const membresInactifs = members.filter(m => m.status === 'inactif' || m.status === 'en_pause').length;
        setAlerts({ cotisations: cotisationsEnRetard, inactifs: membresInactifs });

        // Quick Stats
        const cotisationsOk = membersWithStats.filter(m => m.cotisationStatus === 'a_jour').length;
        const avgPresence = membersWithStats.reduce((sum, m) => sum + m.attendanceRate, 0) / membersWithStats.length || 0;
        setQuickStats({
          cotisationsAJour: cotisationsOk,
          tauxPresence: Math.round(avgPresence),
          membresActifs: Math.round((stats.actifs / members.length) * 100) || 0,
        });

        // Recent activities (simulées)
        setRecentActivities([
          { type: 'presence', text: 'Sophie L. marquée présente', time: 'Il y a 5 min' },
          { type: 'member', text: 'David R. a rejoint l\'équipe', time: 'Il y a 2h' },
          { type: 'cotisation', text: 'Paul M. a payé sa cotisation', time: 'Il y a 5h' },
          { type: 'update', text: 'Profil de Anne K. modifié', time: 'Hier' },
        ]);

        // Anniversaires
        const today = new Date();
        const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const birthdayToday = members.find(member => {
          if (!member.dateOfBirth) return false;
          const b = new Date(member.dateOfBirth);
          return `${String(b.getMonth() + 1).padStart(2, '0')}-${String(b.getDate()).padStart(2, '0')}` === todayStr;
        });
        if (birthdayToday) {
          const age = today.getFullYear() - new Date(birthdayToday.dateOfBirth).getFullYear();
          setBirthdayMember({ ...birthdayToday, age });
        }
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {birthdayMember && (
          <BirthdayConfetti member={birthdayMember} onClose={() => setBirthdayMember(null)} />
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Music4 className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-100 tracking-tight">
              Tableau de bord
            </h1>
          </div>
          <p className="text-neutral-500 text-sm ml-11">Vue d'ensemble complète de votre équipe</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statConfig.map((cfg) => (
                <StatCard 
                  key={cfg.key} 
                  {...cfg} 
                  value={stats[cfg.key]} 
                  navigate={navigate}
                  trend={cfg.key === 'total' ? '+3' : null}
                />
              ))
          }
        </div>

        {/* Actions rapides */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-indigo-400" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/members"
              className="group flex items-center justify-between px-4 py-4 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Gérer les membres</p>
                  <p className="text-xs opacity-80">Ajouter, modifier ou supprimer</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/attendance"
              className="group flex items-center justify-between px-4 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-all font-medium text-sm border border-neutral-700 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="font-semibold">Marquer les présences</p>
                  <p className="text-xs text-neutral-500">Enregistrer la participation</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-80 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/cotisations"
              className="group flex items-center justify-between px-4 py-4 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5" />
                <div>
                  <p className="font-semibold">Gérer les cotisations</p>
                  <p className="text-xs opacity-80">Suivre les paiements</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Left Column - Top Performers */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold mb-1 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    Top Performers
                  </h3>
                  <p className="text-sm text-neutral-500">Membres les plus assidus ce mois</p>
                </div>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-neutral-500">Chargement...</div>
                ) : topPerformers.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">Aucune donnée disponible</div>
                ) : (
                  topPerformers.map((member, index) => {
                    const rank = index + 1;
                    const rankBg = {
                      1: 'bg-gradient-to-r from-yellow-600/20 to-transparent border-yellow-600/30',
                      2: 'bg-gradient-to-r from-slate-700/20 to-transparent border-slate-600/30',
                      3: 'bg-gradient-to-r from-orange-700/20 to-transparent border-orange-600/30',
                    };
                    const rankColors = {
                      1: 'from-yellow-400 to-yellow-600',
                      2: 'from-slate-400 to-slate-600',
                      3: 'from-orange-400 to-orange-600',
                    };
                    const rankBadge = {
                      1: 'bg-yellow-500',
                      2: 'bg-slate-400 text-neutral-900',
                      3: 'bg-orange-500',
                    };

                    return (
                      <div 
                        key={member._id}
                        onClick={() => navigate(`/members/${member._id}`)}
                        className={`flex items-center justify-between ${rankBg[rank]} border rounded-xl p-4 cursor-pointer hover:bg-opacity-80 transition-all group`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative flex-shrink-0">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.firstName}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${rankColors[rank]} flex items-center justify-center font-bold text-lg`}>
                                {member.firstName?.[0]}{member.lastName?.[0]}
                              </div>
                            )}
                            <div className={`absolute -top-1 -right-1 w-6 h-6 ${rankBadge[rank]} rounded-full flex items-center justify-center text-xs font-bold border-2 border-neutral-900`}>
                              {rank}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-200">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-neutral-500">{member.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-2xl font-bold ${rank === 1 ? 'text-yellow-400' : 'text-neutral-300'}`}>
                            {member.attendanceRate}%
                          </p>
                          <p className="text-xs text-neutral-500">
                            {member.presences}/{member.totalServices} présences
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Alerts */}
          <div className="space-y-6">
            
            {/* Activités récentes */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                  Activités Récentes
                </h3>
                <span className="text-xs text-neutral-500">Aujourd'hui</span>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </div>
            </div>

            {/* Alertes */}
            {(alerts.cotisations > 0 || alerts.inactifs > 0) && (
              <div className="bg-gradient-to-br from-red-900/30 to-red-950/30 border border-red-800/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                    Alertes
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </div>
                <div className="space-y-3">
                  {alerts.cotisations > 0 && (
                    <div className="bg-red-900/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-red-300">
                        {alerts.cotisations} cotisation{alerts.cotisations > 1 ? 's' : ''} en retard
                      </p>
                      <p className="text-xs text-red-400/70 mt-1">Paiements non reçus ce mois</p>
                    </div>
                  )}
                  {alerts.inactifs > 0 && (
                    <div className="bg-yellow-900/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-yellow-300">
                        {alerts.inactifs} membre{alerts.inactifs > 1 ? 's' : ''} inactif{alerts.inactifs > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-yellow-400/70 mt-1">En pause ou inactifs</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-emerald-400" />
                Statistiques Rapides
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-neutral-300">Cotisations à jour</span>
                    </div>
                    <span className="font-bold text-green-400">{quickStats.cotisationsAJour}</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(quickStats.cotisationsAJour / stats.total) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                      <span className="text-sm text-neutral-300">Taux de présence moyen</span>
                    </div>
                    <span className="font-bold text-indigo-400">{quickStats.tauxPresence}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-indigo-500 h-2 rounded-full" 
                      style={{ width: `${quickStats.tauxPresence}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm text-neutral-300">Membres actifs</span>
                    </div>
                    <span className="font-bold text-purple-400">{quickStats.membresActifs}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${quickStats.membresActifs}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* All Members Stats Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Statistiques Complètes des Membres</h3>
              <p className="text-sm text-neutral-500">Vue détaillée de tous les membres de l'équipe</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm flex items-center space-x-2 transition">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400">MEMBRE</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400">RÔLE</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400 text-center">PRÉSENCES</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400 text-center">TAUX</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400 text-center">COTISATION</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400 text-center">STATUT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-neutral-500">
                      Chargement des données...
                    </td>
                  </tr>
                ) : allMembers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-neutral-500">
                      Aucun membre trouvé
                    </td>
                  </tr>
                ) : (
                  allMembers.slice(0, 10).map((member, index) => (
                    <MemberRow 
                      key={member._id} 
                      member={member} 
                      rank={index < 3 ? index + 1 : null}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {allMembers.length > 10 && (
            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate('/members')}
                className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center justify-center mx-auto space-x-2 group"
              >
                <span>Voir tous les membres ({allMembers.length})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
