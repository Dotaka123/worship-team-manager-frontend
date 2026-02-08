import { Mail, Phone, Music, Users } from 'lucide-react';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const statusColors = {
    actif: 'bg-green-500 text-white',
    inactif: 'bg-gray-500 text-white',
    en_pause: 'bg-orange-500 text-white'
  };

  const statusLabels = {
    actif: '✅ Actif',
    inactif: '❌ Inactif',
    en_pause: '⏸️ En pause'
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {member.firstName} {member.lastName}
          </h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-2 ${statusColors[member.status]}`}>
            {statusLabels[member.status]}
          </span>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-3 mb-4">
        {member.role && (
          <div className="flex items-center text-gray-700">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-sm font-semibold">{member.role}</span>
          </div>
        )}
        
        {member.instrument && (
          <div className="flex items-center text-gray-700">
            <Music className="w-5 h-5 mr-2 text-purple-600" />
            <span className="text-sm font-medium">{member.instrument}</span>
          </div>
        )}

        {member.email && (
          <div className="flex items-center text-gray-700">
            <Mail className="w-5 h-5 mr-2 text-red-600" />
            <a href={`mailto:${member.email}`} className="text-sm hover:text-blue-600 font-medium hover:underline">
              {member.email}
            </a>
          </div>
        )}

        {member.phone && (
          <div className="flex items-center text-gray-700">
            <Phone className="w-5 h-5 mr-2 text-green-600" />
            <a href={`tel:${member.phone}`} className="text-sm hover:text-blue-600 font-medium hover:underline">
              {member.phone}
            </a>
          </div>
        )}
      </div>

      {/* Groupe */}
      {member.groupe && (
        <div className="mb-4">
          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            🎵 {member.groupe}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm font-bold shadow-sm"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={() => onDelete(member._id)}
          className="flex-1 bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm font-bold shadow-sm"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
