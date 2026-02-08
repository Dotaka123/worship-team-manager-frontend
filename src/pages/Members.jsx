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
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-8 h-8" />
          Gestion des membres
        </h1>
        <p className="text-gray-600">
          {members.length} membre{members.length > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filtres et actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Nouveau membre
        </button>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">✅ Actifs</option>
          <option value="en_pause">⏸️ En pause</option>
          <option value="inactif">❌ Inactifs</option>
        </select>
      </div>

      {/* Liste des membres */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">Aucun membre trouvé</p>
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
  );
};

export default Members;
