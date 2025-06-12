import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image, 
  TextInput, 
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Keyboard
} from 'react-native';
import { 
  User, 
  Mail, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Check, 
  AlertCircle,
  UserPlus,
  Copy,
  Share2,
  Lock,
  Shield,
  Settings
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useProjectStore } from '@/store/projectStore';
import { Collaborator, CollaboratorRole, CollaboratorPermissions } from '@/types/project';
import Button from './Button';
import CollaboratorPermissionsModal from './CollaboratorPermissionsModal';

interface CollaboratorsListProps {
  projectId: string;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

export default function CollaboratorsList({ projectId, onClose }: CollaboratorsListProps) {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const { 
    getCollaboratorsByProjectId, 
    addCollaborator, 
    updateCollaborator, 
    removeCollaborator,
    getProjectById,
    getDefaultPermissions,
    updateCollaboratorPermissions
  } = useProjectStore();
  
  const collaborators = getCollaboratorsByProjectId(projectId);
  const project = getProjectById(projectId);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<CollaboratorRole>('viewer');
  
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<CollaboratorRole>('viewer');
  
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  const [customPermissions, setCustomPermissions] = useState<CollaboratorPermissions | null>(null);
  
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  // Monitor keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  const handleAddCollaborator = () => {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert('錯誤', '請填寫姓名和電子郵件');
      return;
    }
    
    if (!validateEmail(newEmail)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return;
    }
    
    setIsLoading(true);
    
    // 模擬網絡請求延遲
    setTimeout(() => {
      try {
        // 隨機選擇一個頭像
        const avatars = [
          'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80',
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1061&q=80',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
        ];
        const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
        
        addCollaborator(projectId, {
          name: newName,
          email: newEmail,
          role: newRole,
          avatar: randomAvatar
        });
        
        // 重置表單
        setNewName('');
        setNewEmail('');
        setNewRole('viewer');
        setShowAddForm(false);
        
        Alert.alert('成功', '已新增協作者');
      } catch (error) {
        Alert.alert('錯誤', '新增協作者時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  const handleEditCollaborator = () => {
    if (!editingId) return;
    
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('錯誤', '請填寫姓名和電子郵件');
      return;
    }
    
    if (!validateEmail(editEmail)) {
      Alert.alert('錯誤', '請輸入有效的電子郵件地址');
      return;
    }
    
    setIsLoading(true);
    
    // 模擬網絡請求延遲
    setTimeout(() => {
      try {
        updateCollaborator(projectId, editingId, {
          name: editName,
          email: editEmail,
          role: editRole
        });
        
        setEditingId(null);
        Alert.alert('成功', '已更新協作者資訊');
      } catch (error) {
        Alert.alert('錯誤', '更新協作者時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  const handleRemoveCollaborator = (id: string, name: string) => {
    Alert.alert(
      '移除協作者',
      `確定要移除 ${name} 嗎？`,
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定', 
          onPress: () => {
            setIsLoading(true);
            
            // 模擬網絡請求延遲
            setTimeout(() => {
              try {
                removeCollaborator(projectId, id);
                Alert.alert('成功', '已移除協作者');
              } catch (error) {
                Alert.alert('錯誤', '移除協作者時發生錯誤');
              } finally {
                setIsLoading(false);
              }
            }, 800);
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const startEditing = (collaborator: Collaborator) => {
    setEditingId(collaborator.id);
    setEditName(collaborator.name);
    setEditEmail(collaborator.email);
    setEditRole(collaborator.role);
  };
  
  const cancelEditing = () => {
    setEditingId(null);
  };
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const getRoleLabel = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return '擁有者';
      case 'admin':
        return '管理員';
      case 'editor':
        return '編輯者';
      case 'contributor':
        return '貢獻者';
      case 'viewer':
        return '檢視者';
      default:
        return '未知';
    }
  };
  
  const getRoleColor = (role: CollaboratorRole) => {
    switch (role) {
      case 'owner':
        return Colors.dark.primary;
      case 'admin':
        return '#FF6B6B'; // Red
      case 'editor':
        return '#4ECDC4'; // Teal
      case 'contributor':
        return '#FFD166'; // Yellow
      case 'viewer':
        return '#6C63FF'; // Purple
      default:
        return Colors.dark.secondaryText;
    }
  };
  
  const handleShareProject = () => {
    Alert.alert(
      '分享專案',
      '複製專案邀請連結，或透過其他應用程式分享',
      [
        { 
          text: '複製連結', 
          onPress: () => {
            Alert.alert('成功', '已複製專案邀請連結到剪貼簿');
          }
        },
        { 
          text: '透過其他應用程式分享', 
          onPress: () => {
            Alert.alert('提示', '分享功能即將推出');
          }
        },
        { text: '取消', style: 'cancel' }
      ]
    );
  };
  
  const openPermissionsModal = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setShowPermissionsModal(true);
  };
  
  const handleUpdatePermissions = (permissions: CollaboratorPermissions) => {
    if (!selectedCollaborator) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        updateCollaboratorPermissions(projectId, selectedCollaborator.id, permissions);
        setShowPermissionsModal(false);
        Alert.alert('成功', '已更新協作者權限');
      } catch (error) {
        Alert.alert('錯誤', '更新權限時發生錯誤');
      } finally {
        setIsLoading(false);
      }
    }, 800);
  };
  
  const togglePermission = (permission: keyof CollaboratorPermissions) => {
    if (!customPermissions) return;
    
    setCustomPermissions({
      ...customPermissions,
      [permission]: !customPermissions[permission]
    });
  };
  
  const renderCollaboratorItem = ({ item }: { item: Collaborator }) => {
    const isEditing = editingId === item.id;
    const isOwner = item.role === 'owner';
    
    if (isEditing) {
      return (
        <View style={[styles.collaboratorItem, { backgroundColor: theme.card }]}>
          <View style={styles.editForm}>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>姓名</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="輸入姓名"
                placeholderTextColor={theme.secondaryText}
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>電子郵件</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="輸入電子郵件"
                placeholderTextColor={theme.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>角色</Text>
              <View style={styles.roleOptions}>
                {(['viewer', 'editor'] as CollaboratorRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      { 
                        backgroundColor: editRole === role ? getRoleColor(role) : theme.background,
                        borderColor: editRole === role ? getRoleColor(role) : theme.border
                      }
                    ]}
                    onPress={() => setEditRole(role)}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        { color: editRole === role ? '#FFFFFF' : theme.text }
                      ]}
                    >
                      {getRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.editActions}>
              <Button
                title="取消"
                onPress={cancelEditing}
                variant="outline"
                size="small"
                disabled={isLoading}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="儲存"
                onPress={handleEditCollaborator}
                variant="primary"
                size="small"
                loading={isLoading}
                icon={<Check size={16} color="#FFFFFF" />}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      );
    }
    
    return (
      <View style={[styles.collaboratorItem, { backgroundColor: theme.card }]}>
        <View style={styles.collaboratorInfo}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(item.role) }]}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          
          <View style={styles.collaboratorDetails}>
            <Text style={[styles.collaboratorName, { color: theme.text }]} numberOfLines={1} ellipsizeMode="tail">
              {item.name}
            </Text>
            <Text style={[styles.collaboratorEmail, { color: theme.secondaryText }]} numberOfLines={1} ellipsizeMode="tail">
              {item.email}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) + '20' }]}>
              <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
                {getRoleLabel(item.role)}
              </Text>
            </View>
          </View>
        </View>
        
        {!isOwner && (
          <View style={styles.collaboratorActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openPermissionsModal(item)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Shield size={18} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => startEditing(item)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Edit2 size={18} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleRemoveCollaborator(item.id, item.name)}
              disabled={isLoading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Trash2 size={18} color={theme.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
  if (isLoading && !showAddForm && !editingId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>載入中...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardAvoidView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            專案協作者 ({collaborators.length})
          </Text>
          
          <View style={styles.shareContainer}>
            <Button
              title="分享專案"
              onPress={handleShareProject}
              variant="outline"
              size="small"
              icon={<Share2 size={16} color={theme.primary} />}
            />
          </View>
        </View>
        
        {collaborators.length > 0 ? (
          <FlatList
            data={collaborators}
            renderItem={renderCollaboratorItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              keyboardVisible && { paddingBottom: 200 }
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          />
        ) : (
          <View style={[styles.emptyContainer, { backgroundColor: theme.card }]}>
            <User size={40} color={theme.secondaryText} />
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              尚未有協作者
            </Text>
          </View>
        )}
        
        {showAddForm ? (
          <ScrollView 
            style={[styles.addFormScrollView, { backgroundColor: theme.card }]}
            contentContainerStyle={[
              styles.addFormScrollContent,
              keyboardVisible && { paddingBottom: 200 }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          >
            <View style={styles.addFormHeader}>
              <Text style={[styles.addFormTitle, { color: theme.text }]}>新增協作者</Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                disabled={isLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>姓名</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newName}
                onChangeText={setNewName}
                placeholder="輸入姓名"
                placeholderTextColor={theme.secondaryText}
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>電子郵件</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="輸入電子郵件"
                placeholderTextColor={theme.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>角色</Text>
              <View style={styles.roleOptions}>
                {(['viewer', 'contributor', 'editor', 'admin'] as CollaboratorRole[]).map((role) => (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.roleOption,
                      { 
                        backgroundColor: newRole === role ? getRoleColor(role) : theme.background,
                        borderColor: newRole === role ? getRoleColor(role) : theme.border
                      }
                    ]}
                    onPress={() => setNewRole(role)}
                    disabled={isLoading}
                  >
                    <Text
                      style={[
                        styles.roleOptionText,
                        { color: newRole === role ? '#FFFFFF' : theme.text }
                      ]}
                    >
                      {getRoleLabel(role)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.infoContainer}>
              <AlertCircle size={16} color={theme.secondary} />
              <Text style={[styles.infoText, { color: theme.secondary }]}>
                編輯者可以新增和編輯記錄，檢視者只能查看專案資料。
              </Text>
            </View>
            
            <Button
              title="新增協作者"
              onPress={handleAddCollaborator}
              variant="primary"
              loading={isLoading}
              icon={<UserPlus size={16} color="#FFFFFF" />}
            />
          </ScrollView>
        ) : (
          <Button
            title="新增協作者"
            onPress={() => setShowAddForm(true)}
            variant="primary"
            icon={<Plus size={16} color="#FFFFFF" />}
            style={styles.addButton}
          />
        )}
        
        {/* 權限管理模態框 */}
        {selectedCollaborator && (
          <CollaboratorPermissionsModal
            visible={showPermissionsModal}
            onClose={() => setShowPermissionsModal(false)}
            permissions={selectedCollaborator.permissions || getDefaultPermissions(selectedCollaborator.role)}
            onSave={handleUpdatePermissions}
            role={selectedCollaborator.role}
            collaboratorName={selectedCollaborator.name}
            isLoading={isLoading}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidView: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  shareContainer: {
    flexDirection: 'row',
  },
  list: {
    flex: 1,
    marginBottom: 16,
    width: '100%',
  },
  listContent: {
    paddingBottom: 8,
  },
  collaboratorItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    width: '100%',
  },
  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  collaboratorDetails: {
    marginLeft: 12,
    flex: 1,
    flexShrink: 1,
  },
  collaboratorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  collaboratorEmail: {
    fontSize: 14,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  collaboratorActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
    right: 12,
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  addButton: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  addFormScrollView: {
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: isSmallScreen ? '60%' : '70%',
    width: '100%',
  },
  addFormScrollContent: {
    padding: 16,
  },
  addFormHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  addFormTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    width: '100%',
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  roleOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  editForm: {
    padding: 8,
    width: '100%',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
});