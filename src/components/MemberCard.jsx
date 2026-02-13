import {
  Mail, Phone, Music, Users, Pencil, Trash2,
  Calendar, MapPin, Cake, User, Zap, Drum, Volume2, Piano
} from 'lucide-react';

/* ── Config genre ── */
const genderConfig = {
  homme: {
    gradient:   'from-indigo-500/25 to-cyan-400/15',
    border:     'border-indigo-500/25',
    avatarText: 'text-indigo-300',
    cardBorder: 'border-blue-900/40 hover:border-indigo-500/45',
  },
  femme: {
    gradient:   'from-pink-500/25 to-rose-400/15',
    border:     'border-pink-500/25',
    avatarText: 'text-pink-300',
    cardBorder: 'border-pink-900/40 hover:border-pink-500/45',
  },
};

/* ── Config statut ── */
const statusConfig = {
  actif:    { label: 'Actif',    dot: 'bg-emerald-400', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  inactif:  { label: 'Inactif',  dot: 'bg-neutral-500', cls: 'bg-neutral-800 text-neutral-400 border-neutral-700' },
  en_pause: { label: 'En pause', dot: 'bg-amber-400',   cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
};

/* ── Icône instrument ── */
const getInstrumentIcon = (instrument) => {
  if (!instrument) return null;
  const inst = instrument.toLowerCase();
  if (inst.includes('guitare') || inst.includes('basse')) return <Music className="w-3.5 h-3.5 shrink-0" />;
  if (inst.includes('batterie') || inst.includes('drum'))  return <Drum className="w-3.5 h-3.5 shrink-0" />;
  if (inst.includes('voix') || inst.includes('chant'))     return <Volume2 className="w-3.5 h-3.5 shrink-0" />;
  if (inst.includes('clavier') || inst.includes('piano'))  return <Piano className="w-3.5 h-3.5 shrink-0" />;
  return <Music className="w-3.5 h-3.5 shrink-0" />;
};

/* ── Icône rôle ── */
const getRoleIcon = (role) => {
  const r = role?.toLowerCase() || '';
  if (r.includes('chant'))  return <Volume2 className="w-3.5 h-3.5 shrink-0" />;
  if (r.includes('tech'))   return <Zap className="w-3.5 h-3.5 shrink-0" />;
  return <Users className="w-3.5 h-3.5 shrink-0" />;
};

/* ── Genre féminin ── */
const getRoleLabel = (member) => {
  const base = member.role || 'Musicien';
  if (member.gender === 'femme') {
    return { Chanteur: 'Chanteuse', Musicien: 'Musicienne', Technicien: 'Technicienne' }[base] || base;
  }
  return base;
};

const MemberCard = ({ member, onClick, onEdit, onDelete }) => {
  const g = genderConfig[member.gender] || genderConfig.homme;
  const s = statusConfig[member.status] || statusConfig.inactif;
  const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`.toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900/70 border ${g.cardBorder} rounded-xl p-4 sm:p-5 transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20`}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-3.5 gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">

          {/* Avatar */}
          <div className="relative shrink-0">
            {member.photo ? (
              <img
                src={member.photo}
                alt={member.pseudo || `${member.firstName} ${member.lastName}`}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg object-cover ring-1 ${g.border}`}
              />
            ) : (
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br ${g.gradient} border ${g.border} flex items-center justify-center text-xs sm:text-sm font-bold ${g.avatarText}`}
              >
                {initials || <User className="w-4 h-4" />}
              </div>
            )}
          </div>

          {/* Nom + badge statut */}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-100 truncate leading-tight">
              {member.firstName} {member.lastName}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${s.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-0.5 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-neutral-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="Modifier"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Infos ── */}
      <div className="space-y-1.5 text-xs">
        {member.role && (
          <div className="flex items-center gap-2 text-neutral-400">
            {getRoleIcon(member.role)}
            <span className="truncate">{getRoleLabel(member)}</span>
          </div>
        )}
        {member.instrument && (
          <div className="flex items-center gap-2 text-neutral-400">
            {getInstrumentIcon(member.instrument)}
            <span className="truncate">{member.instrument}</span>
          </div>
        )}
        {member.groupe && (
          <div className="flex items-center gap-2 text-neutral-400">
            <Users className="w-3.5 h-3.5 shrink-0 opacity-60" />
            <span className="truncate">{member.groupe}</span>
          </div>
        )}
        {member.dateOfBirth && (
          <div className="flex items-center gap-2 text-neutral-400">
            <Cake className="w-3.5 h-3.5 shrink-0 opacity-60" />
            <span>
              <span className="hidden sm:inline">
                {new Date(member.dateOfBirth).toLocaleDateString('fr-FR')}
              </span>
              {member.age && (
                <span className="text-neutral-500"> ({member.age} ans)</span>
              )}
            </span>
          </div>
        )}
        {member.residence && (
          <div className="flex items-center gap-2 text-neutral-400">
            <MapPin className="w-3.5 h-3.5 shrink-0 opacity-60" />
            <span className="truncate">{member.residence}</span>
          </div>
        )}
        {member.email && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors group"
          >
            <Mail className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
            <a href={`mailto:${member.email}`} className="truncate">{member.email}</a>
          </div>
        )}
        {member.phone && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors group"
          >
            <Phone className="w-3.5 h-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
            <a href={`tel:${member.phone}`}>{member.phone}</a>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      {(member.dateEntree || member.notesAccompagnement) && (
        <div className="mt-3.5 pt-3 border-t border-neutral-800 space-y-1.5">
          {member.dateEntree && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>Depuis le {new Date(member.dateEntree).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          {member.notesAccompagnement && (
            <p className="text-xs text-neutral-500 line-clamp-2 italic">
              {member.notesAccompagnement}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberCard;
