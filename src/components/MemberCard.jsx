import { Mail, Phone, Music, Users } from 'lucide-react';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const statusStyles = {
    actif: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
    inactif: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white',
    en_pause: 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
  };

  const statusLabels = {
    actif: '✅ Actif',
    inactif: '❌ Inactif',
    en_pause: '⏸️ En pause'
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl hover:shadow-blue-500/50 transition-all p-6 border-2 border-slate-700 hover:border-blue-500">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {member.firstName} {member.lastName}
          </h3>
          <span className={`inline-block px-4 py-2 rounded-lg text-sm font-bold shadow-lg ${statusStyles[member.status]}`}>
            {statusLabels[member.status]}
          </span>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-3 mb-4 bg-slate-900/50 rounded-lg p-4">
        {member.role && (
          <div className="flex items-center text-blue-300">
            <Users className="w-5 h-5 mr-3 text-blue-400" />
            <span className="text-base font-bold">{member.role}</span>
          </div>
        )}
        
        {member.instrument && (
          <div className="flex items-center text-purple-300">
            <Music className="w-5 h-5 mr-3 text-purple-400" />
            <span className="text-base font-bold">{member.instrument}</span>
          </div>
        )}

        {member.email && (
          <div className="flex items-center text-cyan-300">
            <Mail className="w-5 h-5 mr-3 text-cyan-400" />
            <a href={`mailto:${member.email}`} className="text-sm hover:text-cyan-100 font-semibold hover:underline">
              {member.email}
            </a>
          </div>
        )}

        {member.phone && (
          <div className="flex items-center text-green-300">
            <Phone className="w-5 h-5 mr-3 text-green-400" />
            <a href={`tel:${member.phone}`} className="text-sm hover:text-green-100 font-semibold hover:underline">
              {member.phone}
            </a>
          </div>
        )}
      </div>

      {/* Groupe */}
      {member.groupe && (
        <div className="mb-4">
          <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
            🎵 {member.groupe}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t-2 border-slate-700">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg hover:from-blue-500 hover:to-blue-600 active:scale-95 transition-all text-base font-bold shadow-lg"
        >
          ✏️ Modifier
        </button>
        <button
          onClick={() => onDelete(member._id)}
          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-lg hover:from-red-500 hover:to-red-600 active:scale-95 transition-all text-base font-bold shadow-lg"
        >
          🗑️ Supprimer
        </button>
      </div>
    </div>
  );
};

export default MemberCard;
