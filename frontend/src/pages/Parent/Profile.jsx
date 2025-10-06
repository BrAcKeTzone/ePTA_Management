import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { Card } from "../../components/UI/Card";
import { Button } from "../../components/UI/Button";
import { Input } from "../../components/UI/Input";
import { Modal } from "../../components/UI/Modal";
import { Badge } from "../../components/UI/Badge";

export default function ParentProfile() {
  const { user, updateProfile, loading } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    occupation: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        occupation: user.occupation || "",
        emergencyContact: user.emergencyContact || "",
        emergencyPhone: user.emergencyPhone || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!profileForm.name.trim()) newErrors.name = "Name is required";
    if (!profileForm.email.trim()) newErrors.email = "Email is required";
    if (!profileForm.phone.trim()) newErrors.phone = "Phone is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateProfile(profileForm);
      setIsEditing(false);
    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!passwordForm.currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!passwordForm.newPassword)
      newErrors.newPassword = "New password is required";
    if (passwordForm.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Implement password change API call
      console.log("Changing password...", passwordForm);
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setErrors({ passwordSubmit: error.message });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">
              Manage your personal information and account settings
            </p>
          </div>
          <Button href="/parent/dashboard" variant="outline">
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-3xl">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.name}
              </h3>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <Badge
                variant={
                  user.status === "APPROVED"
                    ? "success"
                    : user.status === "PENDING"
                    ? "warning"
                    : "danger"
                }
              >
                {user.status}
              </Badge>

              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium">{user.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                {user.lastLogin && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Login:</span>
                    <span className="font-medium">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="w-full justify-start"
              >
                🔒 Change Password
              </Button>
              <Button
                href="/parent/attendance"
                variant="outline"
                className="w-full justify-start"
              >
                📊 View Attendance
              </Button>
              <Button
                href="/parent/contributions"
                variant="outline"
                className="w-full justify-start"
              >
                💰 View Contributions
              </Button>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  ✏️ Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      // Reset form to original values
                      setProfileForm({
                        name: user.name || "",
                        email: user.email || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        occupation: user.occupation || "",
                        emergencyContact: user.emergencyContact || "",
                        emergencyPhone: user.emergencyPhone || "",
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProfileUpdate}
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>

            <form
              onSubmit={handleProfileUpdate}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Input
                label="Full Name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                error={errors.name}
                disabled={!isEditing}
                required
              />

              <Input
                label="Email Address"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                error={errors.email}
                disabled={!isEditing}
                required
              />

              <Input
                label="Phone Number"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                error={errors.phone}
                disabled={!isEditing}
                required
              />

              <Input
                label="Occupation"
                value={profileForm.occupation}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, occupation: e.target.value })
                }
                disabled={!isEditing}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Enter your complete address"
                />
              </div>

              <Input
                label="Emergency Contact Name"
                value={profileForm.emergencyContact}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    emergencyContact: e.target.value,
                  })
                }
                disabled={!isEditing}
              />

              <Input
                label="Emergency Contact Phone"
                value={profileForm.emergencyPhone}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    emergencyPhone: e.target.value,
                  })
                }
                disabled={!isEditing}
              />

              {errors.submit && (
                <div className="md:col-span-2">
                  <div className="text-red-600 text-sm">{errors.submit}</div>
                </div>
              )}
            </form>
          </Card>

          {/* My Children */}
          {user.students && user.students.length > 0 && (
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                My Children
              </h3>
              <div className="space-y-4">
                {user.students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-lg">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Grade {student.grade} - {student.section}
                        </p>
                        <p className="text-sm text-gray-500">
                          Student ID: {student.studentId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          student.status === "APPROVED"
                            ? "success"
                            : student.status === "PENDING"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {student.status}
                      </Badge>
                      {student.academicYear && (
                        <p className="text-sm text-gray-500 mt-1">
                          SY {student.academicYear}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Account Settings */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Email Notifications
                  </p>
                  <p className="text-sm text-gray-600">
                    Receive announcements and updates via email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-600">
                    Receive important alerts via SMS
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                currentPassword: e.target.value,
              })
            }
            error={errors.currentPassword}
            required
          />

          <Input
            label="New Password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
            }
            error={errors.newPassword}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm({
                ...passwordForm,
                confirmPassword: e.target.value,
              })
            }
            error={errors.confirmPassword}
            required
          />

          {errors.passwordSubmit && (
            <div className="text-red-600 text-sm">{errors.passwordSubmit}</div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Change Password</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
