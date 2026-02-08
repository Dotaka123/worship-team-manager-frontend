import { useState } from 'react';
import { Pencil, Trash2, Phone, Mail, Calendar } from 'lucide-react';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const [showNotes, setShowNotes] = useState(false);

  const statusColors = {
    actif: 'bg-green-100 text-green-800',
    inactif: 'bg-gray-100 text-gray-800',
    en_pause: 'bg-yellow-100 text-yellow-800'
  };

  const statusLabels = {
    actif: 'Actif',
    inactif: 'Inactif',
    en_pause: 'En pause'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* En-tête avec nom et statut */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {member.firstName} {member.lastName}
          </h3>
          <p className="text-gray-600 mt-1">{member.instrument}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[member.status]}`}>
          {statusLabels[member.status]}
        </span>
      </div>

      {/* Informations de contact */}
      <div className="space-y-2 mb-4">
        {member.email && (
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <a href={`mailto:${member.email}`} className="hover:text-blue-600">
              {member.email}
            </a>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <a href={`tel:${member.phone}`} className="hover:text-blue-600">
              {member.phone}
            </a>
          </div>
        )}
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Membre depuis {formatDate(member.dateEntree)}</span>
        </div>
      </div>

      {/* Notes d'accompagnement */}
      {member.notesAccompagnement && (
        <div className="mb-4">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showNotes ? 'Masquer' : 'Voir'} les notes d'accompagnement
          </button>
          {showNotes && (
            <p className="mt-2 text-gray-700 bg-blue-50 p-3 rounded">
              {member.notesAccompagnement}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={() => onEdit(member)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Modifier
        </button>
        <button
          onClick={() => {
            if (window.confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
              onDelete(member._id);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
