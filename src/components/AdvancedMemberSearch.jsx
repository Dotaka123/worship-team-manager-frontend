import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import api from '../services/api';

const AdvancedMemberSearch = ({ onSelectMember, compact = false }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    gender: '',
    instrument: '',
    minAge: '',
    maxAge: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableFilters, setAvailableFilters] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showStats, setShowStats] = useState(true);

  // Charger les filtres disponibles
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const { data } = await api.get('/members/search/filters');
        setAvailableFilters(data);
      } catch (error) {
        console.error('Erreur chargement filtres:', error);
      }
    };
    fetchFilters();
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || Object.values(filters).some(v => v)) {
        handleSearch();
      } else if (searchQuery.length === 0) {
        setResults([]);
        setPagination(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters, currentPage, showStats]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(searchQuery && { q: searchQuery }),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)),
        page: currentPage,
        limit: 20
      });

      const endpoint = showStats 
        ? `/members/search-with-stats?${params}`
        : `/members/search?${params}`;

      const { data } = await api.get(endpoint);
      
      setResults(data.members || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      gender: '',
      instrument: '',
      minAge: '',
      maxAge: ''
    });
    setSearchQuery('');
    setResults([]);
    setPagination(null);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  if (compact) {
    // Version compacte pour autocomplete
    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un membre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        {results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {results.map(member => (
              <button
                key={member._id}
                onClick={() => onSelectMember(member)}
                className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
              >
                {member.photo ? (
                  <img src={member.photo} alt={member.pseudo} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.pseudo} • {member.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Version complète
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Barre de recherche */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom, pseudo, email..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter size={20} />
          <span>Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount}
            </span>
          )}
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {(searchQuery || activeFiltersCount > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
            <span>Effacer</span>
          </button>
        )}
      </div>

      {/* Panneau de filtres */}
      {showFilters && availableFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              {availableFilters.roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              {availableFilters.statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'actif' ? 'Actif' : status === 'en_pause' ? 'En pause' : 'Inactif'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instrument</label>
            <select
              value={filters.instrument}
              onChange={(e) => handleFilterChange('instrument', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              {availableFilters.instruments.map(instrument => (
                <option key={instrument} value={instrument}>{instrument}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Âge min</label>
            <input
              type="number"
              value={filters.minAge}
              onChange={(e) => handleFilterChange('minAge', e.target.value)}
              placeholder="18"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Âge max</label>
            <input
              type="number"
              value={filters.maxAge}
              onChange={(e) => handleFilterChange('maxAge', e.target.value)}
              placeholder="65"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Toggle stats */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="checkbox"
          id="showStats"
          checked={showStats}
          onChange={(e) => setShowStats(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="showStats" className="text-sm text-gray-700">
          Afficher les statistiques
        </label>
      </div>

      {/* Résultats */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="mb-4 text-sm text-gray-600">
            {pagination?.total} résultat{pagination?.total > 1 ? 's' : ''} trouvé{pagination?.total > 1 ? 's' : ''}
          </div>

          <div className="grid gap-4">
            {results.map(member => (
              <div
                key={member._id}
                onClick={() => onSelectMember?.(member)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {member.photo ? (
                    <img src={member.photo} alt={member.pseudo} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-xl">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </span>
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {member.firstName} {member.lastName}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        member.status === 'actif' ? 'bg-green-100 text-green-800' :
                        member.status === 'en_pause' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status === 'actif' ? 'Actif' : member.status === 'en_pause' ? 'En pause' : 'Inactif'}
                      </span>
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      {member.pseudo} • {member.role}
                      {member.instrument && ` • ${member.instrument}`}
                      {member.age && ` • ${member.age} ans`}
                    </div>

                    {showStats && member.stats && (
                      <div className="mt-3 flex gap-4">
                        <div className="text-sm">
                          <span className="text-gray-600">Cotisations: </span>
                          <span className="font-medium text-indigo-600">
                            {member.stats.cotisations.tauxPaiement}%
                          </span>
                          <span className="text-gray-500 text-xs ml-1">
                            ({member.stats.cotisations.paye}/{member.stats.cotisations.total})
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Présence: </span>
                          <span className="font-medium text-green-600">
                            {member.stats.attendance.tauxPresence}%
                          </span>
                          <span className="text-gray-500 text-xs ml-1">
                            ({member.stats.attendance.present}/{member.stats.attendance.total})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {pagination.pages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.pages, p + 1))}
                disabled={currentPage === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      ) : searchQuery || activeFiltersCount > 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun résultat trouvé
        </div>
      ) : null}
    </div>
  );
};

export default AdvancedMemberSearch;
