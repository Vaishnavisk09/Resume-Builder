import React, { useState } from 'react';
import { User, Mail, Lock, Trash2, LogOut, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import { getInitials } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    try {
      const res = await authAPI.updateProfile({ name: profileForm.name, email: profileForm.email });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwForm({ current: '', newPw: '', confirm: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally { setSavingPw(false); }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you absolutely sure? This will permanently delete your account and ALL your resumes. This action cannot be undone.'
    );
    if (!confirmed) return;
    try {
      await authAPI.deleteAccount();
      logout();
      navigate('/');
      toast.success('Account deleted');
    } catch { toast.error('Delete failed. Try again.'); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="page-title mb-6">Profile & Settings</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {/* Avatar card */}
          <div className="card p-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              {getInitials(user?.name || 'U')}
            </div>
            <p className="font-bold text-main-text">{user?.name}</p>
            <p className="text-secondary-text text-sm mt-0.5 truncate">{user?.email}</p>
            <p className="text-xs text-secondary-text mt-2">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently'}
            </p>
          </div>

          {/* Nav */}
          <div className="card p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left
                  ${activeTab === id ? 'bg-primary text-white' : 'text-secondary-text hover:bg-gray-50 hover:text-main-text'}`}>
                <Icon size={16} />
                {label}
              </button>
            ))}
            <button onClick={() => { logout(); navigate('/'); toast.success('Logged out'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-text hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="card p-6">
              <h2 className="section-title mb-6">Personal Information</h2>
              <form onSubmit={handleProfileSave} className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input className="input pl-10" value={profileForm.name}
                      onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input type="email" className="input pl-10" value={profileForm.email}
                      onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</span>
                  ) : <><Save size={16} /> Save Changes</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card p-6">
              <h2 className="section-title mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
                <div>
                  <label className="label">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input type={showPw.current ? 'text' : 'password'} className="input pl-10 pr-10"
                      value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-text">
                      {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input type={showPw.new ? 'text' : 'password'} className="input pl-10 pr-10"
                      value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} />
                    <button type="button" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary-text">
                      {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="label">Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input type="password" className="input pl-10"
                      value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
                  </div>
                </div>
                {pwForm.newPw && pwForm.confirm && (
                  <div className={`flex items-center gap-2 text-xs ${pwForm.newPw === pwForm.confirm ? 'text-green-600' : 'text-red-500'}`}>
                    {pwForm.newPw === pwForm.confirm ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    {pwForm.newPw === pwForm.confirm ? 'Passwords match' : 'Passwords do not match'}
                  </div>
                )}
                <button type="submit" disabled={savingPw} className="btn-primary disabled:opacity-60">
                  {savingPw ? 'Changing...' : <><Lock size={16} /> Change Password</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="card p-6 border-red-200">
              <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
              <p className="text-secondary-text text-sm mb-6">
                These actions are permanent and cannot be undone. Please be certain before proceeding.
              </p>
              <div className="border border-red-200 rounded-xl p-5 bg-red-50">
                <h3 className="font-bold text-main-text mb-1">Delete Account</h3>
                <p className="text-secondary-text text-sm mb-4">
                  Permanently delete your account, all your resumes, and all associated data. This action cannot be reversed.
                </p>
                <button onClick={handleDeleteAccount}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                  <Trash2 size={15} /> Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
