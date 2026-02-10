import { useState, useEffect } from 'react';
import { Bell, X, AlertCircle, Cake, DollarSign } from 'lucide-react';
import { membersAPI, attendanceAPI } from '../services/api';
import api from '../services/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Rafraîchir toutes les 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notifs = [];

      // 1. Récupérer tous les membres actifs
      const { data: members } = await membersAPI.getAll();
      const activeMembers = members.filter(m => m.status === 'actif');

      // 2. Vérifier les anniversaires
      const today = new Date();
      const todayStr = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      activeMembers.forEach(member => {
        if (member.dateOfBirth) {
          const birthDate = new Date(member.dateOfBirth);
          const birthStr = `${String(birthDate.getMonth() + 1).padStart(2, '0')}-${String(birthDate.getDate()).padStart(2, '0')}`;
          
          // Anniversaire aujourd'hui
          if (birthStr === todayStr) {
            notifs.push({
              id: `birthday-today-${member._id}`,
              type: 'birthday-today',
              priority: 'high',
              member,
              message: `🎂 C'est l'anniversaire de ${member.firstName} ${member.lastName} aujourd'hui !`,
              timestamp: new Date()
            });
          } else {
            // Anniversaire dans les 7 prochains jours
            const daysUntil = getDaysUntilBirthday(birthDate, today);
            if (daysUntil > 0 && daysUntil <= 7) {
              notifs.push({
                id: `birthday-soon-${member._id}`,
                type: 'birthday-soon',
                priority: 'medium',
                member,
                daysUntil,
                message: `🎈 Anniversaire de ${member.firstName} dans ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`,
                timestamp: new Date()
              });
            }
          }
        }
      });

      // 3. Vérifier les absences sans motif (> 10)
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        for (const member of activeMembers) {
          const { data: attendances } = await attendanceAPI.getByMember(member._id);
          
          const recentAbsences = attendances.filter(a => {
            const attDate = new Date(a.date);
            return (
              a.status === 'absent' && 
              !a.reason && 
              attDate >= thirtyDaysAgo
            );
          });

          if (recentAbsences.length >= 10) {
            notifs.push({
              id: `absence-${member._id}`,
              type: 'absence',
              priority: 'high',
              member,
              count: recentAbsences.length,
              message: `⚠️ ${member.firstName} ${member.lastName} : ${recentAbsences.length} absences sans motif`,
              timestamp: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Erreur absences:', error);
      }

      // 4. Vérifier les cotisations non payées (MOIS PRÉCÉDENT uniquement)
      try {
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
        
        const { data: cotisations } = await api.get(`/cotisations/month/${lastMonthStr}`);
        
        const unpaid = cotisations.filter(c => c.statut !== 'paye');
        
        if (unpaid.length > 0) {
          unpaid.forEach(c => {
            if (c.membre) {
              notifs.push({
                id: `cotisation-${c._id}`,
                type: 'cotisation',
                priority: 'medium',
                member: c.membre,
                amount: c.montant,
                month: lastMonthStr,
                message: `💰 ${c.membre.firstName} ${c.membre.lastName} n'a pas payé ${lastMonthStr} (${c.montant.toLocaleString()} Ar)`,
                timestamp: new Date()
              });
            }
          });
        }
      } catch (error) {
        console.error('Erreur cotisations:', error);
      }

      // Trier par priorité et date
      notifs.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.timestamp - a.timestamp;
      });

      setNotifications(notifs);
    } catch (error) {
      console.error('Erreur notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilBirthday = (birthDate, today) => {
    const currentYear = today.getFullYear();
    let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    if (nextBirthday < today) {
      nextBirthday = new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
    }
    
    const diffTime = nextBirthday - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;
  const hasNotifications = notifications.length > 0;

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 text-gray-300 hover:text-white transition rounded-lg hover:bg-gray-700"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Badge count */}
        {hasNotifications && (
          <span className={`absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full ${
            highPriorityCount > 0 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-blue-500'
          }`}>
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setShowPanel(false)}
          />
          
          {/* Panel */}
          <div className="fixed md:absolute right-0 top-16 md:top-full md:right-0 z-50 w-full md:w-96 max-h-[calc(100vh-5rem)] md:max-h-[600px] bg-gray-800 border border-gray-700 md:rounded-lg shadow-2xl overflow-hidden mt-0 md:mt-2">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
              <h3 className="font-semibold text-white">Notifications</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="p-1 text-gray-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(100vh-10rem)] md:max-h-[536px]">
              {loading ? (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
                  <p className="mt-2 text-sm">Chargement...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune notification</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-700/50 transition ${
                        notif.priority === 'high' ? 'bg-red-900/10' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg shrink-0 ${
                          notif.type === 'birthday-today' ? 'bg-pink-500/20 text-pink-400' :
                          notif.type === 'birthday-soon' ? 'bg-purple-500/20 text-purple-400' :
                          notif.type === 'absence' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {notif.type.startsWith('birthday') ? (
                            <Cake className="w-5 h-5" />
                          ) : notif.type === 'absence' ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            <DollarSign className="w-5 h-5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white mb-1">{notif.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>

                        {/* Dismiss */}
                        <button
                          onClick={() => dismissNotification(notif.id)}
                          className="p-1 text-gray-500 hover:text-white rounded shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700 bg-gray-900">
                <button
                  onClick={() => setNotifications([])}
                  className="w-full text-sm text-gray-400 hover:text-white transition"
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
