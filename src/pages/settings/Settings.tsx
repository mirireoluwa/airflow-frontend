import { useState, useRef } from 'react';
import { 
  Camera, 
  Eye, 
  EyeOff, 
  X,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
  AlertTriangle,
  Smile
} from 'lucide-react';
import { useAirflow } from '../../context/AirflowContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { UserStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { state, updateUserProfile, updateUserPassword, deleteCurrentUser } = useAirflow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: state.currentUser?.name || '',
    email: state.currentUser?.email || '',
    department: state.currentUser?.department || '',
    interests: state.currentUser?.interests || [],
    status: state.currentUser?.status || 'online' as UserStatus,
    customStatus: state.currentUser?.customStatus || ''
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Interest management
  const [newInterest, setNewInterest] = useState('');

  const statusOptions = [
    { value: 'online', label: '🟢 Online', icon: Wifi },
    { value: 'busy', label: '🔴 Busy', icon: AlertTriangle },
    { value: 'offline', label: '⚫ Offline', icon: WifiOff },
    { value: 'custom', label: '😊 Custom', icon: Smile }
  ];

  const handleProfileUpdate = async () => {
    try {
      await updateUserProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsPasswordLoading(true);
    try {
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Current password is incorrect!' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size must be less than 5MB.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert image to base64 data URL for persistence
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          updateUserProfile({ avatar: dataUrl });
          setMessage({ type: 'success', text: 'Profile photo updated successfully!' });
          setTimeout(() => setMessage(null), 3000);
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        setMessage({ type: 'error', text: 'Failed to process image. Please try again.' });
        setTimeout(() => setMessage(null), 3000);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile photo. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
      setIsUploading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      const updatedInterests = [...profileData.interests, newInterest.trim()];
      setProfileData({ ...profileData, interests: updatedInterests });
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    const updatedInterests = profileData.interests.filter(i => i !== interest);
    setProfileData({ ...profileData, interests: updatedInterests });
  };

  const handleStatusChange = (status: UserStatus) => {
    setProfileData({ 
      ...profileData, 
      status,
      customStatus: status !== 'custom' ? '' : profileData.customStatus
    });
  };

  const handleDeleteAccount = async () => {
    if (!state.currentUser) return;
    if (confirmText !== state.currentUser.email) {
      setMessage({ type: 'error', text: 'Type your email to confirm account deletion.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      deleteCurrentUser();
      navigate('/signup');
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-4xl font-bold text-gradient mb-2 pb-2">Settings</h1>
        <p className="text-lg text-gray-600">Manage your profile, security, and preferences.</p>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Section */}
        <Card variant="flat">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Photo */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="h-24 w-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {state.currentUser?.avatar ? (
                    <img 
                      src={state.currentUser.avatar} 
                      alt="Profile" 
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    state.currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute -bottom-2 -right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                <p className="text-sm text-gray-600">Upload a new profile picture</p>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <Input
              label="Department"
              value={profileData.department}
              onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              disabled={!isEditing}
            />

            {/* Status */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <div className="grid grid-cols-2 gap-3">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleStatusChange(option.value as UserStatus)}
                      disabled={!isEditing}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        profileData.status === option.value
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!isEditing && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {profileData.status === 'custom' && isEditing && (
                <Input
                  label="Custom Status"
                  placeholder="e.g., 🎯 Working on project..."
                  value={profileData.customStatus}
                  onChange={(e) => setProfileData({ ...profileData, customStatus: e.target.value })}
                />
              )}
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Interests</label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add an interest..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  disabled={!isEditing}
                  className="flex-1"
                />
                <Button
                  onClick={addInterest}
                  disabled={!isEditing || !newInterest.trim()}
                  variant="outline"
                  size="sm"
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1 rounded-full"
                  >
                    <span className="text-sm">{interest}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeInterest(interest)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleProfileUpdate} 
                    variant="primary"
                    loading={isUploading}
                    loadingText="Saving..."
                  >
                    Save Changes
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="primary">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card variant="flat">
          <CardHeader>
            <CardTitle>Security & Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {isChangingPassword ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="flex h-12 w-full rounded-xl border border-gray-200/60  bg-white/70  backdrop-blur-sm px-4 py-3 pr-12 text-sm placeholder:text-gray-400  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/90  transition-all duration-200 ease-out"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 "
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="flex h-12 w-full rounded-xl border border-gray-200/60  bg-white/70  backdrop-blur-sm px-4 py-3 pr-12 text-sm placeholder:text-gray-400  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/90  transition-all duration-200 ease-out"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 "
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 ">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="flex h-12 w-full rounded-xl border border-gray-200/60  bg-white/70  backdrop-blur-sm px-4 py-3 pr-12 text-sm placeholder:text-gray-400  focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40 focus:bg-white/90  transition-all duration-200 ease-out"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 "
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button 
                    onClick={handlePasswordChange} 
                    variant="primary"
                    loading={isPasswordLoading}
                    loadingText="Updating..."
                  >
                    Update Password
                  </Button>
                  <Button 
                    onClick={() => setIsChangingPassword(false)} 
                    variant="outline"
                    disabled={isPasswordLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-900 mb-2">Password Security</h4>
                  <p className="text-sm text-gray-600">
                    Keep your password secure and change it regularly to protect your account.
                  </p>
                </div>
                
                <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                  Change Password
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card variant="flat">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">User ID</label>
              <p className="text-gray-900 font-mono">{state.currentUser?.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">AUID</label>
              <p className="text-gray-900">{state.currentUser?.auid || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-gray-900">{state.currentUser ? state.currentUser.role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : ''}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Member Since</label>
              <p className="text-gray-900">Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="flat">
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4 p-4 border border-red-200 rounded-xl bg-red-50">
              <h4 className="font-semibold text-red-700">Delete Account</h4>
              <p className="text-sm text-red-700">
                This action is irreversible. All your data (profile, credentials, notifications) will be removed from this demo app. Type your email to confirm.
              </p>
              <Input
                placeholder="Type your email to confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
              />
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConfirmText('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleDeleteAccount}
                  loading={isDeleting}
                  loadingText="Deleting..."
                >
                  Delete Account
                </Button>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
