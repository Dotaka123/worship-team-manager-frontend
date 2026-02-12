import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Music4, Check, X, Loader2 } from 'lucide-react';
import axios from 'axios';

const VerifyEmail = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Si on arrive via une redirection avec paramètres (version avec redirection backend)
    const urlToken = searchParams.get('token');
    const urlName = searchParams.get('name');
    const urlEmail = searchParams.get('email');
    const urlMessage = searchParams.get('message');

    // Vérifier si c'est une redirection d'erreur
    if (window.location.pathname.includes('/error')) {
      setStatus('error');
      setMessage(urlMessage || 'Une erreur est survenue lors de la vérification');
      return;
    }

    // Vérifier si c'est une redirection de succès
    if (window.location.pathname.includes('/success')) {
      if (urlToken) {
        // Sauvegarder le token JWT
        localStorage.setItem('token', urlToken);
        setStatus('success');
        setMessage('Email vérifié avec succès !');
        setUserData({ name: urlName, email: urlEmail, token: urlToken });
        
        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
      return;
    }

    // Sinon, vérification normale via API
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de vérification manquant');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
        
        setStatus('success');
        setMessage(response.data.message);
        setUserData(response.data);

        // Sauvegarder le token JWT dans le localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message || 
          'Erreur lors de la vérification de votre email. Le lien est peut-être expiré.'
        );
      }
    };

    verifyEmail();
  }, [token, searchParams, navigate]);

  return (
    <div className="login-bg min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/25">
            <Music4 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-100">
            Worship Team
          </h1>
        </div>

        {/* Card */}
        <div className="bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-8 shadow-2xl shadow-black/40 text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/25">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-100 mb-3">
                Vérification en cours...
              </h2>
              <p className="text-neutral-400">
                Veuillez patienter pendant que nous vérifions votre email.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/25">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-100 mb-3">
                Email vérifié !
              </h2>
              <p className="text-neutral-400 mb-6">
                {message}
              </p>
              {userData && userData.name && (
                <div className="bg-neutral-800/60 border border-neutral-700/60 rounded-xl p-4 mb-6">
                  <p className="text-sm text-neutral-400 mb-1">Bienvenue,</p>
                  <p className="text-lg font-semibold text-neutral-100">{userData.name}</p>
                  <p className="text-sm text-neutral-500">{userData.email}</p>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirection vers le dashboard...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/25">
                <X className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-100 mb-3">
                Vérification échouée
              </h2>
              <p className="text-neutral-400 mb-6">
                {message}
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/resend-verification"
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl font-semibold text-sm text-white transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  Renvoyer l'email de vérification
                </Link>
                <Link
                  to="/login"
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition"
                >
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
