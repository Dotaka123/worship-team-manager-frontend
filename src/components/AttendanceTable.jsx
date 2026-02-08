import { useState } from 'react';

const AttendanceTable = ({ members, attendance, onMark }) => {
  const [reasons, setReasons] = useState({});

  // Trouver le statut d'un membre
  const getStatus = (memberId) => {
    const record = attendance.find(a => a.member?._id === memberId || a.member === memberId);
    return record?.status || null;
  };

  const handleMark = (memberId, status) => {
    onMark({
      memberId,
      status,
      reason: status === 'absent' ? reasons[memberId] : null
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Membre</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Rôle</th>
            <th className="text-center py-3 px-4 text-gray-400 font-medium">Présence</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Motif absence</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            const status = getStatus(member._id);
            return (
              <tr key={member._id} className="border-b border-gray-800">
                <td className="py-3 px-4">
                  <span className="font-medium">{member.name}</span>
                  {member.instrument && (
                    <span className="text-gray-500 text-sm ml-2">({member.instrument})</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-400 capitalize">{member.role}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleMark(member._id, 'present')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        status === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-green-600/20'
                      }`}
                    >
                      Présent
                    </button>
                    <button
                      onClick={() => handleMark(member._id, 'absent')}
                      className={`px-3 py-1 rounded-lg text-sm transition ${
                        status === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-red-600/20'
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <input
                    type="text"
                    placeholder="Motif (optionnel)"
                    value={reasons[member._id] || ''}
                    onChange={(e) => setReasons({ ...reasons, [member._id]: e.target.value })}
                    className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:ring-1 focus:ring-primary-500"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
