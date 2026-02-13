import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, X, AlertTriangle, PartyPopper, CalendarHeart, Banknote
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

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
            message: `Anniversaire de ${member.firstName} ${member.lastName} aujourd'hui !`,
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
              message: `${member.firstName} ${member.lastName} — ${count} absences sans motif (30 j)`,
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
            message: `${c.membre.firstName} ${c.membre.lastName} — cotisation impayée (${c.montant?.toLocaleString()} Ar)`,
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
  const highCount = notifications.filter(n => n.priority === 'high').length;

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-lg transition"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
        {notifications.length > 0 && (
          <span
            className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white rounded-full ${
              highCount > 0 ? 'bg-red-500' : 'bg-indigo-500'
            }`}
          >
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Panel avec animation douce */}
      {showPanel && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden bg-black/20 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setShowPanel(false)}
          />
          <div 
            className="fixed md:absolute right-0 top-[58px] md:top-full md:right-0 z-50 w-full md:w-96 max-h-[calc(100vh-4rem)] md:max-h-[580px] bg-neutral-900 border border-neutral-800 md:rounded-xl shadow-2xl shadow-black/50 overflow-hidden md:mt-2 animate-in fade-in slide-in-from-top-2 duration-200"
          >

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950/50">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-neutral-400" />
                <h3 className="font-semibold text-neutral-200 text-sm">Notifications</h3>
                {notifications.length > 0 && (
                  <span className="text-xs text-neutral-500">({notifications.length})</span>
                )}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(100vh-8rem)] md:max-h-[500px]">
              {loading ? (
                <div className="p-8 flex flex-col items-center gap-3">
                  <div className="w-full bar-loader" />
                  <p className="text-sm text-neutral-500">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-neutral-600" />
                  </div>
                  <p className="text-sm text-neutral-500">Aucune notification</p>
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-1.5">
                  {/* Afficher seulement les 2 premières notifications */}
                  {notifications.slice(0, 2).map((notif, index) => {
                    const cfg = notifConfig[notif.type] || notifConfig['absence'];
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 ${cfg.bg} ${cfg.border}`}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.iconBg}`}>
                          <Icon className={`w-4 h-4 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-200 leading-snug">{notif.message}</p>
                          <p className="text-xs text-neutral-600 mt-0.5">{formatTime(notif.timestamp)}</p>
                        </div>
                        <button
                          onClick={() => dismiss(notif.id)}
                          className="p-0.5 text-neutral-600 hover:text-neutral-300 rounded transition-all duration-200 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* Bouton "Voir plus" si plus de 2 notifications */}
                  {notifications.length > 2 && (
                    <button
                      onClick={() => {
                        setShowPanel(false);
                        navigate('/notifications');
                      }}
                      className="mt-2 w-full py-2.5 px-4 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-sm font-medium rounded-lg transition-all duration-200 border border-neutral-700/50"
                    >
                      Voir toutes les notifications ({notifications.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-neutral-800">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-xs text-neutral-500 hover:text-neutral-300 transition-all duration-200 py-1"
                >
                  Tout effacer
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
