import { useState, useEffect } from 'react';
import { membersAPI, attendanceAPI } from '../services/api';
import AttendanceTable from '../components/AttendanceTable';
import { Save, Check } from 'lucide-react';

const Attendance = () => {
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [eventType, setEventType] = useState(() => {
    return localStorage.getItem('lastEventType') || 'repetition';
  });
  const [customEventType, setCustomEventType] = useState(() => {
    return localStorage.getItem('lastCustomEventType') || '';
  });
  const [showCustomInput, setShowCustomInput] = useState(() => {
    const savedType = localStorage.getItem('lastEventType');
    return savedType === 'autre';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTypes, setUpdatingTypes] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Sauvegarder le type d'événement dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('lastEventType', eventType);
  }, [eventType]);

  useEffect(() => {
    if (customEventType) {
      localStorage.setItem('lastCustomEventType', customEventType);
    }
  }, [customEventType]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const membersRes = await membersAPI.getAll();
        const activeMembers = membersRes.data.filter(m => m.status === 'actif');

        const attendanceRes = await attendanceAPI.getByDate(selectedDate);

        setMembers(activeMembers || []);
        setAttendance(attendanceRes.data || []);
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.response?.data?.message || err.message);
        setMembers([]);
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  // Fonction pour mettre à jour le type de tous les enregistrements existants
  const handleUpdateAllTypes = async () => {
    if (attendance.length === 0) {
      alert('Aucune présence à mettre à jour pour cette date');
      return;
    }

    const finalEventType = eventType === 'autre' 
      ? customEventType || 'Autre' 
      : eventType === 'culte' 
        ? 'Culte' 
        : 'Répétition';

    if (eventType === 'autre' && !customEventType.trim()) {
      alert('Veuillez entrer un type d\'événement personnalisé');
      return;
    }

    const confirmUpdate = window.confirm(
      `Voulez-vous changer le type d'événement de tous les enregistrements du ${new Date(selectedDate).toLocaleDateString('fr-FR')} vers "${finalEventType}" ?`
    );

    if (!confirmUpdate) return;

    setUpdatingTypes(true);

    try {
      // Mettre à jour tous les enregistrements
      const updates = attendance.map(record => {
        const memberId = record.member?._id || record.member;
        return attendanceAPI.mark({
          memberId,
          date: selectedDate,
          status: record.status,
          reason: record.reason,
          arrivalTime: record.arrivalTime,
          type: finalEventType
        });
      });

      const results = await Promise.all(updates);

      // Mettre à jour l'état local
      setAttendance(results.map(r => r.data));
      setShowSaveButton(false);
      alert(`✅ Type d'événement mis à jour pour ${results.length} enregistrement(s)`);
    } catch (err) {
      console.error('❌ Error updating types:', err);
      alert('Erreur lors de la mise à jour : ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingTypes(false);
    }
  };

  const handleMark = async ({ memberId, status, reason, arrivalTime }) => {
    try {
      const finalEventType = eventType === 'autre' 
        ? customEventType || 'Autre' 
        : eventType === 'culte' 
          ? 'Culte' 
          : 'Répétition';

      console.log('📤 Envoi de la requête:', {
        memberId,
        date: selectedDate,
        status,
        reason,
        arrivalTime,
        type: finalEventType
      });

      const { data } = await attendanceAPI.mark({
        memberId,
        date: selectedDate,
        status,
        reason,
        arrivalTime,
        type: finalEventType
      });

      console.log('✅ Réponse reçue:', data);

      // Mise à jour de l'état avec comparaison correcte des IDs
      setAttendance(prev => {
        const existing = prev.findIndex(a => {
          const recordMemberId = String(a.member?._id || a.member);
          const currentMemberId = String(memberId);
          return recordMemberId === currentMemberId;
        });
        
        console.log('🔍 Index trouvé:', existing);
        
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data;
          console.log('🔄 Mise à jour de l\'enregistrement existant');
          return updated;
        } else {
          console.log('➕ Ajout d\'un nouvel enregistrement');
          return [...prev, data];
        }
      });
    } catch (err) {
      console.error('❌ Error:', err);
      console.error('❌ Error details:', err.response?.data);
      alert(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEventTypeChange = (newType) => {
    setEventType(newType);
    setShowCustomInput(newType === 'autre');
    // Montrer le bouton de sauvegarde si des enregistrements existent
    if (attendance.length > 0) {
      setShowSaveButton(true);
    }
  };

  const finalEventType = eventType === 'autre' 
    ? customEventType || 'Autre' 
    : eventType === 'culte' 
      ? 'Culte' 
      : 'Répétition';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Présences</h1>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-100 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Sélecteur de type d'événement */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-400">
            Type d'événement
          </label>
          {showSaveButton && (
            <button
              onClick={handleUpdateAllTypes}
              disabled={updatingTypes}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updatingTypes ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Mise à jour...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Appliquer à tous
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleEventTypeChange('repetition')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              eventType === 'repetition'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Répétition
          </button>
          <button
            onClick={() => handleEventTypeChange('culte')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              eventType === 'culte'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Culte
          </button>
          <button
            onClick={() => handleEventTypeChange('autre')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              eventType === 'autre'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Autre
          </button>
        </div>
        
        {showCustomInput && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Veuillez préciser le type d'événement..."
              value={customEventType}
              onChange={(e) => {
                setCustomEventType(e.target.value);
                if (attendance.length > 0) {
                  setShowSaveButton(true);
                }
              }}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Indicateur du type actuel */}
        <div className="mt-3 px-3 py-2 bg-neutral-950 rounded-lg border border-neutral-800">
          <p className="text-xs text-gray-400">Type actuel :</p>
          <p className="text-sm text-white font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            {finalEventType}
          </p>
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        {loading ? (
          <div className="p-6"><div className="bar-loader w-full" /></div>
        ) : error ? (
          <p className="p-6 text-red-400 text-sm">Erreur : {error}</p>
        ) : members.length === 0 ? (
          <p className="p-6 text-gray-400">
            Aucun membre actif. Vérifie que tes membres ont le statut "actif".
          </p>
        ) : (
          <AttendanceTable
            members={members}
            attendance={attendance}
            onMark={handleMark}
          />
        )}
      </div>
    </div>
  );
};

export default Attendance;
