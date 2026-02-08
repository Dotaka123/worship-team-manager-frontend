import { useState } from 'react';

const MemberForm = ({ member, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || 'chanteur',
    instrument: member?.instrument || '',
    group: member?.group || '',
    phone: member?.phone || '',
    email: member?.email || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Nom *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Rôle */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Rôle *
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="chanteur">Chanteur</option>
          <option value="musicien">Musicien</option>
          <option value="technicien">Technicien</option>
        </select>
      </div>

      {/* Instrument */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Instrument / Spécialité
        </label>
        <input
          type="text"
          name="instrument"
          value={formData.instrument}
          onChange={handleChange}
          placeholder="Ex: Guitare, Piano, Son..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Groupe */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Groupe / Équipe
        </label>
        <input
          type="text"
          name="group"
          value={formData.group}
          onChange={handleChange}
          placeholder="Ex: Équipe A, Dimanche matin..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Téléphone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition"
        >
          {member ? 'Modifier' : 'Ajouter'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
};

export default MemberForm;
