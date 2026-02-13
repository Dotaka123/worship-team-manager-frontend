import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, AlertTriangle, PartyPopper, CalendarHeart, Banknote, ArrowLeft, Trash2
} from 'lucide-react';
import { membersAPI, attendanceAPI } from '../services/api';
import api from '../services/api';

/* ── Config par type de notif ── */
const notifConfig = {
  'birthday-today': {
    icon: PartyPopper,
    bg:     'bg-pink-500/12',
    border: 'border-pink-500/20',
    iconBg: 'bg-pink-500/15',
    text:   'text-pink-400',
  },
  'birthday-soon': {
    icon: CalendarHeart,
    bg:     'bg-purple-500/10',
    border: 'border-purple-500/15',
    iconBg: 'bg-purple-500/15',
    text:   'text-purple-400',
  },
  'absence': {
    icon: AlertTriangle,
    bg:     'bg-red-500/10',
    border: 'border-red-500/15',
    iconBg: 'bg-red-500/15',
    text:   'text-red-400',
  },
  'cotisation': {
    icon: Banknote,
    bg:     'bg-amber-500/10',
    border: 'border-amber-500/15',
    iconBg: 'bg-amber-500/15',
    text:   'text-amber-400',
  },
};

const getDaysUntilBirthday = (birthDate, today) => {
  const currentYear = today.getFullYear();
  let next = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
  if (next < today) next = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
  return Math.ceil((next - today) / (1000 * 60 * 60 * 24));
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notifs = [];
      const { data: members } = await membersAPI.getAll();
      const activeMembers = members.filter(m => m.status === 'actif');
      const today = new Date();
      const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      activeMembers.forEach(member => {
        if (!member.dateOfBirth) return;
        const bd = new Date(member.dateOfBirth);
        const bStr = `${String(bd.getMonth() + 1).padStart(2, '0')}-${String(bd.getDate()).padStart(2, '0')}`;
        if (bStr === todayStr) {
          notifs.push({
            id: `birthday-today-${member._id}`,
            type: 'birthday-today',
            priority: 'high',
            member,
            message: `Anniversaire de ${member.pseudo} aujourd'hui !`,
            timestamp: new Date(),
          });
        } else {
          const days = getDaysUntilBirthday(bd, today);
          if (days > 0 && days <= 7) {
            notifs.push({
              id: `birthday-soon-${member._id}`,
              type: 'birthday-soon',
              priority: 'medium',
              member,
              daysUntil: days,
              message: `Anniversaire de ${member.firstName} dans ${days} jour${days > 1 ? 's' : ''}`,
              timestamp: new Date(),
            });
          }
        }
      });

      // Absences
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        for (const member of activeMembers) {
          const { data: attendances } = await attendanceAPI.getByMember(member._id);
          const count = attendances.filter(a =>
            a.status === 'absent' && !a.reason && new Date(a.date) >= thirtyDaysAgo
          ).length;
          if (count >= 10) {
            notifs.push({
              id: `absence-${member._id}`,
              type: 'absence',
              priority: 'high',
              member,
              count,
              message: `${member.pseudo} — ${count} absences sans motif (30 j)`,
              timestamp: new Date(),
            });
          }
        }
      } catch {}

      // Cotisations
      try {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
        const { data: cotisations } = await api.get(`/cotisations/month/${lastMonthStr}`);
        cotisations
          .filter(c => c.statut !== 'paye' && c.membre)
          .forEach(c => notifs.push({
            id: `cotisation-${c._id}`,
            type: 'cotisation',
            priority: 'medium',
            member: c.membre,
            amount: c.montant,
            month: lastMonthStr,
            message: `${c.membre.pseudo} — cotisation impayée (${c.montant?.toLocaleString()} Ar)`,
            timestamp: new Date(),
          }));
      } catch {}

      notifs.sort((a, b) => {
        const p = { high: 0, medium: 1, low: 2 };
        return p[a.priority] !== p[b.priority]
          ? p[a.priority] - p[b.priority]
          : b.timestamp - a.timestamp;
      });

      setNotifications(notifs);
    } catch {}
    finally { setLoading(false); }
  };

  const dismiss = (id) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifications([]);

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const typeCount = {
    all: notifications.length,
    'birthday-today': notifications.filter(n => n.type === 'birthday-today').length,
    'birthday-soon': notifications.filter(n => n.type === 'birthday-soon').length,
    absence: notifications.filter(n => n.type === 'absence').length,
    cotisation: notifications.filter(n => n.type === 'cotisation').length,
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/10 rounded-lg">
                <Bell className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-100">Notifications</h1>
                <p className="text-sm text-neutral-500">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Tout effacer
              </button>
            )}
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'Toutes', count: typeCount.all },
            { key: 'birthday-today', label: 'Anniversaires aujourd\'hui', count: typeCount['birthday-today'] },
            { key: 'birthday-soon', label: 'Anniversaires prochains', count: typeCount['birthday-soon'] },
            { key: 'absence', label: 'Absences', count: typeCount.absence },
            { key: 'cotisation', label: 'Cotisations', count: typeCount.cotisation },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                filter === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
              }`}
            >
              {label}
              <span className="ml-2 text-xs opacity-70">({count})</span>
            </button>
          ))}
        </div>

        {/* Liste des notifications */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-10 flex flex-col items-center gap-3">
              <div className="w-full bar-loader" />
              <p className="text-sm text-neutral-500">Chargement...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-7 h-7 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-400 font-medium mb-1">
                Aucune notification
              </p>
              <p className="text-xs text-neutral-600">
                {filter !== 'all' ? 'Changez de filtre pour voir d\'autres notifications' : 'Vous êtes à jour !'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800">
              {filteredNotifications.map((notif, index) => {
                const cfg = notifConfig[notif.type] || notifConfig['absence'];
                const Icon = cfg.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 hover:bg-neutral-900/60 transition-all duration-200 ${cfg.bg}`}
                    style={{
                      animationDelay: `${index * 30}ms`
                    }}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                      <Icon className={`w-5 h-5 ${cfg.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-200 leading-relaxed mb-1">{notif.message}</p>
                      <p className="text-xs text-neutral-600">
                        {formatDate(notif.timestamp)} à {formatTime(notif.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={() => dismiss(notif.id)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 rounded-lg transition-all duration-200 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
