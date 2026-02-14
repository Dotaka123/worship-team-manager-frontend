import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Users, Loader2, Filter, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import MemberCard from '../components/MemberCard';
import MemberForm from '../components/MemberForm';

const Members = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filtres avancés
  const [genderFilter, setGenderFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');

  useEffect(() => {
    fetchMembers();
    
    // Vérifier si on vient du Dashboard avec un filtre
    if (location.state?.filterRole) {
      setRoleFilter(location.state.filterRole);
      setShowAdvancedFilters(true);
    }
  }, [location]);

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

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const filteredMembers = members.filter(member => {
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    
    // Filtre de genre
    const matchesGender = genderFilter === 'all' || member.gender === genderFilter;
    
    // Filtre de rôle
    const normalizeRole = (role) => role ? role.toLowerCase().replace('(euse)', '').trim() : '';
    const memberRole = normalizeRole(member.role);
    const matchesRole = roleFilter === 'all' || memberRole === roleFilter;
    
    // Filtre d'âge
    let matchesAge = true;
    if (ageFilter !== 'all') {
      const age = calculateAge(member.dateOfBirth);
      if (age === null) {
        matchesAge = false;
      } else if (ageFilter === 'young') {
        matchesAge = age < 25;
      } else if (ageFilter === 'adult') {
        matchesAge = age >= 25 && age < 50;
      } else if (ageFilter === 'senior') {
        matchesAge = age >= 50;
      }
    }
    
    return matchesStatus && matchesGender && matchesRole && matchesAge;
  });

  const clearAllFilters = () => {
    setFilterStatus('all');
    setGenderFilter('all');
    setRoleFilter('all');
    setAgeFilter('all');
  };

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
    <div className="min-h-screen bg-neutral-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-600/10 rounded-md">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-neutral-100 tracking-tight">
              Gestion des membres
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            {members.length} membre{members.length > 1 ? 's' : ''} dans l'équipe de louange
          </p>
        </div>

        {/* Barre d'outils - Responsive */}
        <div className="space-y-3 sm:space-y-4 mb-6">
          {/* Ligne 1: Boutons */}
          <div className="flex gap-2 sm:gap-4">
            {/* Bouton Toggle Filtres avancés */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 border rounded-md transition-all duration-200 ${
                showAdvancedFilters 
                  ? 'bg-indigo-600 text-white border-indigo-600' 
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-neutral-200'
              }`}
              aria-label="Toggle advanced filters"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>

            {/* Bouton Toggle Filtres (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden p-2 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-neutral-200 transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 active:bg-indigo-800 transition-colors shrink-0 ml-auto"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>

          {/* Filtres avancés (expandable) */}
          {showAdvancedFilters && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtres avancés
                </h3>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Réinitialiser
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Filtre Genre */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">Genre</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tous' },
                      { key: 'M', label: 'Homme' },
                      { key: 'F', label: 'Femme' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setGenderFilter(key)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                          genderFilter === key
                            ? 'bg-indigo-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtre Rôle */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">Poste</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tous' },
                      { key: 'chanteur', label: 'Chanteur' },
                      { key: 'musicien', label: 'Musicien' },
                      { key: 'technicien', label: 'Technicien' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setRoleFilter(key)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                          roleFilter === key
                            ? 'bg-indigo-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtre Âge */}
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">Tranche d'âge</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'all', label: 'Tous' },
                      { key: 'young', label: '<25' },
                      { key: 'adult', label: '25-50' },
                      { key: 'senior', label: '50+' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setAgeFilter(key)}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                          ageFilter === key
                            ? 'bg-indigo-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Résumé des filtres actifs */}
              {(genderFilter !== 'all' || roleFilter !== 'all' || ageFilter !== 'all') && (
                <div className="pt-3 border-t border-neutral-800">
                  <p className="text-xs text-neutral-500">
                    <span className="font-medium">{filteredMembers.length}</span> membre(s) correspondent aux critères
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Ligne 2: Filtres de statut */}
          <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex gap-2 flex-wrap`}>
            {[
              { key: 'all', label: 'Tous', count: statusCount.all },
              { key: 'actif', label: 'Actifs', count: statusCount.actif },
              { key: 'en_pause', label: 'En pause', count: statusCount.en_pause },
              { key: 'inactif', label: 'Inactifs', count: statusCount.inactif },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
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
        </div>

        {/* Liste des membres - Grid responsive */}
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-neutral-900/50 border border-dashed border-neutral-800 rounded-lg">
            <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-400 mb-1">
              Aucun membre ne correspond aux filtres
            </p>
            <p className="text-sm text-neutral-500">
              Modifiez vos filtres ou ajoutez un nouveau membre
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
