import { useState } from 'react';
import { Save, Clock } from 'lucide-react';

const AttendanceTable = ({ members = [], attendance = [], onMark }) => {
  const [reasons, setReasons] = useState({});
  const [arrivalTimes, setArrivalTimes] = useState({});
  const [saving, setSaving] = useState({});
  const [activeInputs, setActiveInputs] = useState({});
  // ✅ AJOUT : État pour mémoriser quel bouton a été cliqué
  const [pendingStatus, setPendingStatus] = useState({});

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

  const getArrivalTime = (memberId) => {
    const record = attendance.find(a => 
      String(a.member?._id || a.member) === String(memberId)
    );
    return record?.arrivalTime || '';
  };

  // ✅ CORRECTION : Mémoriser quel bouton a été cliqué
  const handleStatusClick = (memberId, newStatus) => {
    // Stocker le statut choisi
    setPendingStatus(prev => ({
      ...prev,
      [memberId]: newStatus
    }));

    // Si "Présent" sans heure, on enregistre direct
    if (newStatus === 'present') {
      handleMark(memberId, newStatus);
      return;
    }
    
    // Si on clique sur "En retard", on active le champ heure
    if (newStatus === 'en_retard') {
      setActiveInputs(prev => ({
        ...prev,
        [memberId]: 'time'
      }));
    }
    
    // Si on clique sur "Absent", on active le champ motif
    if (newStatus === 'absent') {
      setActiveInputs(prev => ({
        ...prev,
        [memberId]: 'reason'
      }));
    }
  };

  const handleMark = async (memberId, status) => {
    const reason = reasons[memberId]?.trim();
    const arrivalTime = arrivalTimes[memberId]?.trim();

    // Validations
    if (status === 'absent' && !reason) {
      alert('Veuillez entrer un motif');
      return;
    }

    if (status === 'en_retard' && !arrivalTime) {
      alert('Veuillez entrer l\'heure d\'arrivée');
      return;
    }

    setSaving(prev => ({ ...prev, [memberId]: true }));

    try {
      await onMark({
        memberId,
        status,
        reason: status === 'absent' ? reason : null,
        arrivalTime: (status === 'en_retard' || status === 'present') ? arrivalTime : null
      });

      // ✅ Nettoyer après succès
      setActiveInputs(prev => {
        const newState = { ...prev };
        delete newState[memberId];
        return newState;
      });
      setPendingStatus(prev => {
        const newState = { ...prev };
        delete newState[memberId];
        return newState;
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

  const handleArrivalTimeChange = (memberId, value) => {
    setArrivalTimes(prev => ({
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
              Détails
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => {
            if (!member || !member._id) return null;

            const status = getStatus(member._id);
            const storedReason = getReason(member._id);
            const reason = reasons[member._id] ?? storedReason;
            const storedArrivalTime = getArrivalTime(member._id);
            const arrivalTime = arrivalTimes[member._id] ?? storedArrivalTime;
            const isLoading = saving[member._id];
            const activeInput = activeInputs[member._id];

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
                  <div className="flex justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleStatusClick(member._id, 'present')}
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
                      onClick={() => handleStatusClick(member._id, 'en_retard')}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                        status === 'en_retard'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-orange-600/20'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      ⏰ En retard
                    </button>
                    <button
                      onClick={() => handleStatusClick(member._id, 'absent')}
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
                  {/* Champ Motif - Absent */}
                  {activeInput === 'reason' ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Entrer le motif..."
                        value={reason || ''}
                        onChange={(e) => handleReasonChange(member._id, e.target.value)}
                        disabled={isLoading}
                        autoFocus
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-red-500 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handleMark(member._id, 'absent')}
                        disabled={isLoading || !reason}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white transition disabled:opacity-50 disabled:bg-gray-600"
                        title="Confirmer"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) 
                  // Champ Heure - En retard
                  : activeInput === 'time' ? (
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={arrivalTime || ''}
                          onChange={(e) => handleArrivalTimeChange(member._id, e.target.value)}
                          disabled={isLoading}
                          autoFocus
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white disabled:opacity-50"
                        />
                      </div>
                      {/* ✅ CORRECTION : Utiliser le statut mémorisé */}
                      <button
                        onClick={() => handleMark(member._id, pendingStatus[member._id] || 'en_retard')}
                        disabled={isLoading || !arrivalTime}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white transition disabled:opacity-50 disabled:bg-gray-600"
                        title="Confirmer"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  )
                  // État sauvegardé - Affichage
                  : status === 'absent' ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{reason || '-'}</span>
                      <button
                        onClick={() => setActiveInputs(prev => ({ ...prev, [member._id]: 'reason' }))}
                        className="text-xs text-gray-500 hover:text-gray-300 transition"
                      >
                        Éditer
                      </button>
                    </div>
                  ) : status === 'en_retard' || status === 'present' ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {arrivalTime || '-'}
                      </span>
                      <button
                        onClick={() => setActiveInputs(prev => ({ ...prev, [member._id]: 'time' }))}
                        className="text-xs text-gray-500 hover:text-gray-300 transition"
                      >
                        Éditer
                      </button>
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
