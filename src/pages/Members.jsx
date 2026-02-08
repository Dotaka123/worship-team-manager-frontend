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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-2xl font-bold text-gray-700">⏳ Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            Gestion des membres
          </h1>
          <p className="text-xl text-gray-700 font-semibold">
            {members.length} membre{members.length > 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Filtres et actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            <Plus className="w-6 h-6" />
            Nouveau membre
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold text-lg bg-white shadow-md"
          >
            <option value="all">📋 Tous les statuts</option>
            <option value="actif">✅ Actifs uniquement</option>
            <option value="en_pause">⏸️ En pause</option>
            <option value="inactif">❌ Inactifs</option>
          </select>
        </div>

        {/* Liste des membres */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300">
            <Users className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-700 text-2xl font-bold">Aucun membre trouvé</p>
            <p className="text-gray-600 text-lg mt-2">Ajoutez votre premier membre pour commencer</p>
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
