import { useState } from 'react';
import { Save, Clock, X, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '',          label: '— Non marqué —',  color: 'text-neutral-400',  bg: '' },
  { value: 'present',   label: '✓ Présent',         color: 'text-green-400',    bg: 'bg-green-600/10 border-green-600/30' },
  { value: 'en_retard', label: '⏰ En retard',       color: 'text-orange-400',   bg: 'bg-orange-600/10 border-orange-600/30' },
  { value: 'absent',    label: '✗ Absent',           color: 'text-red-400',      bg: 'bg-red-600/10 border-red-600/30' },
  { value: 'excused',   label: '📝 Excusé',          color: 'text-violet-400',   bg: 'bg-violet-600/10 border-violet-600/30' },
];

const AttendanceTable = ({ members = [], attendance = [], onMark, onClear }) => {
  const [reasons, setReasons] = useState({});
  const [arrivalTimes, setArrivalTimes] = useState({});
  const [saving, setSaving] = useState({});
  const [activeInputs, setActiveInputs] = useState({});
  const [clearing, setClearing] = useState({});

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

  const doClear = async (memberId) => {
    setClearing(prev => ({ ...prev, [memberId]: true }));
    try {
      await onClear({ memberId });
      setActiveInputs(prev => { const s = { ...prev }; delete s[memberId]; return s; });
      setReasons(prev => { const s = { ...prev }; delete s[memberId]; return s; });
      setArrivalTimes(prev => { const s = { ...prev }; delete s[memberId]; return s; });
    } catch (error) {
      alert('Erreur lors de l\'annulation : ' + (error.response?.data?.message || error.message));
    } finally {
      setClearing(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const handleClearStatus = async (memberId) => {
    if (!confirm('Voulez-vous annuler le statut de présence pour ce membre ?')) return;
    await doClear(memberId);
  };

  const handleSelectChange = async (memberId, newStatus) => {
    if (!newStatus) {
      if (!getStatus(memberId)) return;
      if (!confirm('Voulez-vous annuler le statut de présence pour ce membre ?')) return;
      await doClear(memberId);
      return;
    }
    if (newStatus === 'en_retard') {
      setActiveInputs(prev => ({ ...prev, [memberId]: 'time' }));
      return;
    }
    if (newStatus === 'excused') {
      setActiveInputs(prev => ({ ...prev, [memberId]: 'reason' }));
      return;
    }
    await handleMark(memberId, newStatus);
  };

  const handleMark = async (memberId, status) => {
    const reason = reasons[memberId]?.trim();
    const arrivalTime = arrivalTimes[memberId]?.trim();

    if (status === 'excused' && !reason) {
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
        reason: status === 'excused' ? reason : null,
        arrivalTime: (status === 'en_retard' || status === 'present') ? arrivalTime : null
      });
      setActiveInputs(prev => { const s = { ...prev }; delete s[memberId]; return s; });
      setReasons(prev => { const s = { ...prev }; delete s[memberId]; return s; });
      setArrivalTimes(prev => { const s = { ...prev }; delete s[memberId]; return s; });
    } finally {
      setSaving(prev => ({ ...prev, [memberId]: false }));
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getStatusOption = (status) =>
    STATUS_OPTIONS.find(o => o.value === (status || '')) || STATUS_OPTIONS[0];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-900">
            <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Membre</th>
            <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Rôle</th>
            <th className="text-center py-4 px-4 text-gray-400 font-semibold text-sm">Statut</th>
            <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Détails</th>
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
            const isLoading = saving[member._id] || clearing[member._id];
            const activeInput = activeInputs[member._id];
            const statusOpt = getStatusOption(status);

            return (
              <tr key={member._id} className="border-b border-gray-800 hover:bg-gray-900/50">
                {/* Membre */}
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

                {/* Rôle */}
                <td className="py-4 px-4 text-sm">
                  <div className="text-gray-400">
                    <p>{member.role || 'N/A'}</p>
                    {member.instrument && (
                      <p className="text-gray-500 text-xs">{member.instrument}</p>
                    )}
                  </div>
                </td>

                {/* Statut — Dropdown */}
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {/* Bouton annuler rapide si statut existant */}
                    {status && (
                      <button
                        onClick={() => handleClearStatus(member._id)}
                        disabled={isLoading}
                        title="Annuler le statut"
                        className="p-1.5 rounded-lg bg-neutral-800 text-red-400 hover:bg-red-600/20 hover:text-red-300 transition disabled:opacity-50"
                      >
                        {clearing[member._id]
                          ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-400" />
                          : <X className="w-3.5 h-3.5" />
                        }
                      </button>
                    )}

                    {/* Select stylisé */}
                    <div className="relative">
                      <select
                        value={status || ''}
                        onChange={(e) => handleSelectChange(member._id, e.target.value)}
                        disabled={isLoading}
                        className={[
                          'appearance-none pl-3 pr-8 py-2 rounded-xl text-sm font-medium',
                          'border cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'bg-neutral-800',
                          status ? statusOpt.bg : 'border-neutral-700',
                          statusOpt.color,
                          'min-w-[145px]'
                        ].join(' ')}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-neutral-900 text-white"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className={`absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${statusOpt.color}`} />
                      {isLoading && !clearing[member._id] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800/60 rounded-xl">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Détails */}
                <td className="py-4 px-4">
                  {/* Champ Motif — Excusé */}
                  {activeInput === 'reason' ? (
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Entrer le motif..."
                        value={reason || ''}
                        onChange={(e) => setReasons(prev => ({ ...prev, [member._id]: e.target.value }))}
                        disabled={isLoading}
                        autoFocus
                        rows={2}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:ring-1 focus:ring-violet-500 disabled:opacity-50 resize-none"
                      />
                      <button
                        onClick={() => handleMark(member._id, 'excused')}
                        disabled={isLoading || !reason}
                        className="px-3 py-2 bg-violet-600 hover:bg-violet-700 rounded text-white transition disabled:opacity-50 disabled:bg-gray-600"
                        title="Confirmer"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  )
                  /* Champ Heure — En retard */
                  : activeInput === 'time' ? (
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <input
                          type="time"
                          value={arrivalTime || ''}
                          onChange={(e) => setArrivalTimes(prev => ({ ...prev, [member._id]: e.target.value }))}
                          disabled={isLoading}
                          autoFocus
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm text-white disabled:opacity-50"
                        />
                      </div>
                      <button
                        onClick={() => handleMark(member._id, 'en_retard')}
                        disabled={isLoading || !arrivalTime}
                        className="px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-white transition disabled:opacity-50 disabled:bg-gray-600"
                        title="Confirmer"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  )
                  /* Affichage — Excusé */
                  : status === 'excused' ? (
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-sm text-violet-300 break-words flex-1" title={reason}>
                        {truncateText(reason, 40)}
                      </span>
                      <button
                        onClick={() => {
                          setReasons(prev => ({ ...prev, [member._id]: storedReason }));
                          setActiveInputs(prev => ({ ...prev, [member._id]: 'reason' }));
                        }}
                        className="text-xs text-gray-500 hover:text-gray-300 transition whitespace-nowrap"
                      >
                        Éditer
                      </button>
                    </div>
                  )
                  /* Affichage — Absent */
                  : status === 'absent' ? (
                    <span className="text-sm text-red-400">Sans motif</span>
                  )
                  /* Affichage — En retard ou Présent */
                  : (status === 'en_retard' || status === 'present') ? (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {arrivalTime || '-'}
                      </span>
                      <button
                        onClick={() => {
                          setArrivalTimes(prev => ({ ...prev, [member._id]: storedArrivalTime }));
                          setActiveInputs(prev => ({ ...prev, [member._id]: 'time' }));
                        }}
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
