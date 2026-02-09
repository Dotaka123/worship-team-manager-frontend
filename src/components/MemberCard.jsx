import { Mail, Phone, Music, Users, Pencil, Trash2, Calendar, MapPin, Cake, User, Users2, Zap, Drum, Volume2 } from 'lucide-react';

const MemberCard = ({ member, onEdit, onDelete }) => {
  const statusStyles = {
    actif: 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30',
    inactif: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    en_pause: 'bg-amber-950/30 text-amber-400 border-amber-800/30',
  };

  const statusLabels = {
    actif: 'Actif',
    inactif: 'Inactif',
    en_pause: 'En pause',
  };

  // Couleurs selon le sexe
  const genderStyles = {
    homme: {
      bg: 'bg-blue-950/30',
      border: 'border-blue-800/30',
      text: 'text-blue-400',
      avatarBg: 'bg-blue-900/50'
    },
    femme: {
      bg: 'bg-pink-950/30',
      border: 'border-pink-800/30',
      text: 'text-pink-400',
      avatarBg: 'bg-pink-900/50'
    }
  };

  const genderStyle = genderStyles[member.gender] || genderStyles.homme;

  // Fonction pour obtenir le label du rôle avec accord de genre
  const getRoleLabel = () => {
    const baseRole = member.role || 'Musicien';
    if (member.gender === 'femme') {
      const femaleVersions = {
        'Chanteur': 'Chanteuse',
        'Musicien': 'Musicienne',
        'Technicien': 'Technicienne'
      };
      return femaleVersions[baseRole] || baseRole;
    }
    return baseRole;
  };

  // Icônes d'instruments
  const getInstrumentIcon = () => {
    if (!member.instrument) return null;
    const instrument = member.instrument.toLowerCase();
    
    if (instrument.includes('guitare') || instrument.includes('basse')) {
      return <Music className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
    if (instrument.includes('batterie') || instrument.includes('drum')) {
      return <Drum className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
    if (instrument.includes('voix') || instrument.includes('chant')) {
      return <Volume2 className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
    if (instrument.includes('clavier') || instrument.includes('piano')) {
      return <Users2 className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
    return <Music className="w-4 h-4 text-neutral-500 shrink-0" />;
  };

  // Icône pour le rôle
  const getRoleIcon = () => {
    const role = member.role?.toLowerCase() || '';
    if (role.includes('chant')) {
      return <Volume2 className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
    if (role.includes('tech')) {
      return <Zap className="w-4 h-4 text-neutral-500 shrink-0" />;
    }
    return <Users className="w-4 h-4 text-neutral-500 shrink-0" />;
  };

  const initials = `${member.firstName?.charAt(0) || ''}${member.lastName?.charAt(0) || ''}`.toUpperCase();
  const genderIcon = member.gender === 'femme' ? '♀' : '♂';

  return (
    <div className={`${genderStyle.bg} border ${genderStyle.border} rounded-lg p-5 hover:border-opacity-50 transition-colors`}>
      
      {/* En-tête avec avatar */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-md ${genderStyle.avatarBg} flex items-center justify-center text-sm font-medium ${genderStyle.text} border border-neutral-700 shrink-0 relative`}>
            {initials || '—'}
            <span className="absolute -bottom-1 -right-1 text-xs bg-neutral-900 rounded-full w-5 h-5 flex items-center justify-center">
              {genderIcon}
            </span>
          </div>
          
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-neutral-100 truncate">
              {member.firstName} {member.lastName}
            </h3>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded border ${statusStyles[member.status]}`}>
              {statusLabels[member.status]}
            </span>
          </div>
        </div>
        
        {/* Actions discrètes */}
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(member)}
            className="p-1.5 text-neutral-500 hover:text-indigo-400 hover:bg-indigo-950/20 rounded-md transition-colors"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(member._id)}
            className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-950/20 rounded-md transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="space-y-2 text-sm">
        {member.role && (
          <div className="flex items-center gap-3 text-neutral-400">
            {getRoleIcon()}
            <span className="truncate">{getRoleLabel()}</span>
          </div>
        )}
        
        {member.instrument && (
          <div className="flex items-center gap-3 text-neutral-400">
            {getInstrumentIcon()}
            <span className="truncate">{member.instrument}</span>
          </div>
        )}

        {member.groupe && (
          <div className="flex items-center gap-3 text-neutral-400">
            <span className="w-4 h-4 flex items-center justify-center text-xs text-neutral-500 shrink-0">G</span>
            <span className="truncate">{member.groupe}</span>
          </div>
        )}

        {member.dateOfBirth && (
          <div className="flex items-center gap-3 text-neutral-400">
            <Cake className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="truncate">{new Date(member.dateOfBirth).toLocaleDateString('fr-FR')} {member.age && `(${member.age} ans)`}</span>
          </div>
        )}

        {member.residence && (
          <div className="flex items-center gap-3 text-neutral-400">
            <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
            <span className="truncate">{member.residence}</span>
          </div>
        )}

        {member.email && (
          <a 
            href={`mailto:${member.email}`}
            className="flex items-center gap-3 text-neutral-400 hover:text-neutral-200 transition-colors group"
          >
            <Mail className="w-4 h-4 text-neutral-500 shrink-0 group-hover:text-neutral-400" />
            <span className="truncate">{member.email}</span>
          </a>
        )}

        {member.phone && (
          <a 
            href={`tel:${member.phone}`}
            className="flex items-center gap-3 text-neutral-400 hover:text-neutral-200 transition-colors group"
          >
            <Phone className="w-4 h-4 text-neutral-500 shrink-0 group-hover:text-neutral-400" />
            <span>{member.phone}</span>
          </a>
        )}
      </div>

      {/* Date d'entrée et détails */}
      {(member.dateEntree || member.notesAccompagnement) && (
        <div className="mt-4 pt-3 border-t border-neutral-800 space-y-2">
          {member.dateEntree && (
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Depuis le {new Date(member.dateEntree).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
          {member.notesAccompagnement && (
            <p className="text-xs text-neutral-500 line-clamp-2">
              {member.notesAccompagnement}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberCard;
