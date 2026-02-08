import { useState, useEffect } from 'react';
import { Plus, Users } from 'lucide-react';
import api from '../services/api';
import MemberCard from '../components/MemberCard';
import MemberForm from '../components/MemberForm';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du chargement des membres');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (selectedMember) {
        await api.put(`/members/${selectedMember._id}`, formData);
      } else {
        await api.post('/members', formData);
      }
      fetchMembers();
      setShowForm(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredMembers = members.filter(m => 
    filterStatus === 'all' || m.status === filterStatus
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-4xl font-black text-white animate-pulse">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 border-4 border-purple-500">
          <h1 className="text-5xl font-black text-white mb-3 flex items-center gap-4">
            <Users className="w-12 h-12" />
            Gestion des membres
          </h1>
          <p className="text-2xl text-white font-bold">
            🎵 {members.length} membre{members.length > 1 ? 's' : ''} dans l'équipe
          </p>
        </div>

        {/* Filtres et actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 transition-all flex items-center gap-3 font-black text-xl shadow-2xl hover:shadow-green-500/50 active:scale-95"
          >
            <Plus className="w-7 h-7" />
            Nouveau membre
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 bg-slate-800 border-2 border-purple-600 rounded-xl focus:ring-2 focus:ring-purple-500 text-white font-black text-lg shadow-xl"
          >
            <option value="all">📋 Tous</option>
            <option value="actif">✅ Actifs</option>
            <option value="en_pause">⏸️ En pause</option>
            <option value="inactif">❌ Inactifs</option>
          </select>
        </div>

        {/* Liste des membres */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border-4 border-dashed border-purple-600">
            <Users className="w-24 h-24 mx-auto text-purple-400 mb-6" />
            <p className="text-white text-3xl font-black mb-2">Aucun membre trouvé</p>
            <p className="text-purple-300 text-xl font-bold">Ajoutez votre premier membre !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map(member => (
              <MemberCard
                key={member._id}
                member={member}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Formulaire modal */}
        {showForm && (
          <MemberForm
            member={selectedMember}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setSelectedMember(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Members;
