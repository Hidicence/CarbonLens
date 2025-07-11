/**
 * 項目和排放相關類型定義
 */

import type { BaseEntity, CreatedEntity, ID, Timestamp } from './base';

// ===== 基礎枚舉類型 =====

export type ProjectStatus = 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled';
export type ProductionStage = 'pre-production' | 'production' | 'post-production';
export type AllocationMethod = 'equal' | 'budget' | 'duration' | 'custom';
export type CollaboratorRole = 'owner' | 'admin' | 'editor' | 'contributor' | 'viewer';

// ===== 分攤相關類型 =====

/**
 * 分攤參數設定
 */
export interface AllocationParameters extends BaseEntity {
  name: string;
  description: string;
  stageAllocations: {
    preProduction: number;   // 前期製作分攤比例 (%)
    production: number;      // 製作期分攤比例 (%)
    postProduction: number;  // 後期製作分攤比例 (%)
  };
  scopeWeights?: {
    scope1: number;          // 範疇1權重
    scope2: number;          // 範疇2權重  
    scope3: number;          // 範疇3權重
  };
  isDefault: boolean;        // 是否為預設參數
}

/**
 * 分攤規則
 */
export interface AllocationRule {
  method: AllocationMethod;
  targetProjects: ID[]; // 目標專案ID列表
  customPercentages?: Record<ID, number>; // 自訂百分比
  parametersId?: ID;   // 使用的分攤參數ID
}

/**
 * 分攤記錄
 */
export interface AllocationRecord extends BaseEntity {
  nonProjectRecordId: ID;
  projectId: ID;
  allocatedAmount: number;
  percentage: number;
  method: AllocationMethod;
}

// ===== 排放記錄類型 =====

/**
 * 非專案碳排放記錄（日常營運排放）
 */
export interface NonProjectEmissionRecord extends CreatedEntity {
  categoryId: ID;
  description: string;
  sourceId?: ID;
  quantity: number;
  unit?: string;
  amount: number;
  date: Timestamp;
  location?: string;
  notes?: string;
  // 分攤相關
  isAllocated: boolean; // 是否要分攤到專案
  allocationRule?: AllocationRule;
  allocations?: AllocationRecord[]; // 分攤記錄
}

/**
 * 專案碳排放記錄（直接歸屬於專案的排放）
 */
export interface ProjectEmissionRecord extends CreatedEntity {
  projectId: ID;
  stage: ProductionStage;
  categoryId: ID;
  description: string;
  sourceId?: ID;
  quantity: number;
  unit?: string;
  amount: number;
  date: Timestamp;
  location?: string;
  notes?: string;
  equipmentList?: string;
  peopleCount?: number;
}

/**
 * 專案排放摘要
 */
export interface ProjectEmissionSummary {
  projectId: ID;
  directEmissions: number; // 直接排放
  allocatedEmissions: number; // 分攤排放
  totalEmissions: number; // 總排放
  directRecordCount: number;
  allocatedRecordCount: number;
  // 新增：生命週期階段排放分析
  stageEmissions?: Record<ProductionStage, number>;
  // 新增：營運分攤到各階段的詳細分配
  operationalAllocation?: {
    'pre-production': number;
    'post-production': number;
    total: number;
  };
}

// ===== 協作者相關類型 =====

/**
 * 權限定義
 */
export interface CollaboratorPermissions {
  canEdit: boolean;             // 可以編輯
  canDelete: boolean;           // 可以刪除
  canInvite: boolean;           // 可以邀請協作者
  canViewReports: boolean;      // 可以查看報告
  canManageCollaborators: boolean; // 可以管理協作者
  
  // 保留舊的權限屬性以便兼容
  viewProject?: boolean;         
  editProject?: boolean;         
  deleteProject?: boolean;       
  manageBudget?: boolean;        
  viewRecords?: boolean;         
  addRecords?: boolean;          
  editRecords?: boolean;         
  deleteRecords?: boolean;       
  exportData?: boolean;          
  generateReports?: boolean;     
}

/**
 * 協作者實體
 */
export interface Collaborator extends BaseEntity {
  name: string;
  email: string;
  role: CollaboratorRole;
  permissions: CollaboratorPermissions;
  avatar?: string;
  // 擴展協作者信息
  joinedAt: Timestamp;         // 加入時間
  lastActive?: Timestamp;      // 最後活動時間
  department?: string;         // 部門
  position?: string;           // 職位
  invitedBy?: ID;              // 邀請人ID
  isActive?: boolean;
}

/**
 * 專案實體
 */
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  location?: string;
  status: ProjectStatus;
  thumbnail?: string;
  color?: string;
  budget?: number;
  carbonBudget?: {
    total: number;
    preProduction?: number;
    production?: number;
    postProduction?: number;
    stages?: Record<ProductionStage, number>;
  };
  // 新的排放統計
  emissionSummary: ProjectEmissionSummary;
  totalEmissions: number;
  collaborators?: Collaborator[];
  // 添加權限相關字段
  isPrivate?: boolean;          // 是否為私有專案
  accessCode?: string;          // 專案訪問碼
}

// ===== 排放源和類別 =====

/**
 * 排放源
 */
export interface EmissionSource extends BaseEntity {
  name: string;
  stage?: ProductionStage; // 對於非專案排放源可以為空
  categoryId: ID;
  unit: string;
  emissionFactor: number;
  description?: string;
  isOperational?: boolean; // 是否為日常營運排放源
}

/**
 * 排放類別
 */
export interface EmissionCategory extends BaseEntity {
  name: string;
  icon: string;
  color: string;
  stage?: ProductionStage; // 對於日常營運類別可以為空
  isOperational?: boolean; // 是否為日常營運類別
  scope?: 1 | 2 | 3; // 碳排放範疇 (1=直接, 2=間接能源, 3=其他間接)
}

// ===== 影視製作相關類型 =====

/**
 * 影視製作組別
 */
export type FilmCrew = 
  | 'director'      // 導演組
  | 'camera'        // 攝影組  
  | 'lighting'      // 燈光組
  | 'sound'         // 收音組
  | 'makeup'        // 梳化組
  | 'costume'       // 服裝組
  | 'props'         // 道具組
  | 'art'           // 美術組
  | 'gaffer'        // 燈光師組
  | 'grip'          // 器材組
  | 'production'    // 製片組
  | 'transport'     // 交通組
  | 'catering'      // 餐飲組
  | 'location'      // 場地組
  | 'post'          // 後期組
  | 'other';        // 其他

/**
 * 拍攝日碳排放記錄
 */
export interface ShootingDayEmission extends BaseEntity {
  projectId: ID;
  shootingDate: Timestamp;     // 拍攝日期
  location: string;            // 拍攝地點
  sceneNumber?: string;        // 場次編號
  crew: FilmCrew;              // 組別
  category: string;            // 排放類別 (交通、設備、餐飲等)
  description: string;         // 描述
  amount: number;              // 排放量 (kg CO₂e)
  quantity?: number;           // 數量
  unit?: string;               // 單位
  notes?: string;              // 備註
}

/**
 * 拍攝日統計
 */
export interface ShootingDayStats {
  date: Timestamp;
  location: string;
  totalEmissions: number;
  crewEmissions: Record<FilmCrew, number>;
  sceneCount: number;
  recordCount: number;
}

/**
 * 組別統計
 */
export interface CrewStats {
  crew: FilmCrew;
  totalEmissions: number;
  recordCount: number;
  averagePerDay: number;
  percentage: number;
}