import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Modal, 
  TouchableOpacity, 
  Switch,
  Pressable,
  Platform
} from 'react-native';
import { X, Shield, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { CollaboratorPermissions, CollaboratorRole } from '@/types/project';
import Button from './Button';

interface CollaboratorPermissionsModalProps {
  visible: boolean;
  onClose: () => void;
  permissions: CollaboratorPermissions;
  onSave: (permissions: CollaboratorPermissions) => void;
  role: CollaboratorRole;
  collaboratorName: string;
  isLoading?: boolean;
}

export default function CollaboratorPermissionsModal({
  visible,
  onClose,
  permissions,
  onSave,
  role,
  collaboratorName,
  isLoading = false
}: CollaboratorPermissionsModalProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  
  const [tempPermissions, setTempPermissions] = React.useState<CollaboratorPermissions>(permissions);
  
  // 重置臨時權限當組件打開時
  React.useEffect(() => {
    if (visible) {
      setTempPermissions(permissions);
    }
  }, [visible, permissions]);
  
  // 切換單個權限
  const togglePermission = (key: keyof CollaboratorPermissions) => {
    setTempPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // 獲取權限組標題
  const getPermissionGroupTitle = (group: string): string => {
    switch (group) {
      case 'project':
        return '專案權限';
      case 'records':
        return '排放記錄權限';
      case 'data':
        return '數據與報告權限';
      default:
        return '其他權限';
    }
  };
  
  // 獲取權限項目標題
  const getPermissionTitle = (key: keyof CollaboratorPermissions): string => {
    switch (key) {
      case 'viewProject':
        return '查看專案';
      case 'editProject':
        return '編輯專案資訊';
      case 'deleteProject':
        return '刪除專案';
      case 'manageCollaborators':
        return '管理協作者';
      case 'manageBudget':
        return '管理預算';
      case 'viewRecords':
        return '查看排放記錄';
      case 'addRecords':
        return '添加排放記錄';
      case 'editRecords':
        return '編輯排放記錄';
      case 'deleteRecords':
        return '刪除排放記錄';
      case 'exportData':
        return '導出數據';
      case 'generateReports':
        return '生成報告';
      default:
        return String(key);
    }
  };
  
  // 獲取權限描述
  const getPermissionDescription = (key: keyof CollaboratorPermissions): string => {
    switch (key) {
      case 'viewProject':
        return '可以查看專案詳情和基本資訊';
      case 'editProject':
        return '可以編輯專案名稱、描述、時間等資訊';
      case 'deleteProject':
        return '可以永久刪除整個專案及其所有數據';
      case 'manageCollaborators':
        return '可以添加、編輯和移除協作者';
      case 'manageBudget':
        return '可以設置和修改專案預算和碳排放預算';
      case 'viewRecords':
        return '可以查看所有碳排放記錄';
      case 'addRecords':
        return '可以添加新的排放記錄';
      case 'editRecords':
        return '可以編輯現有的排放記錄';
      case 'deleteRecords':
        return '可以刪除排放記錄';
      case 'exportData':
        return '可以導出專案數據';
      case 'generateReports':
        return '可以生成專案分析報告';
      default:
        return '';
    }
  };
  
  // 將所有權限分組
  const permissionGroups = {
    project: ['viewProject', 'editProject', 'deleteProject', 'manageCollaborators', 'manageBudget'],
    records: ['viewRecords', 'addRecords', 'editRecords', 'deleteRecords'],
    data: ['exportData', 'generateReports']
  };
  
  // 處理保存
  const handleSave = () => {
    onSave(tempPermissions);
  };
  
  // 渲染權限開關
  const renderPermissionSwitch = (key: keyof CollaboratorPermissions) => (
    <View key={key} style={styles.permissionItem}>
      <View style={styles.permissionInfo}>
        <Text style={[styles.permissionTitle, { color: theme.text }]}>
          {getPermissionTitle(key)}
        </Text>
        <Text style={[styles.permissionDescription, { color: theme.secondaryText }]}>
          {getPermissionDescription(key)}
        </Text>
      </View>
      <Switch
        value={tempPermissions[key]}
        onValueChange={() => togglePermission(key)}
        trackColor={{ false: theme.border, true: theme.primary + '80' }}
        thumbColor={tempPermissions[key] ? theme.primary : theme.secondaryText}
      />
    </View>
  );
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Shield size={20} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                權限設置
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.text} />
            </Pressable>
          </View>
          
          <View style={styles.collaboratorInfo}>
            <Text style={[styles.collaboratorName, { color: theme.text }]}>
              {collaboratorName}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.primary + '20' }]}>
              <Text style={[styles.roleText, { color: theme.primary }]}>
                {role}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoBox}>
            <Info size={16} color={theme.secondary} />
            <Text style={[styles.infoText, { color: theme.secondary }]}>
              自定義權限將覆蓋角色默認權限
            </Text>
          </View>
          
          <ScrollView style={styles.scrollView}>
            {Object.entries(permissionGroups).map(([group, keys]) => (
              <View key={group} style={styles.permissionGroup}>
                <Text style={[styles.permissionGroupTitle, { color: theme.primary }]}>
                  {getPermissionGroupTitle(group)}
                </Text>
                {keys.map(key => renderPermissionSwitch(key as keyof CollaboratorPermissions))}
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.actions}>
            <Button
              title="取消"
              onPress={onClose}
              variant="outline"
              size="medium"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="保存"
              onPress={handleSave}
              variant="primary"
              size="medium"
              loading={isLoading}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContainer: {
    width: '95%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        // Web 特定樣式
      }
    })
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)'
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8
  },
  closeButton: {
    padding: 4
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500'
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
    borderRadius: 8,
    marginVertical: 12
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8
  },
  scrollView: {
    marginTop: 8
  },
  permissionGroup: {
    marginBottom: 16
  },
  permissionGroupTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  permissionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)'
  },
  permissionInfo: {
    flex: 1,
    marginRight: 12
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4
  },
  permissionDescription: {
    fontSize: 12
  },
  actions: {
    flexDirection: 'row',
    marginTop: 16
  }
}); 