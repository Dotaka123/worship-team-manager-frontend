import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { membersAPI } from '../services/api';
import {
  Users, Mic2, Guitar, Zap, CheckCircle2,
  CalendarCheck, Wallet, ArrowRight, Music4
} from 'lucide-react';
import BirthdayConfetti from '../components/BirthdayConfetti';

/* ── Config des stats cards ── */
const statConfig = [
  {
    key: 'total',
    label: 'Total membres',
    icon: Users,
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/40',
  },
  {
    key: 'chanteurs',
    label: 'Chanteurs',
    icon: Mic2,
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/40',
  },
  {
    key: 'musiciens',
    label: 'Musiciens',
    icon: Guitar,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/40',
  },
  {
    key: 'techniciens',
    label: 'Techniciens',
    icon: Zap,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/40',
  },
  {
    key: 'actifs',
    label: 'Actifs',
    icon: CheckCircle2,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/40',
  },
];

/* ── Skeleton card ── */
const StatCardSkeleton = () => (
  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
    <div className="skeleton w-9 h-9 rounded-lg mb-3" />
    <div className="skeleton h-8 w-12 mb-1.5 rounded" />
    <div className="skeleton h-3 w-20 rounded" />
  </div>
);

/* ── Stat card ── */
const StatCard = ({ icon: Icon, label, value, iconBg, iconColor, hoverBorder }) => (
  <div
    className={`bg-neutral-900 border border-neutral-800 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 ${hoverBorder} cursor-default`}
  >
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <p className="text-2xl font-bold text-neutral-100 tabular-nums leading-none mb-1">
      {value}
    </p>
    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">
      {label}
    </p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0, chanteurs: 0, musiciens: 0, techniciens: 0, actifs: 0,
  });
  const [loading, setLoading] = useState(true);
  const [birthdayMember, setBirthdayMember] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await membersAPI.getAll();
        const normalizeRole = (role) =>
          role ? role.toLowerCase().replace('(euse)', '').trim() : '';

        setStats({
          total: data.length,
          chanteurs: data.filter(m => normalizeRole(m.role) === 'chanteur').length,
          musiciens: data.filter(m => normalizeRole(m.role) === 'musicien').length,
          techniciens: data.filter(m => normalizeRole(m.role) === 'technicien').length,
          actifs: data.filter(m => m.status === 'actif').length,
        });

        const today = new Date();
        const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const birthdayToday = data.find(member => {
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
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {birthdayMember && (
        <BirthdayConfetti member={birthdayMember} onClose={() => setBirthdayMember(null)} />
      )}

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <Music4 className="w-3.5 h-3.5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
            Tableau de bord
          </h1>
        </div>
        <p className="text-neutral-500 text-sm ml-9.5">Vue d'ensemble de votre équipe</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statConfig.map((cfg) => (
              <StatCard key={cfg.key} {...cfg} value={stats[cfg.key]} />
            ))
        }
      </div>

      {/* Actions rapides */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/members"
            className="group flex items-center justify-between px-4 py-3 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gérer les membres
            </div>
            <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/attendance"
            className="group flex items-center justify-between px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl transition-all font-medium text-sm border border-neutral-700 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-neutral-400" />
              Marquer les présences
            </div>
            <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/cotisations"
            className="group flex items-center justify-between px-4 py-3 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl transition-all font-medium text-sm shadow-lg shadow-emerald-500/15 hover:shadow-emerald-500/25 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Gérer les cotisations
            </div>
            <ArrowRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
