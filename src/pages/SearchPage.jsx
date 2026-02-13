import { useNavigate } from 'react-router-dom';
import AdvancedMemberSearch from '../components/AdvancedMemberSearch';
import { UserSearch } from 'lucide-react';

const SearchPage = () => {
  const navigate = useNavigate();

  const handleSelectMember = (member) => {
    navigate(`/members/${member._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <UserSearch className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Recherche Avancée</h1>
          </div>
          <p className="text-gray-600">
            Trouvez des membres avec des filtres puissants et visualisez leurs statistiques
          </p>
        </div>

        {/* Composant de recherche */}
        <AdvancedMemberSearch onSelectMember={handleSelectMember} />

        {/* Conseils d'utilisation */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils d'utilisation</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Tapez au moins 2 caractères pour lancer la recherche</li>
            <li>• Utilisez les filtres pour affiner vos résultats</li>
            <li>• Activez les statistiques pour voir les taux de paiement et de présence</li>
            <li>• Cliquez sur un membre pour voir sa fiche complète</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
