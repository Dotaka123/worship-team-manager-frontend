import { useState } from 'react';
import { Save } from 'lucide-react';

const AttendanceTable = ({ members = [], attendance = [], onMark }) => {
  const [reasons, setReasons] = useState({});
  const [saving, setSaving] = useState({});

  // Protection : vérifier que members est un tableau
  if (!Array.isArray(members) || members.length === 0) {
    return (
      <div className="p-6 text-gray-400 text-center">
        <p>Aucun membre à afficher</p>
      </div>
    );
  }

  const getStatus = (memberId) => {
    const record = attendance.find(a => 
      String(a.member?._id || a.member) === String(memberId)
    );
    return record?.status || null;
  };

  const getReason = (memberId) => {
    const record = attendance.find(a => 
      String(a.member?._id || a.member) === String(memberId)
    );
    return record?.reason || '';
  };

  const handleMark = async (memberId, status) => {
    const reason = reasons[memberId]?.trim();

    if ((status === 'absent' || status === 'excused') && !reason) {
      alert('Veuillez entrer un motif');
      return;
    }

    setSaving(prev => ({ ...prev, [memberId]: true }));

    try {
      await onMark({
        memberId,
        status,
        reason: status === 'present' ? null : reason
      });
    } finally {
      setSaving(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleReasonChange = (memberId, value) => {
    setReasons(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-900">
            <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
              Membre
            </th>
            <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
              Rôle
            </th>
            <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">
              Statut
            </th>
            <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">
              Motif
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            if (!member || !member._id) return null;

            const status = getStatus(member._id);
            const storedReason = getReason(member._id);
            const reason = reasons[member._id] ?? storedReason;
            const isLoading = saving[member._id];

            return (
              <tr key={member._id} className="border-b border-gray-800 hover:bg-gray-900/50">
                <td className="py-4 px-4">
                  <div>
                    <span className="font-medium text-white text-sm">
                      {member.firstName} {member.lastName}
                    </span>
                    {member.email && (
                      <p className="text-gray-500 text-xs mt-1">{member.email}</p>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4 text-sm">
                  <div className="text-gray-400">
                    <p>{member.role || 'N/A'}</p>
                    {member.instrument && (
                      <p className="text-gray-500 text-xs">{member.instrument}</p>
                    )}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handleMark(member._id, 'present')}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        status === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-green-600/20'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ✓ Présent
                    </button>
                    <button
                      onClick={() => handleMark(member._id, 'absent')}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        status === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-red-600/20'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ✗ Absent
                    </button>
                  </div>
                </td>

                <td className="py-4 px-4">
                  {status === 'absent' || status === 'excused' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Motif..."
                        value={reason || ''}
                        onChange={(e) => handleReasonChange(member._id, e.target.value)}
                        disabled={isLoading}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                      />
                      {reason && reason !== storedReason && (
                        <button
                          onClick={() => handleMark(member._id, status)}
                          disabled={isLoading}
                          className="px-2 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition disabled:opacity-50"
                          title="Enregistrer"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">-</span>
                  )}
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
