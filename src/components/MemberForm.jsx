import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MemberForm = ({ member, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Chanteur/Chanteuse',
    instrument: '',
    groupe: '',
    status: 'actif',
    dateEntree: new Date().toISOString().split('T')[0],
    notesAccompagnement: ''
  });

  useEffect(() => {
    if (member) {
      setFormData({
        ...member,
        dateEntree: new Date(member.dateEntree).toISOString().split('T')[0]
      });
    }
  }, [member]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">
            {member ? 'Modifier le membre' : 'Nouveau membre'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Identité */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Identité
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Jean"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Dupont"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Contact
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="jean.dupont@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rôle et compétences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Rôle et compétences
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rôle principal *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Chanteur/Chanteuse">Chanteur/Chanteuse</option>
                  <option value="Chef de louange">Chef de louange</option>
                  <option value="Musicien">Musicien</option>
                  <option value="Technicien son">Technicien son</option>
                  <option value="Technicien lumière">Technicien lumière</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrument / Spécialité
                </label>
                <select
                  name="instrument"
                  value={formData.instrument}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Sélectionner --</option>
                  <optgroup label="Chant">
                    <option value="Chant lead">Chant lead</option>
                    <option value="1ère voix">1ère voix</option>
                    <option value="2ème voix">2ème voix</option>
                    <option value="3ème voix">3ème voix</option>
                    <option value="Chorale">Chorale</option>
                  </optgroup>
                  <optgroup label="Guitares">
                    <option value="Guitare acoustique">Guitare acoustique</option>
                    <option value="Guitare électrique">Guitare électrique</option>
                    <option value="Basse">Basse</option>
                  </optgroup>
                  <optgroup label="Claviers">
                    <option value="Clavier/Piano">Clavier/Piano</option>
                    <option value="Synthé">Synthé</option>
                  </optgroup>
                  <optgroup label="Percussions">
                    <option value="Batterie">Batterie</option>
                    <option value="Djembé">Djembé</option>
                    <option value="Percussions">Percussions</option>
                  </optgroup>
                  <optgroup label="Cuivres">
                    <option value="Saxophone">Saxophone</option>
                    <option value="Trompette">Trompette</option>
                    <option value="Trombone">Trombone</option>
                  </optgroup>
                  <optgroup label="Cordes">
                    <option value="Violon">Violon</option>
                  </optgroup>
                  <optgroup label="Technique">
                    <option value="Sono">Sono</option>
                    <option value="Lumières">Lumières</option>
                  </optgroup>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Groupe / Équipe
              </label>
              <select
                name="groupe"
                value={formData.groupe}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Louange principale">Louange principale</option>
                <option value="Louange jeunes">Louange jeunes</option>
                <option value="Chorale">Chorale</option>
                <option value="Orchestre">Orchestre</option>
                <option value="Équipe technique">Équipe technique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Statut et date */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Statut
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="actif">✅ Actif</option>
                  <option value="en_pause">⏸️ En pause</option>
                  <option value="inactif">❌ Inactif</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'entrée
                </label>
                <input
                  type="date"
                  name="dateEntree"
                  value={formData.dateEntree}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes d'accompagnement */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              Notes d'accompagnement
            </h3>
            
            <div>
              <textarea
                name="notesAccompagnement"
                value={formData.notesAccompagnement}
                onChange={handleChange}
                rows="4"
                maxLength="500"
                placeholder="Informations pastorales, besoins particuliers, points de prière, disponibilités..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.notesAccompagnement.length}/500 caractères
              </p>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-medium transition-colors"
            >
              {member ? '✅ Mettre à jour' : '➕ Créer le membre'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
