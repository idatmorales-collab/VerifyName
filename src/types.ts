export type FurnitureCategory =
  | 'Sofás'
  | 'Mesas'
  | 'Sillas'
  | 'Camas'
  | 'Armarios'
  | 'Muebles TV'
  | 'Estanterías'
  | 'Exterior'
  | 'Decoración'
  | 'Iluminación';

export type FurnitureLine =
  | 'Colección Atemporal'
  | 'Línea Moderna'
  | 'Artesanal Macrumo'
  | 'Escandinavo Orgánico'
  | 'Minimalista Urbano'
  | 'Lujo Contemporáneo';

export type NameStatus = 'Activo' | 'Reservado' | 'En Desarrollo' | 'Archivado';

export type UserRole = 'Administrador' | 'Diseñador';

export interface CommentItem {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  date: string;
}

export interface FurnitureName {
  id: string;
  name: string;
  normalizedName: string;
  category: FurnitureCategory;
  line: FurnitureLine;
  materials: string[];
  status: NameStatus;
  origin?: string;
  registeredBy: string;
  registeredByRole: UserRole;
  createdAt: string;
  updatedAt: string;
  description: string;
  dimensions?: string;
  tags: string[];
  favorite?: boolean;
  projectIds?: string[];
  comments?: CommentItem[];
}

export interface ImportRecord {
  id: string;
  fileName: string;
  fileType: string;
  user: string;
  date: string;
  totalCount: number;
  newCount: number;
  duplicateCount: number;
  similarCount: number;
  errorCount: number;
  status: 'Completado' | 'Con advertencias' | 'Fallido';
  details?: {
    importedItems?: Partial<FurnitureName>[];
    skippedNames?: string[];
    similarNames?: string[];
  };
}

export type SimilarityRisk = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export type MatchType = 'EXACT' | 'PHONETIC' | 'FUZZY' | 'CATEGORY_COLLISION' | 'SUBSTRING';

export interface SimilarityMatch {
  targetName: FurnitureName;
  similarityPercentage: number;
  matchType: MatchType;
  reason: string;
}

export interface SimilarityCheckResponse {
  query: string;
  risk: SimilarityRisk;
  riskScore: number;
  matches: SimilarityMatch[];
  isAvailable: boolean;
  recommendation: string;
}

export interface AINameSuggestion {
  id: string;
  name: string;
  etymology: string;
  tagline: string;
  styleNote: string;
  similarityRisk: SimilarityRisk;
  closestMatch?: string | null;
  saved?: boolean;
}

export interface NamingProject {
  id: string;
  title: string;
  description: string;
  category: FurnitureCategory;
  targetDate: string;
  designer: string;
  nameIds: string[];
  color: string;
  status: 'Planificación' | 'En Progreso' | 'Completado';
}

export interface AuditLog {
  id: string;
  action: 'REGISTRATION' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'AI_GENERATED';
  name: string;
  user: string;
  role: UserRole;
  timestamp: string;
  details: string;
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  status: 'Activo' | 'Inactivo';
  createdAt: string;
  lastAccess: string | null;
  avatarUrl?: string;
}

export type ModuleType =
  | 'inicio'
  | 'naming-ai'
  | 'database'
  | 'ai-studio'
  | 'favorites'
  | 'audit'
  | 'dashboard'
  | 'users'
  | 'daily-report'
  | 'importations'
  | 'exportations'
  | 'settings'
  | 'about';

export interface ExternalVerificationMatch {
  source: 'Base Maestra' | 'Web Propia (mueblesmacrumo.com.pe)' | 'Tienda Falabella Perú (Muebles Macrumo)';
  foundName: string;
  url?: string;
  matchType: 'EXACT' | 'SIMILAR';
  details: string;
}

export interface ExternalVerificationResult {
  query: string;
  isAvailable: boolean;
  matches: ExternalVerificationMatch[];
  channelsChecked: {
    masterDatabase: { checked: boolean; found: boolean; count: number };
    webMacrumo: { checked: boolean; found: boolean; count: number; url: string };
    falabella: { checked: boolean; found: boolean; count: number; url: string };
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  status: 'Activo' | 'Inactivo';
  createdAt: string;
  lastAccess: string | null;
  avatarUrl?: string;
}
