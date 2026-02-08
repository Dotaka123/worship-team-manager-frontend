import { useState, useEffect } from 'react';
import { Plus, Users, Filter } from 'lucide-react';
import api from '../services/api';
import MemberCard from '../components/members/MemberCard';
import MemberForm from '../components/members/MemberForm';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, filterStatus]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des membres:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    if (filterStatus === 'all') {
      setFilteredMembers(members);
    } else {
      setFilteredMembers(members.filter(m => m.status === filterStatus));
    }
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingMember) {
        await api.put(`/members/${editingMember._id}`, formData);
      } else {
        await api.post('/members', formData);
      }
      fetchMembers();
      setShowForm(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const stats = {
    total: members.length,
    actif: members.filter(m => m.status === 'actif').length,
    en_pause: members.filter(m => m.status === 'en_pause').length,
    inactif: members.filter(m => m.status === 'inactif').length
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membres de l'équipe</h1>
          <p className="text-gray-600 mt-1">
            Gérez les musiciens et chanteurs de votre église
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMember(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nouveau membre
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-200">
          <p className="text-2xl font-bold text-green-800">{stats.actif}</p>
          <p className="text-sm text-green-600">Actifs</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-800">{stats.en_pause}</p>
          <p className="text-sm text-yellow-600">En pause</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-gray-800">{stats.inactif}</p>
          <p className="text-sm text-gray-600">Inactifs</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-5 h-5 text-gray-600" />
        <div className="flex gap-2">
          {['all', 'actif', 'en_pause', 'inactif'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'Tous'}
              {status === 'actif' && 'Actifs'}
              {status === 'en_pause' && 'En pause'}
              {status === 'inactif' && 'Inactifs'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des membres */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {filterStatus === 'all' 
              ? 'Aucun membre pour le moment'
              : `Aucun membre ${filterStatus}`
            }
          </p>
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

      {/* Modal formulaire */}
      {showForm && (
        <MemberForm
          member={editingMember}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
};

export default Members;
