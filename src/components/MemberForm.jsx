import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MemberForm = ({ member, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
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
        dateEntree: member.dateEntree ? new Date(member.dateEntree).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">
            {member ? '✏️ Modifier le membre' : '➕ Nouveau membre'}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Identité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                📧 Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                📱 Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Rôle et instrument */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                👤 Rôle
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Ex: Chanteur, Musicien..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                🎸 Instrument / Spécialité
              </label>
              <input
                type="text"
                name="instrument"
                value={formData.instrument}
                onChange={handleChange}
                placeholder="Ex: Guitare, 3ème voix..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
          </div>

          {/* Groupe et statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                🎵 Groupe / Équipe
              </label>
              <input
                type="text"
                name="groupe"
                value={formData.groupe}
                onChange={handleChange}
                placeholder="Ex: Louange principale..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                📊 Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-bold bg-white"
              >
                <option value="actif">✅ Actif</option>
                <option value="en_pause">⏸️ En pause</option>
                <option value="inactif">❌ Inactif</option>
              </select>
            </div>
          </div>

          {/* Date d'entrée */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              📅 Date d'entrée
            </label>
            <input
              type="date"
              name="dateEntree"
              value={formData.dateEntree}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              📝 Notes d'accompagnement
            </label>
            <textarea
              name="notesAccompagnement"
              value={formData.notesAccompagnement}
              onChange={handleChange}
              rows="3"
              maxLength="500"
              placeholder="Informations pastorales, besoins particuliers..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
            />
            <p className="text-xs text-gray-600 mt-1">
              {formData.notesAccompagnement.length} / 500 caractères
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 font-bold text-lg transition-all shadow-lg hover:shadow-xl"
            >
              {member ? '✅ Mettre à jour' : '➕ Créer le membre'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 border-2 border-gray-400 rounded-lg hover:bg-gray-100 font-bold text-gray-700 text-lg transition-all"
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
