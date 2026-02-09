import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Search, Loader2 } from 'lucide-react';
import api from '../services/api';
import MemberCard from '../components/MemberCard';
import MemberForm from '../components/MemberForm';

const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleEdit = (member, e) => {
    e.stopPropagation();
    setSelectedMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return;
    
    try {
      await api.delete(`/members/${id}`);
      fetchMembers();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleClick = (member) => {
    navigate(`/members/${member._id}`);
  };

  const filteredMembers = members.filter(member => {
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesSearch = (
      member.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesStatus && matchesSearch;
  });

  const statusCount = {
    all: members.length,
    actif: members.filter(m => m.status === 'actif').length,
    en_pause: members.filter(m => m.status === 'en_pause').length,
    inactif: members.filter(m => m.status === 'inactif').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Chargement des membres...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600/10 rounded-md">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-semibold text-neutral-100 tracking-tight">
              Gestion des membres
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            {members.length} membre{members.length > 1 ? 's' : ''} dans l'équipe de louange
          </p>
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'Tous', count: statusCount.all },
              { key: 'actif', label: 'Actifs', count: statusCount.actif },
              { key: 'en_pause', label: 'En pause', count: statusCount.en_pause },
              { key: 'inactif', label: 'Inactifs', count: statusCount.inactif },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  filterStatus === key
                    ? 'bg-neutral-800 text-neutral-200 border border-neutral-700'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
                }`}
              >
                {label}
                <span className="ml-2 text-xs text-neutral-500">({count})</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 active:bg-indigo-800 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau membre</span>
          </button>
        </div>

        {/* Liste des membres */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-lg">
            <Users className="w-10 h-10 mx-auto text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-400 mb-1">
              {searchQuery ? 'Aucun membre ne correspond' : 'Aucun membre'}
            </p>
            <p className="text-sm text-neutral-500">
              {searchQuery ? 'Modifiez votre recherche' : 'Ajoutez votre premier membre'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map(member => (
              <MemberCard
                key={member._id}
                member={member}
                onClick={() => handleClick(member)}
                onEdit={(e) => handleEdit(member, e)}
                onDelete={(e) => handleDelete(member._id, e)}
              />
            ))}
          </div>
        )}

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
