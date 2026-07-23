// src/pages/stock/reapprovisionner.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LuPackage,
  LuArrowLeft,
  LuTruck,
  LuDollarSign,
  LuRefreshCw,
  LuPlus,
  LuMinus,
  LuCircleCheck,
  LuCircleAlert,
  LuInfo,
  LuShoppingCart,
  LuWarehouse,
} from 'react-icons/lu';
import BASE_URL from '../../config/ApiConfig';
import './approvisionnement.css';
import type { ProduitById } from '../../models';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  numero: string;
  nom: string;
  type: string;
  quantite: number;
  prixAchat: number;
  prixVente: number;
  idEntreprise: number;
  Stock?: StockLine[];
}

interface StockLine {
  id: number;           // id de la ligne Stock
  quantite: number;
  transport: number;
  dateDepot: string;
  entrepot: {
    id: number;
    ville: string;
    zone: string;
  };
}

interface Entrepot {
  id: number;
  ville: string;
  zone: string;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ReapprovisionnerScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [product, setProduct] = useState<ProduitById | null>(null);
  const [entrepots, setEntrepots] = useState<Entrepot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [idUniteEntree, setIdUniteEntree] = useState<number | null>(null);
  // Champs du formulaire
  const [quantite, setQuantite] = useState<number>(1);
  const [prixAchat, setPrixAchat] = useState<number>(0);
  const [transport, setTransport] = useState<number>(0);
  const [idEntrepot, setIdEntrepot] = useState<number | null>(null);
  const [method, setMethod] = useState<'CASH' | 'CREDIT' | 'BANK' | 'MOBILE_MONEY' | 'CHECK'>('CASH');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  // ── Chargement initial ──
  useEffect(() => {
    if (token && id) {
      fetchProduct();
      fetchEntrepots();
    }
  }, [id, token]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/stock/produit/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur lors du chargement du produit');
      const data: ProduitById = await res.json();
      setProduct(data);
      setPrixAchat(data.prixAchat);
      setIdUniteEntree(data.idUnite); // ✅ ajouté
      // Présélectionner le premier entrepôt connu du produit
      if (data.Stock && data.Stock.length > 0) {
        setIdEntrepot(data.Stock[0].entrepot.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const fetchEntrepots = async () => {
    try {
      const res = await fetch(`${BASE_URL}/stock/entrepot`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data: Entrepot[] = await res.json();
      setEntrepots(data);
      if (data.length > 0 && idEntrepot === null) {
        setIdEntrepot(data[0].id);
      }
    } catch {
      // Non bloquant : l'utilisateur pourra quand même saisir
    }
  };

  // ── Soumission ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantite <= 0) { setError('La quantité doit être supérieure à 0'); return; }
    if (prixAchat <= 0) { setError("Le prix d'achat doit être supérieur à 0"); return; }
    if (!idEntrepot) { setError("Veuillez sélectionner un entrepôt"); return; }
    if (!idUniteEntree) { setError("Unité introuvable pour ce produit"); return; }
    setError(null);
    setShowConfirmation(true);
  };

  const confirmReappro = async () => {
    if (!token || !id || !product || !idEntrepot || !idUniteEntree) return;
    setSubmitting(true);
    setError(null);

    try {
      // ✅ Appel correct : POST /stock/produit/:id/reapprovisionner
      const res = await fetch(`${BASE_URL}/stock/produit/${id}/reapprovisionner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idEntrepot,
          quantite,
          prixAchat,
          transport,
          method,
          idUniteEntree, // ✅ ajouté
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de l'approvisionnement");
      }

      setSuccess(true);
      setTimeout(() => navigate(`/stock/${id}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setShowConfirmation(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers quantité ──
  const incrementQuantite = () => setQuantite(prev => prev + 1);
  const decrementQuantite = () => setQuantite(prev => (prev > 1 ? prev - 1 : 1));
  const handleQuantiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setQuantite(!isNaN(v) && v >= 1 ? v : 1);
  };

  const montantTotal = prixAchat * quantite + transport;
  const nouvelleQuantite = (product?.quantite || 0) + quantite;

  const PAYMENT_OPTIONS: { value: typeof method; label: string }[] = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CREDIT', label: 'Crédit' },
    { value: 'BANK', label: 'Virement' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money' },
    { value: 'CHECK', label: 'Chèque' },
  ];

  // ── États de chargement / erreur ──
  if (loading) return (
    <div className="reappro-loading">
      <div className="spinner" />
      <p>Chargement du produit...</p>
    </div>
  );

  if (error && !product) return (
    <div className="reappro-error">
      <LuCircleAlert size={48} />
      <h2>Erreur</h2>
      <p>{error}</p>
      <button onClick={() => navigate('/stock')} className="back-button">Retour à la liste</button>
    </div>
  );

  if (success) return (
    <div className="reappro-success">
      <LuCircleCheck size={64} color="#05aa65" />
      <h2>Approvisionnement réussi !</h2>
      <p>{quantite} unités de <strong>{product?.nom}</strong> ont été ajoutées au stock.</p>
      <div className="success-details">
        <div className="detail-item">
          <span>Nouveau stock :</span>
          <strong>{nouvelleQuantite} unités</strong>
        </div>
        <div className="detail-item">
          <span>Montant total :</span>
          <strong>{montantTotal.toLocaleString()} Ar</strong>
        </div>
        <div className="detail-item">
          <span>Entrepôt :</span>
          <strong>{entrepots.find(e => e.id === idEntrepot)?.ville} — {entrepots.find(e => e.id === idEntrepot)?.zone}</strong>
        </div>
      </div>
      <button onClick={() => navigate(`/stock/${id}`)} className="success-button">Voir le produit</button>
    </div>
  );

  return (
    <div className="reappro-container">
      {/* Header */}
      <div className="reappro-header">
        <button className="back-button" onClick={() => navigate(`/stock/${id}`)}>
          <LuArrowLeft size={20} /> Retour
        </button>
        <div className="header-title">
          <h1>Réapprovisionnement</h1>
          <p className="product-name">{product?.nom} — Réf : {product?.numero}</p>
        </div>
      </div>

      {/* Infos produit */}
      <div className="product-info-card">
        <div className="info-item">
          <LuPackage className="info-icon" />
          <div>
            <span className="info-label">Stock actuel</span>
            <span className="info-value">{product?.quantite.toLocaleString()} unités</span>
          </div>
        </div>
        <div className="info-item">
          <LuDollarSign className="info-icon" />
          <div>
            <span className="info-label">Prix d'achat actuel</span>
            <span className="info-value">{product?.prixAchat.toLocaleString()} Ar</span>
          </div>
        </div>
        <div className="info-item">
          <LuShoppingCart className="info-icon" />
          <div>
            <span className="info-label">Prix de vente</span>
            <span className="info-value">{product?.prixVente.toLocaleString()} Ar</span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="reappro-form">
        {error && (
          <div className="error-message">
            <LuCircleAlert size={20} /> {error}
          </div>
        )}

        {/* Entrepôt de destination */}
        <div className="form-group">
          <label htmlFor="entrepot">
            <LuWarehouse size={16} /> Entrepôt de destination <span className="required">*</span>
          </label>
          {entrepots.length > 0 ? (
            <select
              id="entrepot"
              value={idEntrepot ?? ''}
              onChange={e => setIdEntrepot(Number(e.target.value))}
              required
              style={{ width: '100%', padding: '12px 16px', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '14px' }}
            >
              <option value="" disabled>Sélectionner un entrepôt</option>
              {entrepots.map(e => (
                <option key={e.id} value={e.id}>{e.ville} — {e.zone}</option>
              ))}
            </select>
          ) : (
            <div className="info-text warning">
              <LuInfo size={14} /> Aucun entrepôt disponible. Créez-en un depuis la gestion des entrepôts.
            </div>
          )}
          <small className="field-hint">
            La quantité sera ajoutée à la ligne de stock de cet entrepôt.
          </small>
        </div>

        {/* Quantité */}
        <div className="form-group">
          <label htmlFor="quantite">
            Quantité à approvisionner {product?.unite?.symbol && `(${product.unite.symbol})`} <span className="required">*</span>
          </label>
          <div className="quantity-input">
            <button type="button" onClick={decrementQuantite} className="quantity-btn" disabled={quantite <= 1}>
              <LuMinus />
            </button>
            <input
              type="number"
              id="quantite"
              value={quantite}
              onChange={handleQuantiteChange}
              min="1"
              step="1"
              required
              className="quantity-field"
            />
            <button type="button" onClick={incrementQuantite} className="quantity-btn">
              <LuPlus />
            </button>
          </div>
          <small className="field-hint">La quantité sera ajoutée au stock actuel.</small>
        </div>

        {/* Prix d'achat */}
        <div className="form-group">
          <label htmlFor="prixAchat">
            Prix d'achat unitaire (Ar) <span className="required">*</span>
          </label>
          <div className="input-wrapper">
            <LuDollarSign className="input-icon" />
            <input
              type="number"
              id="prixAchat"
              value={prixAchat}
              onChange={e => setPrixAchat(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              required
              step="1"
            />
          </div>
          {isAdmin && prixAchat !== product?.prixAchat && (
            <div className="info-text">
              <LuInfo size={14} /> Le nouveau prix d'achat sera utilisé pour cette transaction.
            </div>
          )}
        </div>

        {/* Transport */}
        <div className="form-group">
          <label htmlFor="transport">Frais de transport (Ar)</label>
          <div className="input-wrapper">
            <LuTruck className="input-icon" />
            <input
              type="number"
              id="transport"
              value={transport}
              onChange={e => setTransport(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              step="1"
            />
          </div>
          <small className="field-hint">Frais de transport unitaires pour cette livraison.</small>
        </div>

        {/* Mode de paiement */}
        <div className="form-group">
          <label>Mode de paiement <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {PAYMENT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMethod(opt.value)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: `2px solid ${method === opt.value ? '#05aa65' : '#e0e0e0'}`,
                  background: method === opt.value ? '#05aa65' : 'white',
                  color: method === opt.value ? 'white' : '#2c3e50',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {method !== 'CASH' && (
            <div className="info-text warning">
              <LuInfo size={14} /> Paiement {method} : le compte ne sera pas débité immédiatement.
            </div>
          )}
        </div>

        {/* Résumé */}
        <div className="summary-card">
          <h3>Résumé</h3>
          <div className="summary-row">
            <span>Stock actuel :</span>
            <strong>{product?.quantite.toLocaleString()} unités</strong>
          </div>
          <div className="summary-row highlight">
            <span>Quantité à ajouter :</span>
            <strong className="highlight-value">+ {quantite} unités</strong>
          </div>
          <div className="summary-divider" />
          <div className="summary-row total-new">
            <span>Nouveau stock :</span>
            <strong>{nouvelleQuantite.toLocaleString()} unités</strong>
          </div>
          <div className="summary-subsection">
            <h4>Détail financier</h4>
            <div className="summary-row">
              <span>Prix unitaire :</span>
              <strong>{prixAchat.toLocaleString()} Ar</strong>
            </div>
            <div className="summary-row">
              <span>Sous-total :</span>
              <strong>{(prixAchat * quantite).toLocaleString()} Ar</strong>
            </div>
            {transport > 0 && (
              <div className="summary-row">
                <span>Transport :</span>
                <strong>{transport.toLocaleString()} Ar</strong>
              </div>
            )}
            <div className="summary-row total">
              <span>Total :</span>
              <strong>{montantTotal.toLocaleString()} Ar</strong>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(`/stock/${id}`)}>
            Annuler
          </button>
          <button type="submit" className="submit-btn" disabled={submitting || !idEntrepot || !idUniteEntree}>
            {submitting ? (
              <><LuRefreshCw className="spinning" /> Traitement...</>
            ) : (
              <><LuCircleCheck /> Valider l'approvisionnement</>
            )}
          </button>
        </div>
      </form>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <LuCircleAlert size={48} color="#05aa65" />
            <h2>Confirmer l'approvisionnement</h2>
            <div className="confirmation-details">
              {[
                ['Produit', product?.nom],
                ['Entrepôt', entrepots.find(e => e.id === idEntrepot) ? `${entrepots.find(e => e.id === idEntrepot)!.ville} — ${entrepots.find(e => e.id === idEntrepot)!.zone}` : '—'],
                ['Quantité', `${quantite} unités`],
                ['Stock actuel', `${product?.quantite} unités`],
                ['Nouveau stock', `${nouvelleQuantite} unités`],
                ['Montant total', `${montantTotal.toLocaleString()} Ar`],
                ['Paiement', method],
              ].map(([label, val]) => (
                <div key={label} className="confirmation-item">
                  <span>{label} :</span>
                  <strong>{val}</strong>
                </div>
              ))}
            </div>
            <div className="modal-actions">
              <button className="cancel-modal-btn" onClick={() => setShowConfirmation(false)}>Annuler</button>
              <button className="confirm-modal-btn" onClick={confirmReappro} disabled={submitting}>
                {submitting ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
