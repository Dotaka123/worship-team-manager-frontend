import { Mail, Phone, Music, Users } from 'lucide-react';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const statusColors = {
    actif: 'bg-green-100 text-green-800',
    inactif: 'bg-gray-100 text-gray-800',
    en_pause: 'bg-yellow-100 text-yellow-800'
  };

  const statusLabels = {
    actif: '✅ Actif',
    inactif: '❌ Inactif',
    en_pause: '⏸️ En pause'
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${statusColors[member.status]}`}>
            {statusLabels[member.status]}
          </span>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-2 mb-4">
        {member.role && (
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{member.role}</span>
          </div>
        )}
        
        {member.instrument && (
          <div className="flex items-center text-gray-600">
            <Music className="w-4 h-4 mr-2" />
            <span className="text-sm">{member.instrument}</span>
          </div>
        )}

        {member.email && (
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <a href={`mailto:${member.email}`} className="text-sm hover:text-blue-600">
              {member.email}
            </a>
          </div>
        )}

        {member.phone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <a href={`tel:${member.phone}`} className="text-sm hover:text-blue-600">
              {member.phone}
            </a>
          </div>
        )}
      </div>

      {/* Groupe */}
      {member.groupe && (
        <div className="mb-4">
          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
            {member.groupe}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={() => onDelete(member._id)}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors text-sm font-medium"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
