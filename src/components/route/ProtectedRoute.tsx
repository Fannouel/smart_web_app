// src/components/ProtectedRoute.tsx
import { type ReactNode, useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import BASE_URL from '../../config/ApiConfig';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'SUPERADMIN' | 'USER';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [checking, setChecking] = useState(true);
  
  // Utiliser une ref pour éviter les vérifications multiples
  const hasCheckedRef = useRef(false);

  // Vérifier si le token est expiré - une seule fois au montage
  useEffect(() => {
    // Éviter les vérifications multiples
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsTokenValid(false);
        setChecking(false);
        return;
      }

      try {
        // Option 1: Vérifier la date d'expiration du token JWT
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const exp = payload.exp * 1000; // Convertir en millisecondes
          
          if (Date.now() >= exp) {
            // Token expiré
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsTokenValid(false);
            setChecking(false);
            return;
          }
        }

        // Option 2: Optionnel - Vérifier avec le backend
        // try {
        //   const response = await fetch(`${BASE_URL}/auth/verify-token`, {
        //     headers: {
        //       'Authorization': `Bearer ${token}`,
        //     },
        //   });
          
        //   if (!response.ok) {
        //     localStorage.removeItem('token');
        //     localStorage.removeItem('user');
        //     setIsTokenValid(false);
        //   }
        // } catch (err) {
        //   // Si le serveur n'est pas disponible, on considère le token comme valide
        //   // pour ne pas bloquer l'utilisateur
        //   console.warn('Impossible de vérifier le token avec le serveur');
        // }
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
      } finally {
        setChecking(false);
      }
    };

    if (isAuthenticated) {
      checkTokenValidity();
    } else {
      setChecking(false);
    }
  }, [isAuthenticated]); // Dépend uniquement de isAuthenticated

  // Afficher un écran de chargement pendant la vérification
  if (isLoading || checking) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-spinner"></div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // Rediriger vers login si non authentifié ou token invalide
  if (!isAuthenticated || !isTokenValid) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // Vérifier les rôles si nécessaire
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'SUPERADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // Tout est bon, afficher le contenu protégé
  return <>{children}</>;
};