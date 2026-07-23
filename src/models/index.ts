export interface UserLoginData {
    success: true,
    data: {
        token: string,
        user: UserAfterLoginData
    },
    message: string
}

export interface UserAfterLoginData {
    id: 0,
    nom: string,
    email: string,
    mdp: string,
    idProfession: 0,
    role: "ADMIN" | "SUPERADMIN" | "USER",
    profession: {
        poste: string
        entreprise: {
            id: 0,
            nom: string
        }
    },
}

export interface Entreprise {
    id: number,
    nom: string,
    email: string,
    activite: string,
    ref: string,
    idCompte: number
}
export interface Entrepot{
    ville:string;
    zone:string;
    id:number;
}
export interface Stock {
    id:number;
    reference: string;
    quantite: number;
    transport:number;
    dateDepot:Date;
    entrepot: Entrepot;
}
export interface Produit {
    id: number,
    numero: string,
    nom: string,
    prixAchat: number,
    prixVente: number,
    type: string,
    Stock: Stock[]
}

export interface Unite {
  id: number;
  nom_unite: string;
  symbol: string;
  type: string;
  base_unit: string;
  valeur_conversion: number;
}

export interface ProduitById {
    id: number,
    numero: string,
    nom: string,
    prixAchat: number,
    prixVente: number,
    quantite: number
    type: string,
    idUnite: number,       // ✅ ajouté
    unite: Unite,          // ✅ ajouté
    transactions: Transaction[],
    commandes: Commande[]
    Stock: Stock[]
}

// Copied from models.ts
export type UserRole = 'ADMIN' | 'SUPERADMIN' | 'USER';

export interface Utilisateur {
    id: number;
    nom: string;
    email: string;
    role: UserRole;
    idProfession: number;
}

export interface Produit {
    id: number,
    numero: string,
    nom: string,
    prixAchat: number,
    prixVente: number,
    type: string,
    quantite: number,
    idEntreprise: number
}

export type TransactionType = 'ENTREE' | 'SORTIE';

export interface Transaction {
    id?: number;
    produitId: number;
    type: TransactionType | string;
    quantite: number;
    date: Date;
    prixUnitaire: number;
    ref: string;
}

export interface Commande {
    id: number
    idProduit: number
    idClient: number
    quantite: number
    valide: Boolean
    date: Date
    datePaiement: Date
}

export interface facture {
    id: number,
    numero: string,
    idCommande: number,
    datePaiement: Date,
    payed: boolean,
    retard: boolean
}

export interface entreprise {
    id: number,
    nom: string,
    email: string,
    ref: string,
    activite: string
}

export interface minimizedProfessionModel {
    poste: string,
    entreprise?: entreprise
    idEntreprise: number
}

export interface client {
    id: number,
    nom: string,
    email: string,
    telephone: string,
    idEntreprise: number
}

export interface conges {
    id: number
    idUser: number
    dateDebut: Date
    dateFin: Date
}

export interface Profession {
    id: number,
    poste: string,
    salaire: number,
    idEntreprise: number
}

export interface activite {
    id: number,
    idUser: number,
    action: string,
    date: Date,
    superAdmin: boolean
}

export interface Abonnement {
    id?: number;
    idEntreprise?: number;
    reference: string;
    idOffre?: number;
    date: Date;
    endDate: Date;
    offre: Offre;
}

export interface Offre {
    id?: number,
    services: string,
    montant: string,
    duree: "MENSUELLE" | "ANNUELLE"
}

export interface Compte {
    id: number,
    montant: number,
    idEntreprise: number,
    updatedIn: Date
}

export interface compteFinance {
    depenses: {
        marchandises: number
        total: number
        transport: number
    }
    solde: number
    soldeInitial: number
    ventes: number
}

export interface Notif {
    id: number;
    idEntreprise: number;
    type: "AJOUT_PRODUIT" | "APPROVISIONNEMENT" | "COMMANDE";
    titre: string;
    message: string;
    data?: JSON;
    createdAt: Date
}

export interface Fournisseur {
    nom: string;
    email: string;
    telephone: string;
    nif: string;
    stat: string;
}

export interface TransactionCompte {
    montant: number,
    motif: string
}

// src/types/formation.types.ts
export interface Formation {
    id: number;
    titre: string;
    description: string | null;
    miniature: string | null;
    dureeMinutes: number;
    estPublique: boolean;
    idEntreprise: number | null;
    createdAt: string;
    updatedAt: string;
    lecons?: Lecon[];
    suivi?: SuiviFormation;
}

export interface Lecon {
    id: number;
    idFormation: number;
    titre: string;
    ordre: number;
    format: 'TEXTE' | 'VIDEO' | 'IMAGE';
    contenuTexte: string | null;
    urlVideo: string | null;
    urlImage: string | null;
    paragraphes?: Paragraphe[];
}

export interface Paragraphe {
    id: number;
    titre: string;
    texte: string;
    fichierMedia: string;
    idLecon: number;
}

export interface SuiviFormation {
    id: number;
    idUtilisateur: number;
    idFormation: number;
    statut: 'NON_COMMENCE' | 'EN_COURS' | 'TERMINE' | 'CERTIFIE';
    progressionPourcent: number;
    tempsPasseSecondes: number;
    derniereLecon: number;
    dateDebut: string | null;
    dateCompletion: string | null;
    certificatDelivre: boolean;
    lienCertificat: string | null;
}

export interface CreateSuiviDTO {
    idFormation: number;
}

export interface UpdateSuiviDTO {
    progressionPourcent?: number;
    tempsPasseSecondes?: number;
    derniereLecon?: number;
    statut?: 'NON_COMMENCE' | 'EN_COURS' | 'TERMINE' | 'CERTIFIE';
}

// src/models/index.ts - Ajoutez ou mettez à jour ces interfaces

export interface EntrepotProduit {
    id: number;
    reference: string;
    quantite: number;
    transport: number;
    dateDepot: string;
    produit: {
        id: number;
        nom: string;
        numero: string;
        prixVente: number;
        type: string;
        prixAchat: number;
        quantite: number;
    };
}

export interface Entrepot {
    id: number;
    ville: string;
    zone: string;
    idEntreprise: number;
    Stock?: EntrepotProduit[];
    produits?: EntrepotProduit[];
}