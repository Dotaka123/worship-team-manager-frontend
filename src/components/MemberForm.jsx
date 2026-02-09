import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Music, Mic2, Users, Calendar, FileText, Check } from 'lucide-react';

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

  // Couleur d'accent unique : indigo
  const inputBase = "w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-md text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors";
  const labelBase = "flex items-center gap-2 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 bg-neutral-950/90 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        
        {/* En-tête */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-neutral-800 sticky top-0 bg-neutral-900">
          <h2 className="text-base font-semibold text-neutral-100 tracking-tight">
            {member ? 'Modifier le membre' : 'Nouveau membre'}
          </h2>
          <button 
            onClick={onClose} 
            className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md p-1.5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section Identité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                <User className="w-3.5 h-3.5" />
                Prénom
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={inputBase}
                placeholder="Jean"
              />
            </div>
            
            <div>
              <label className={labelBase}>
                <User className="w-3.5 h-3.5" />
                Nom
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={inputBase}
                placeholder="Dupont"
              />
            </div>
          </div>

          {/* Section Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                <Mail className="w-3.5 h-3.5" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputBase}
                placeholder="jean@email.com"
              />
            </div>
            
            <div>
              <label className={labelBase}>
                <Phone className="w-3.5 h-3.5" />
                Téléphone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={inputBase}
                placeholder="06 12 34 56 78"
              />
            </div>
          </div>

          {/* Section Rôle et instrument */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                <Mic2 className="w-3.5 h-3.5" />
                Rôle
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Chanteur, Chef d'orchestre..."
                className={inputBase}
              />
            </div>
            
            <div>
              <label className={labelBase}>
                <Music className="w-3.5 h-3.5" />
                Instrument
              </label>
              <input
                type="text"
                name="instrument"
                value={formData.instrument}
                onChange={handleChange}
                placeholder="Guitare, Piano..."
                className={inputBase}
              />
            </div>
          </div>

          {/* Section Groupe et statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelBase}>
                <Users className="w-3.5 h-3.5" />
                Groupe
              </label>
              <input
                type="text"
                name="groupe"
                value={formData.groupe}
                onChange={handleChange}
                placeholder="Louange principale..."
                className={inputBase}
              />
            </div>
            
            <div>
              <label className={labelBase}>
                <Check className="w-3.5 h-3.5" />
                Statut
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={`${inputBase} appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23737373%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10`}
              >
                <option value="actif">Actif</option>
                <option value="en_pause">En pause</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
          </div>

          {/* Date d'entrée */}
          <div>
            <label className={labelBase}>
              <Calendar className="w-3.5 h-3.5" />
              Date d'entrée
            </label>
            <input
              type="date"
              name="dateEntree"
              value={formData.dateEntree}
              onChange={handleChange}
              className={inputBase}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelBase}>
              <FileText className="w-3.5 h-3.5" />
              Notes d'accompagnement
            </label>
            <textarea
              name="notesAccompagnement"
              value={formData.notesAccompagnement}
              onChange={handleChange}
              rows="3"
              maxLength="500"
              placeholder="Informations pastorales ou administratives..."
              className={`${inputBase} resize-none`}
            />
            <p className="text-xs text-neutral-500 mt-2 text-right">
              {formData.notesAccompagnement.length} / 500
            </p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-md hover:text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              {member ? 'Enregistrer les modifications' : 'Créer le membre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
