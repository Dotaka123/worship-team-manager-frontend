import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { membersAPI } from '../services/api';
import api from '../services/api';
import {
  Users, Mic2, Guitar, Zap, CheckCircle2,
  CalendarCheck, Wallet, ArrowRight, Music4,
  Award, Clock, AlertCircle
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

/* ── Member Row ── */
const MemberRow = ({ member, rank }) => {
  const navigate = useNavigate();
  
  const rankColors = {
    1: 'from-yellow-400 to-yellow-600',
    2: 'from-slate-400 to-slate-600',
    3: 'from-orange-400 to-orange-600',
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // UNE SEULE requête API pour tout récupérer
        const { data: members } = await membersAPI.getAll();
        
        // Calculer toutes les statistiques côté client
        const normalizeRole = (role) =>
          role ? role.toLowerCase().replace('(euse)', '').trim() : '';

        setStats({
          total: members.length,
          chanteurs: members.filter(m => normalizeRole(m.role) === 'chanteur').length,
          musiciens: members.filter(m => normalizeRole(m.role) === 'musicien').length,
          techniciens: members.filter(m => normalizeRole(m.role) === 'technicien').length,
          actifs: members.filter(m => m.status === 'actif').length,
        });

        // Trier par nom pour affichage
        const sortedMembers = [...members].sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setAllMembers(sortedMembers);

        // Vérifier les anniversaires
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

  // Calculer les alertes côté client
  const alerts = {
    inactifs: allMembers.filter(m => m.status === 'inactif' || m.status === 'en_pause').length,
  };

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
          <p className="text-neutral-500 text-sm ml-11">Vue d'ensemble de votre équipe</p>
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

        {/* Alerte si membres inactifs */}
        {alerts.inactifs > 0 && (
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-950/30 border border-yellow-800/50 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-yellow-300 mb-1">
                  Attention
                </h3>
                <p className="text-sm text-yellow-400/80">
                  {alerts.inactifs} membre{alerts.inactifs > 1 ? 's sont' : ' est'} en pause ou inactif{alerts.inactifs > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Liste complète des membres */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-1">Tous les Membres</h3>
              <p className="text-sm text-neutral-500">{allMembers.length} membre{allMembers.length > 1 ? 's' : ''} dans l'équipe</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 text-left">
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400">MEMBRE</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400">RÔLE</th>
                  <th className="pb-3 px-2 text-sm font-semibold text-neutral-400 text-center">STATUT</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-neutral-500">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-5 h-5 animate-spin" />
                        Chargement...
                      </div>
                    </td>
                  </tr>
                ) : allMembers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-neutral-500">
                      Aucun membre trouvé
                    </td>
                  </tr>
                ) : (
                  allMembers.map((member, index) => (
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
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
