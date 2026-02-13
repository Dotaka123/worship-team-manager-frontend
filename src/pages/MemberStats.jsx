import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Calendar, CheckCircle, XCircle, 
  Clock, Gift, BarChart3, PieChart as PieChartIcon, User,
  Award, Target, Activity, Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../services/api';

const MemberStats = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [presenceHistory, setPresenceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberStats();
  }, [id]);

  const fetchMemberStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/members/${id}`);
      setMember(data.member);
      setStats(data.stats);
      
      // Fetch cotisations history
      try {
        const cotisationsRes = await api.get(`/cotisations/member/${id}/history`);
        setCotisations(cotisationsRes.data || []);
      } catch (err) {
        console.error('Erreur cotisations:', err);
        setCotisations([]);
      }
      
      setPresenceHistory(data.presenceHistory || []);
    } catch (error) {
      console.error('Erreur:', error);
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-500">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="text-sm font-medium">Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  if (!member) return null;

  // Données pour les graphiques
  const presencePieData = [
    { name: 'Présent', value: stats?.totalPresent || 0, color: '#10b981' },
    { name: 'Absent', value: stats?.totalAbsent || 0, color: '#ef4444' },
    { name: 'Retard', value: stats?.totalRetard || 0, color: '#f59e0b' },
    { name: 'Excusé', value: stats?.totalExcused || 0, color: '#8b5cf6' },
  ];

  const cotisationPieData = [
    { name: 'Payé', value: stats?.cotisationsPaye || 0, color: '#10b981' },
    { name: 'Non payé', value: stats?.cotisationsNonPaye || 0, color: '#ef4444' },
  ];

  // Graphique des cotisations sur 6 mois
  const cotisationsBarData = stats?.cotisationsChart?.map(c => ({
    mois: c.mois.split('-')[1] + '/' + c.mois.split('-')[0].slice(2),
    montant: c.statut === 'paye' ? c.montant : 0,
  })).reverse() || [];

  // Graphique d'évolution des présences (30 derniers jours)
  const presenceLineData = presenceHistory.slice(-30).map((p, index) => ({
    date: new Date(p.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    present: p.status === 'present' ? 1 : 0,
    retard: p.status === 'en_retard' ? 1 : 0,
    absent: p.status === 'absent' ? 1 : 0,
    excused: p.status === 'excused' ? 1 : 0,
  }));

  // Calcul du taux de présence
  const totalPresences = (stats?.totalPresent || 0) + (stats?.totalAbsent || 0) + (stats?.totalRetard || 0) + (stats?.totalExcused || 0);
  const tauxPresence = totalPresences > 0 
    ? (((stats?.totalPresent || 0) + (stats?.totalRetard || 0)) / totalPresences * 100).toFixed(1)
    : 0;

  // Calcul du taux de paiement cotisations
  const totalCotisations = (stats?.cotisationsPaye || 0) + (stats?.cotisationsNonPaye || 0);
  const tauxPaiement = totalCotisations > 0
    ? ((stats?.cotisationsPaye || 0) / totalCotisations * 100).toFixed(1)
    : 0;

  // Style selon le genre
  const genderStyle = member.gender === 'femme' 
    ? { ring: 'ring-pink-500/50', bg: 'bg-pink-500/10', text: 'text-pink-400', gradient: 'from-pink-500 to-rose-400' }
    : { ring: 'ring-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', gradient: 'from-indigo-500 to-cyan-400' };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-6">
          <button
            onClick={() => navigate('/members')}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Retour aux membres</span>
          </button>
        </div>

        {/* Header avec photo et nom */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Photo */}
            <div className="relative">
              {member.photo ? (
                <img
                  src={member.photo}
                  alt={member.firstName}
                  className={`w-24 h-24 md:w-32 md:h-32 rounded-full object-cover ring-4 ${genderStyle.ring}`}
                />
              ) : (
                <div className={`w-24 h-24 md:w-32 md:h-32 rounded-full ${genderStyle.bg} ring-4 ${genderStyle.ring} flex items-center justify-center`}>
                  <User className={`w-12 h-12 md:w-16 md:h-16 ${genderStyle.text}`} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-2">
                {member.firstName} {member.lastName}
              </h1>
              {member.pseudo && (
                <p className="text-lg text-neutral-400 mb-3">
                  "{member.pseudo}"
                </p>
              )}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {member.role && (
                  <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm border border-indigo-500/30">
                    {member.role}
                  </span>
                )}
                {member.instrument && (
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm border border-amber-500/30">
                    {member.instrument}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm border ${
                  member.status === 'actif' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  {member.status === 'actif' ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Taux de présence */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-white/90" />
              <Award className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{tauxPresence}%</p>
            <p className="text-sm text-white/80">Taux de présence</p>
          </div>

          {/* Total présences */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-indigo-400" />
              <Activity className="w-5 h-5 text-neutral-600" />
            </div>
            <p className="text-3xl font-bold text-neutral-100 mb-1">{totalPresences}</p>
            <p className="text-sm text-neutral-400">Total présences</p>
          </div>

          {/* Taux de paiement */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Gift className="w-8 h-8 text-white/90" />
              <Target className="w-5 h-5 text-white/60" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{tauxPaiement}%</p>
            <p className="text-sm text-white/80">Cotisations payées</p>
          </div>

          {/* Total cotisations */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-emerald-400" />
              <Zap className="w-5 h-5 text-neutral-600" />
            </div>
            <p className="text-3xl font-bold text-neutral-100 mb-1">{stats?.cotisationsPaye || 0}</p>
            <p className="text-sm text-neutral-400">Cotisations payées</p>
          </div>
        </div>

        {/* Détails présences */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <p className="text-sm text-neutral-400">Présent</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats?.totalPresent || 0}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-neutral-400">Retard</p>
            </div>
            <p className="text-2xl font-bold text-amber-400">{stats?.totalRetard || 0}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-neutral-400">Absent</p>
            </div>
            <p className="text-2xl font-bold text-red-400">{stats?.totalAbsent || 0}</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg">📝</span>
              <p className="text-sm text-neutral-400">Excusé</p>
            </div>
            <p className="text-2xl font-bold text-violet-400">{stats?.totalExcused || 0}</p>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Pie Chart Présences */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              Répartition présences
            </h3>
            {totalPresences > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={presencePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {presencePieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-neutral-500">
                Aucune donnée
              </div>
            )}
          </div>

          {/* Pie Chart Cotisations */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
              <Gift className="w-5 h-5 text-emerald-400" />
              Répartition cotisations
            </h3>
            {totalCotisations > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={cotisationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cotisationPieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-neutral-500">
                Aucune donnée
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart Cotisations */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-400" />
            Cotisations - 6 derniers mois
          </h3>
          {cotisationsBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cotisationsBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="mois" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                  formatter={(value) => [`${value.toLocaleString()} Ar`, 'Payé']}
                />
                <Bar dataKey="montant" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-neutral-500">
              Aucune donnée
            </div>
          )}
        </div>

        {/* Line Chart Évolution présences */}
        {presenceLineData.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-neutral-100 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              Évolution des présences (30 derniers jours)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={presenceLineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" name="Présent" strokeWidth={2} />
                <Line type="monotone" dataKey="retard" stroke="#f59e0b" name="Retard" strokeWidth={2} />
                <Line type="monotone" dataKey="absent" stroke="#ef4444" name="Absent" strokeWidth={2} />
                <Line type="monotone" dataKey="excused" stroke="#8b5cf6" name="Excusé" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Historiques en tableaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Historique Cotisations */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-100">Historique cotisations</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              {cotisations.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  Aucune cotisation enregistrée
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-neutral-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Mois</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Montant</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {cotisations.slice(0, 10).map((c) => (
                      <tr key={c._id} className="hover:bg-neutral-800/30">
                        <td className="px-4 py-3 text-neutral-100 text-sm font-medium">{c.mois}</td>
                        <td className="px-4 py-3 text-neutral-300 text-sm">{c.montant?.toLocaleString()} Ar</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            c.statut === 'paye' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {c.statut === 'paye' ? 'Payé' : 'Non payé'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Historique Présences */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-100">Historique présences</h3>
            </div>
            <div className="overflow-x-auto max-h-96">
              {presenceHistory.length === 0 ? (
                <div className="p-8 text-center text-neutral-500">
                  Aucune présence enregistrée
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-neutral-800/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {presenceHistory.slice(0, 10).map((p) => (
                      <tr key={p._id} className="hover:bg-neutral-800/30">
                        <td className="px-4 py-3 text-neutral-100 text-sm font-medium">
                          {new Date(p.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-neutral-300 text-sm capitalize">
                          {p.type || 'Répétition'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                            p.status === 'en_retard' ? 'bg-amber-500/20 text-amber-400' :
                            p.status === 'excused' ? 'bg-violet-500/20 text-violet-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {p.status === 'present' ? 'Présent' : 
                             p.status === 'en_retard' ? 'Retard' : 
                             p.status === 'excused' ? 'Excusé' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MemberStats;
