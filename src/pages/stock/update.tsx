// src/pages/stock/update/[id].tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LuSave, LuArrowLeft, LuPackage, LuDollarSign,
  LuTag, LuHash, LuCircleAlert, LuCircleCheck, LuLoader
} from 'react-icons/lu';
import './update.css';
import BASE_URL from '../../config/ApiConfig';

// ─── Types alignés avec ProduitUpdateInput côté API ──────────────────────────
// ProduitUpdateInput = { nom, prix, type, vente?, finalite, paiement }
// On n'envoie PAS quantite : la quantité est gérée uniquement par les transactions.

interface ProductData {
  id: number;
  numero: string;
  nom: string;
  type: string;
  quantite: number;    // affiché en lecture seule
  prixAchat: number;
  prixVente: number;
  finalite: 'VENTE' | 'MATIERE_PREMIERE';
  paiement: 'CASH' | 'CREDIT' | 'BANK' | 'MOBILE_MONEY' | 'CHECK';
}

// Seuls ces champs sont modifiables via PATCH
interface UpdatePayload {
  nom: string;
  prixAchat: number;
  type: string;
  prixVente: number;
  finalite: 'VENTE' | 'MATIERE_PREMIERE';
  paiement: 'CASH' | 'CREDIT' | 'BANK' | 'MOBILE_MONEY' | 'CHECK';
}

export default function UpdateProductScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);

  const [formData, setFormData] = useState<{
    nom: string;
    type: string;
    prixAchat: string;
    prixVente: string;
    finalite: 'VENTE' | 'MATIERE_PREMIERE';
    paiement: 'CASH' | 'CREDIT' | 'BANK' | 'MOBILE_MONEY' | 'CHECK';
  }>({
    nom: '',
    type: '',
    prixAchat: '',
    prixVente: '',
    finalite: 'VENTE',
    paiement: 'CASH',
  });

  // ── Chargement ──
  useEffect(() => {
    const fetchProduct = async () => {
      if (!token || !id) return;
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/stock/produit/${id}`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error('Erreur lors du chargement du produit');
        const data: ProductData = await res.json();
        setProduct(data);
        setFormData({
          nom: data.nom || '',
          type: data.type || '',
          prixAchat: data.prixAchat?.toString() || '',
          prixVente: data.prixVente?.toString() || '',
          finalite: data.finalite || 'VENTE',
          paiement: data.paiement || 'CASH',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () =>
    formData.nom.trim() !== '' &&
    formData.type.trim() !== '' &&
    formData.prixAchat.trim() !== '' &&
    !isNaN(Number(formData.prixAchat)) &&
    Number(formData.prixAchat) >= 0;

  // ── Soumission ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) { setError('Veuillez remplir tous les champs correctement'); return; }
    if (!token || !id) { setError("Erreur d'authentification"); return; }

    try {
      setSubmitting(true);
      setError(null);

      // ✅ Payload aligné sur ProduitUpdateInput — PAS de quantite
      const payload: UpdatePayload = {
        nom: formData.nom,
        prixAchat: Number(formData.prixAchat),
        type: formData.type,
        prixVente: Number(formData.prixVente) || 0,
        finalite: formData.finalite,
        paiement: formData.paiement,
      };

      const res = await fetch(`${BASE_URL}/stock/produit/${id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }

      setProduct(data.data);
      setSuccess(true);
      setTimeout(() => navigate(`/stock/${id}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  // ── États ──
  if (loading) return (
    <div className="update-product-loading">
      <div className="spinner" />
      <p>Chargement du produit...</p>
    </div>
  );

  if (error && !product) return (
    <div className="update-product-error">
      <LuCircleAlert size={48} />
      <h2>Erreur</h2>
      <p>{error}</p>
      <button onClick={() => navigate('/stock')} className="back-to-list">Retour à la liste</button>
    </div>
  );

  const PAYMENT_OPTIONS = ['CASH', 'CREDIT', 'BANK', 'MOBILE_MONEY', 'CHECK'] as const;
  const margeUnitaire = (Number(formData.prixVente) || 0) - (Number(formData.prixAchat) || 0);

  return (
    <div className="update-product-container">
      <div className="update-header">
        <button className="back-button" onClick={() => navigate(`/stock/${id}`)}>
          <LuArrowLeft size={20} /> Retour
        </button>
        <h1>Modifier le produit</h1>
      </div>

      <div className="update-form-container">
        <form onSubmit={handleSubmit} className="update-form">
          <div className="form-header">
            <div className="product-avatar"><LuPackage size={48} /></div>
            <div className="product-title">
              <h2>{product?.nom}</h2>
              <span className="product-id">
                ID : {product?.id} — Réf : {product?.numero}
              </span>
            </div>
          </div>

          <div className="form-grid">
            {/* Nom */}
            <div className="form-group">
              <label htmlFor="nom"><LuTag className="input-icon" /> Nom du produit</label>
              <input
                type="text" id="nom"
                value={formData.nom}
                onChange={e => handleChange('nom', e.target.value)}
                placeholder="Nom du produit"
                className={!formData.nom && error ? 'error' : ''}
              />
            </div>

            {/* Catégorie */}
            <div className="form-group">
              <label htmlFor="type"><LuHash className="input-icon" /> Catégorie</label>
              <input
                type="text" id="type"
                value={formData.type}
                onChange={e => handleChange('type', e.target.value)}
                placeholder="Ex : Électronique"
                className={!formData.type && error ? 'error' : ''}
              />
            </div>

            {/* Prix d'achat */}
            <div className="form-group">
              <label htmlFor="prix"><LuDollarSign className="input-icon" /> Prix d'achat (Ar)</label>
              <input
                type="number" id="prix" min="0" step="100"
                value={formData.prixAchat}
                onChange={e => handleChange('prixAchat', e.target.value)}
                placeholder="0"
                className={(!formData.prixAchat || Number(formData.prixAchat) < 0) && error ? 'error' : ''}
              />
            </div>

            {/* Prix de vente */}
            <div className="form-group">
              <label htmlFor="prixVente"><LuDollarSign className="input-icon" /> Prix de vente (Ar)</label>
              <input
                type="number" id="prixVente" min="0" step="100"
                value={formData.prixVente}
                onChange={e => handleChange('prixVente', e.target.value)}
                placeholder="0"
              />
            </div>

            {/* Finalité */}
            <div className="form-group">
              <label>Finalité</label>
              <select
                value={formData.finalite}
                onChange={e => handleChange('finalite', e.target.value)}
                style={{ padding: '14px 16px', background: '#f9f9f9', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '15px' }}
              >
                <option value="VENTE">Produit à vendre</option>
                <option value="MATIERE_PREMIERE">Matière première</option>
              </select>
            </div>

            {/* Mode de paiement */}
            <div className="form-group">
              <label>Mode de paiement</label>
              <select
                value={formData.paiement}
                onChange={e => handleChange('paiement', e.target.value)}
                style={{ padding: '14px 16px', background: '#f9f9f9', border: '2px solid #e0e0e0', borderRadius: '12px', fontSize: '15px' }}
              >
                {PAYMENT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Note : quantite est en lecture seule */}
          <div style={{ padding: '12px 16px', background: '#f0f9f4', borderRadius: '10px', fontSize: '13px', color: '#05aa65', marginBottom: '16px' }}>
            La quantité en stock (<strong>{product?.quantite} unités</strong>) ne peut pas être modifiée ici.
            Utilisez le réapprovisionnement ou les transactions pour ajuster le stock.
          </div>

          {error && (
            <div className="form-error">
              <LuCircleAlert size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => navigate(`/stock/${id}`)} disabled={submitting}>
              Annuler
            </button>
            <button type="submit" className="submit-btn" disabled={submitting || !isFormValid()}>
              {submitting ? (
                <><LuLoader className="spinning" size={18} /> Enregistrement...</>
              ) : (
                <><LuSave size={18} /> Enregistrer les modifications</>
              )}
            </button>
          </div>
        </form>

        {/* Sidebar */}
        <div className="info-sidebar">
          <div className="info-card">
            <h3>Règles de modification</h3>
            <ul>
              <li>✓ Nom, catégorie, finalité, paiement modifiables</li>
              <li>✓ Les prix sont en Ariary (Ar)</li>
              <li>✓ La quantité se gère via les transactions</li>
              <li>✓ Le numéro de produit ne peut pas être changé</li>
            </ul>
          </div>

          <div className="stats-card">
            <h3>Statistiques</h3>
            <div className="stat-item">
              <span className="stat-label">Quantité en stock</span>
              <span className="stat-value">{product?.quantite?.toLocaleString()} unités</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Valeur du stock</span>
              <span className="stat-value">
                {((product?.quantite || 0) * (Number(formData.prixAchat) || 0)).toLocaleString()} Ar
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Marge unitaire</span>
              <span className="stat-value" style={{ color: margeUnitaire >= 0 ? '#05aa65' : '#e74c3c' }}>
                {margeUnitaire.toLocaleString()} Ar
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Marge totale</span>
              <span className="stat-value" style={{ color: margeUnitaire >= 0 ? '#05aa65' : '#e74c3c' }}>
                {(margeUnitaire * (product?.quantite || 0)).toLocaleString()} Ar
              </span>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="success-modal">
          <div className="success-content">
            <LuCircleCheck size={48} />
            <h2>Modification réussie !</h2>
            <p>Le produit a été mis à jour avec succès.</p>
            <p className="redirect-note">Redirection vers la page du produit...</p>
          </div>
        </div>
      )}
    </div>
  );
}
