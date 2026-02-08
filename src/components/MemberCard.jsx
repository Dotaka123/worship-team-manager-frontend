import { Link } from 'react-router-dom';

const roleLabels = {
  chanteur: { label: 'Chanteur', color: 'bg-purple-500' },
  musicien: { label: 'Musicien', color: 'bg-blue-500' },
  technicien: { label: 'Technicien', color: 'bg-green-500' }
};

const MemberCard = ({ member }) => {
  const roleInfo = roleLabels[member.role] || { label: member.role, color: 'bg-gray-500' };

  return (
    <Link
      to={`/members/${member._id}`}
      className={`block p-4 rounded-lg border transition hover:border-primary-500 ${
        member.isActive 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-800/50 border-gray-700/50 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-white">{member.name}</h3>
          {member.instrument && (
            <p className="text-sm text-gray-400">{member.instrument}</p>
          )}
          {member.group && (
            <p className="text-xs text-gray-500 mt-1">{member.group}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-2 py-1 text-xs rounded-full text-white ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
          {!member.isActive && (
            <span className="text-xs text-gray-500">Inactif</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MemberCard;
