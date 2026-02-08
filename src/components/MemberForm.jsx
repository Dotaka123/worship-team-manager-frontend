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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-700">
        {/* En-tête */}
        <div className="flex justify-between items-center p-6 border-b-2 border-slate-700 sticky top-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <h2 className="text-3xl font-black text-white">
            {member ? '✏️ Modifier le membre' : '➕ Nouveau membre'}
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Identité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-black text-blue-300 mb-2">
                👤 Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white font-bold placeholder-slate-400"
                placeholder="Jean"
              />
            </div>
            
            <div>
              <label className="block text-base font-black text-blue-300 mb-2">
                👤 Nom *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white font-bold placeholder-slate-400"
                placeholder="Dupont"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-black text-cyan-300 mb-2">
                📧 Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white font-bold placeholder-slate-400"
                placeholder="jean@example.com"
              />
            </div>
            
            <div>
              <label className="block text-base font-black text-green-300 mb-2">
                📱 Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-white font-bold placeholder-slate-400"
                placeholder="0612345678"
              />
            </div>
          </div>

          {/* Rôle et instrument */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-black text-purple-300 mb-2">
                🎭 Rôle
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Chanteur, Musicien..."
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white font-bold placeholder-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-base font-black text-pink-300 mb-2">
                🎸 Instrument
              </label>
              <input
                type="text"
                name="instrument"
                value={formData.instrument}
                onChange={handleChange}
                placeholder="Guitare, Piano..."
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-white font-bold placeholder-slate-400"
              />
            </div>
          </div>

          {/* Groupe et statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-black text-indigo-300 mb-2">
                🎵 Groupe
              </label>
              <input
                type="text"
                name="groupe"
                value={formData.groupe}
                onChange={handleChange}
                placeholder="Louange principale..."
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white font-bold placeholder-slate-400"
              />
            </div>
            
            <div>
              <label className="block text-base font-black text-yellow-300 mb-2">
                📊 Statut *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white font-black"
              >
                <option value="actif">✅ Actif</option>
                <option value="en_pause">⏸️ En pause</option>
                <option value="inactif">❌ Inactif</option>
              </select>
            </div>
          </div>

          {/* Date d'entrée */}
          <div>
            <label className="block text-base font-black text-orange-300 mb-2">
              📅 Date d'entrée
            </label>
            <input
              type="date"
              name="dateEntree"
              value={formData.dateEntree}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white font-bold"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-base font-black text-teal-300 mb-2">
              📝 Notes
            </label>
            <textarea
              name="notesAccompagnement"
              value={formData.notesAccompagnement}
              onChange={handleChange}
              rows="3"
              maxLength="500"
              placeholder="Informations pastorales..."
              className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white font-bold placeholder-slate-400"
            />
            <p className="text-sm text-slate-400 mt-2 font-semibold">
              {formData.notesAccompagnement.length} / 500 caractères
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-6 border-t-2 border-slate-700">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl hover:from-green-500 hover:via-emerald-500 hover:to-teal-500 font-black text-xl transition-all shadow-2xl hover:shadow-green-500/50 active:scale-95"
            >
              {member ? '✅ Mettre à jour' : '➕ Créer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 border-2 border-slate-600 rounded-xl font-black text-white text-xl transition-all active:scale-95"
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
