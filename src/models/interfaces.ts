// src/models/interfaces.ts
import type { activite, client, Commande, Compte, compteFinance, conges, facture, Fournisseur, minimizedProfessionModel, Notif, Profession, Transaction } from "./index";

export type userType = 'ADMIN' | 'SUPERADMIN' | 'USER';

export interface LoginR {
  token: string,
  user: {
    id: number,
    nom: string,
    email: string,
    role: userType,
    profession: minimizedProfessionModel
  },
  subscribed: boolean
}

export interface LoginResponse {
  success: boolean,
  data: LoginR,
  offlineMode?: boolean,
  message?: string
}

// export interface Client {
//   id: number;
//   nom: string;
//   email: string;
//   telephone: string;
//   idEntreprise: number;
//   adresse?: string;
//   createdAt?: Date;
// }

// src/models/interfaces.ts (correction)

export interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  idEntreprise: number;
  adresse?: string; // Optionnel car pas dans la réponse
}

export interface Facture {
  id: number;
  numero: string;
  idCommande: number;
  datePaiement: string; // Changé de Date à string (format ISO)
  payed: boolean;
  retard: boolean;
}

export interface Produit {
  id: number;
  numero: string;
  nom: string;
  prixAchat: number;
  prixVente: number;
  type: string;
  quantite: number;
  transport?: number; // Optionnel car présent dans la réponse
  idEntreprise: number;
  idUnite: number;
  paiement?: string; // Optionnel car présent dans la réponse
  timestamp?: string; // Optionnel car présent dans la réponse
}

export interface CommandeResponse {
  id: number;
  idProduit: number;
  idClient: number;
  quantite: number;
  valide: boolean;
  date: string; // Changé de Date à string (format ISO)
  datePaiement: string; // Changé de Date à string (format ISO)
  typePaiement: 'CASH' | 'CARTE' | 'MOBILE_MONEY' | 'CREDIT';
  reference: string;
  produit: Produit;
  factures: Facture[];
  client: Client;
}

export interface detailledClient extends Client {
  commandes: CommandeResponse[];
}

export interface PostUser {
  nom: string,
  email: string,
  password: string,
  idProfession: number,
  role: userType
}

export interface AuthContextType {
  user: {
    token: string,
    user: {
      id: number,
      nom: string,
      email: string,
      role: userType,
      profession: minimizedProfessionModel
    },
    subscribed: boolean
  } | null;
  login: (token: string, user: any) => Promise<void>;
  logout: () => Promise<void>;
  offlineMode: boolean;
  token: string | null;
}

export interface identifiedProduct {
  nom: string,
  numero: string,
  prixAchat: number
}

export interface ProductResponse {
  success: boolean,
  data?: Produit,
  message?: string
}

export type TypeConge = 'ANNUEL' | 'MALADIE' | 'MATERNITE' | 'PATERNITE' | 'SANS_SOLDE';

export interface NewConge {
  idUser: number;
  type: TypeConge;
  dateDebut: string;
  dateFin: string;
  motif?: string;
}

export interface ResponseConge {
  success: boolean;
  message?: string;
  data?: any;
}

export interface CompteResultat {
  annee: string;
  chiffreAffaires: number;
  depenses: {
    achats: number;
    transport: number
  };
  margeBrute: number;
  margeBrutePourcentage: string;
  valeurAjoutee: number;
  ebe: number;
  resultatExploitation: number;
  resultatNet: number;
}

export interface BilanComptable {
  annee: string;
  actif: {
    stockValorise: number;
    creancesClients: number;
    creancesClientsDetail: {
      totalNonPaye: number;
      totalEnRetard: number;
      commandesNonPayees: Array<{ id: number; montant: number; retard: boolean }>;
    };
    tresorerie: number;
    totalActif: number;
  };
  passif: {
    dettesFournisseurs: number;
    capitauxPropres: number;
    totalPassif: number;
  };
}

export interface Bilan {}
export interface FiStats {}

export interface FinanceState {
  weekly: Bilan | null;
  monthly: Bilan | null;
  annually: Bilan | null;
  general: FiStats | null;
  account: compteFinance | null;
  transactions: Transaction[];
  compteResultat: CompteResultat | null;
  bilanComptable: BilanComptable | null;
  loading: boolean;
  error: string | null;
}

export interface NotifResponse {
  notifications: Notif[];
  unreadCount: number;
}

export interface BonCommande {
  fournisseur: Fournisseur;
  produit: Produit;
  paiement: "CASH" | "CREDIT";
  transport: number;
}

export interface BonCommandeData {
  produit: {
    numero: string;
    nom: string;
    type: string;
    prixAchat: number;
    prixVente: number;
    quantite: number;
    idEntreprise: number;
  };
  fournisseur: {
    nom: string;
    telephone: string;
    nif: string;
    stat: string;
    email: string;
  };
  paiement: 'CASH' | 'CREDIT';
  transport: number;
}

// src/models/interfaces.ts (ajouts)

export interface Offre {
  id?: number;
  services: string;
  montant: string;
  duree: "MENSUELLE" | "ANNUELLE";
}

export interface Abonnement {
  id?: number;
  idEntreprise?: number;
  reference: string;
  idOffre?: number;
  date: Date | string;
  endDate: Date | string;
  offre: Offre;
  entreprise?: {
    id: number;
    nom: string;
    email: string;
  };
  statut?: 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE';
}

// src/models/interfaces.ts (ajouts)

export interface UserProfile {
  id: number;
  nom: string;
  email: string;
  role: 'ADMIN' | 'SUPERADMIN' | 'USER';
  profession: {
    id: number;
    poste: string;
    salaire: number;
    idEntreprise: number;
  };
  entreprise: {
    id: number;
    nom: string;
    email: string;
    ref: string;
    activite: string;
  };
  boolcnaps?: boolean;
  numeroCnaps?: string;
  dateEmbauche?: string;
  telephone?: string;
  adresse?: string;
}

export interface UserActivity {
  id: number;
  idUser: number;
  action: string | {
    type: string;
    data?: any;
  };
  date: string;
  superAdmin: boolean;
}

export interface synthetisedActivite {
  id: number;
  action: {
    type: string;
    data?: any;
  };
  date: string;
}

export interface CongesData {
  conges: Array<{
    id: number;
    dateDebut: string;
    dateFin: string;
    valide: boolean;
    type?: string;
  }>;
  solde: number;
}