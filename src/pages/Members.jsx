import { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';
import MemberCard from '../components/MemberCard';
import MemberForm from '../components/MemberForm';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ role: '', active: 'true' });

  const fetchMembers = async () => {
    try {
      const params = {};
      if (filter.role) params.role = filter.role;
      if (filter.active) params.active = filter.active;
      
      const { data } = await membersAPI.getAll(params);
      setMembers(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [filter]);

  const handleCreate = async (formData) => {
    try {
      await membersAPI.create(formData);
      setShowForm(false);
      fetchMembers();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Membres</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition"
        >
          + Ajouter un membre
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter.role}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <option value="">Tous les rôles</option>
          <option value="chanteur">Chanteurs</option>
          <option value="musicien">Musiciens</option>
          <option value="technicien">Techniciens</option>
        </select>
        <select
          value={filter.active}
          onChange={(e) => setFilter({ ...filter, active: e.target.value })}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg"
        >
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
          <option value="">Tous</option>
        </select>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Nouveau membre</h2>
            <MemberForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p className="text-gray-400">Chargement...</p>
      ) : members.length === 0 ? (
        <p className="text-gray-400">Aucun membre trouvé</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member._id} member={member} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Members;
