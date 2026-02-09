import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, Camera, Loader2, 
  Gift, CheckCircle, XCircle, Music, Pencil, Cake,
  UserCheck, UserX, Clock, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import api from '../services/api';
import MemberForm from '../components/MemberForm';

const MemberDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [stats, setStats] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [presenceHistory, setPresenceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('cotisations');

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/members/${id}`);
      setMember(data.member);
      setStats(data.stats);
      setCotisations(data.cotisations || []);
      setPresenceHistory(data.presenceHistory || []);
    } catch (error) {
      console.error('Erreur:', error);
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await api.put(`/members/${id}`, formData);
      await fetchMember();
      setEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setUploading(true);
      await api.post(`/members/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchMember();
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getRoleLabel = () => {
    const baseRole = member?.role || 'Musicien';
    if (member?.gender === 'femme') {
      const femaleVersions = {
        'Chanteur': 'Chanteuse',
        'Musicien': 'Musicienne',
        'Technicien': 'Technicienne'
      };
      return femaleVersions[baseRole] || baseRole;
    }
    return baseRole;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!member) return null;

  // Données pour les charts cotisations
  const cotisationPieData = [
    { name: 'Payé', value: stats?.cotisationsPaye || 0, color: '#10b981' },
    { name: 'Non payé', value: stats?.cotisationsNonPaye || 0, color: '#ef4444' },
  ];

  // Données pour les charts présences
  const presencePieData = [
    { name: 'Présent', value: stats?.totalPresent || 0, color: '#10b981' },
    { name: 'Absent', value: stats?.totalAbsent || 0, color: '#ef4444' },
    { name: 'Retard', value: stats?.totalRetard || 0, color: '#f59e0b' },
  ];

  const chartData = stats?.cotisationsChart?.map(c => ({
    mois: c.mois.split('-')[1] + '/' + c.mois.split('-')[0].slice(2),
    montant: c.statut === 'paye' ? c.montant : 0,
  })).reverse() || [];

  // Style selon le genre
  const genderStyle = member.gender === 'femme' 
    ? { ring: 'ring-pink-500/50', bg: 'bg-pink-500/10', text: 'text-pink-400' }
    : { ring: 'ring-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400' };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <button
          onClick={() => navigate('/members')}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Retour aux membres</span>
        </button>

        {editing ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <MemberForm 
              member={member} 
              onSubmit={handleUpdate} 
              onClose={() => setEditing(false)} 
            />
          </div>
        ) : (
          <>
            {/* Profil principal */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Photo */}
                <div className="relative group shrink-0 mx-auto md:mx-0">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.firstName}
                      className={`w-32 h-32 rounded-full object-cover ring-4 ${genderStyle.ring}`}
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-full ${genderStyle.bg} ring-4 ${genderStyle.ring} flex items-center justify-center`}>
                      <User className={`w-12 h-12 ${genderStyle.text}`} />
                    </div>
                  )}
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>

                  <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-neutral-900 ${
                    member.status === 'actif' ? 'bg-emerald-500' :
                    member.status === 'en_pause' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        {member.firstName} {member.lastName}
                      </h1>
                      <p className={`font-medium mb-4 ${genderStyle.text}`}>
                        {getRoleLabel()} {member.instrument && `• ${member.instrument}`}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Modifier
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </a>
                    )}
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                    {member.residence && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <MapPin className="w-4 h-4" />
                        <span>{member.residence}</span>
                      </div>
                    )}
                    {member.dateOfBirth && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Cake className="w-4 h-4" />
                        <span>{formatDate(member.dateOfBirth)} ({member.age} ans)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      member.status === 'actif' ? 'bg-emerald-500/20 text-emerald-400' :
                      member.status === 'en_pause' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {member.status === 'actif' ? 'Actif' : member.status === 'en_pause' ? 'En pause' : 'Inactif'}
                    </span>
                    {member.dateEntree && (
                      <span className="px-3 py-1 rounded-full text-sm bg-neutral-800 text-neutral-400">
                        Membre depuis {formatDate(member.dateEntree)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - 2 lignes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Anniversaire */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Gift className="w-5 h-5 text-pink-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats?.joursAvantAnniversaire !== null ? stats.joursAvantAnniversaire : '-'}
                </p>
                <p className="text-sm text-neutral-500">
                  {stats?.joursAvantAnniversaire === 0 ? "C'est aujourd'hui ! 🎉" : 
                   stats?.joursAvantAnniversaire === 1 ? "jour avant anniv" : "jours avant anniv"}
                </p>
              </div>

              {/* Taux de présence */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-indigo-400">{stats?.tauxPresence || 0}%</p>
                <p className="text-sm text-neutral-500">taux de présence</p>
              </div>

              {/* Présences */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{stats?.totalPresent || 0}</p>
                <p className="text-sm text-neutral-500">présences</p>
              </div>

              {/* Absences */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <UserX className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-400">{stats?.totalAbsent || 0}</p>
                <p className="text-sm text-neutral-500">absences</p>
              </div>
            </div>

            {/* Stats cotisations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Retards */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-400">{stats?.totalRetard || 0}</p>
                <p className="text-sm text-neutral-500">retards</p>
              </div>

              {/* Cotisations payées */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{stats?.cotisationsPaye || 0}</p>
                <p className="text-sm text-neutral-500">cotisations payées</p>
              </div>

              {/* Cotisations non payées */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-red-400">{stats?.cotisationsNonPaye || 0}</p>
                <p className="text-sm text-neutral-500">impayées</p>
              </div>

              {/* Total répétitions */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    <Music className="w-5 h-5 text-violet-400" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stats?.totalPresences || 0}</p>
                <p className="text-sm text-neutral-500">répétitions</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pie Chart Présences */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Répartition présences</h3>
                {(stats?.totalPresences || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={presencePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {presencePieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                      />
                      <Legend 
                        formatter={(value) => <span className="text-neutral-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-neutral-500">
                    Aucune donnée
                  </div>
                )}
              </div>

              {/* Pie Chart Cotisations */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Répartition cotisations</h3>
                {(stats?.totalCotisations || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={cotisationPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {cotisationPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                      />
                      <Legend 
                        formatter={(value) => <span className="text-neutral-300">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-neutral-500">
                    Aucune donnée
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart cotisations */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cotisations - 6 derniers mois</h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="mois" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #333', borderRadius: '8px' }}
                      formatter={(value) => [`${value.toLocaleString()} Ar`, 'Payé']}
                    />
                    <Bar dataKey="montant" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-neutral-500">
                  Aucune donnée
                </div>
              )}
            </div>

            {/* Tabs Historiques */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
              <div className="flex border-b border-neutral-800">
                <button
                  onClick={() => setActiveTab('cotisations')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'cotisations' 
                      ? 'text-indigo-400 border-b-2 border-indigo-400 bg-neutral-800/50' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Historique cotisations
                </button>
                <button
                  onClick={() => setActiveTab('presences')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'presences' 
                      ? 'text-indigo-400 border-b-2 border-indigo-400 bg-neutral-800/50' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Historique présences
                </button>
              </div>
              
              {activeTab === 'cotisations' ? (
                cotisations.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    Aucune cotisation enregistrée
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Mois</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Montant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Statut</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Date paiement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {cotisations.map((c) => (
                          <tr key={c._id} className="hover:bg-neutral-800/30">
                            <td className="px-6 py-4 text-white font-medium">{c.mois}</td>
                            <td className="px-6 py-4 text-neutral-300">{c.montant?.toLocaleString()} Ar</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                c.statut === 'paye' 
                                  ? 'bg-emerald-500/20 text-emerald-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {c.statut === 'paye' ? 'Payé' : 'Non payé'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-neutral-400">
                              {c.paidAt ? new Date(c.paidAt).toLocaleDateString('fr-FR') : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                presenceHistory.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500">
                    Aucune présence enregistrée
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800">
                        {presenceHistory.map((p) => (
                          <tr key={p._id} className="hover:bg-neutral-800/30">
                            <td className="px-6 py-4 text-white font-medium">
                              {new Date(p.repetition?.date || p.date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-neutral-300 capitalize">
                              {p.repetition?.type || 'Répétition'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                p.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                                p.status === 'retard' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {p.status === 'present' ? 'Présent' : 
                                 p.status === 'retard' ? 'Retard' : 'Absent'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>

            {/* Notes */}
            {member.notesAccompagnement && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Notes</h3>
                <p className="text-neutral-400">{member.notesAccompagnement}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;
