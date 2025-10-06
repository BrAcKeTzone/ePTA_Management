import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import DashboardCard from "../components/DashboardCard";
import Button from "../components/Button";
import Input from "../components/Input";
import PasswordInput from "../components/PasswordInput";
import Modal from "../components/Modal";
import { formatDate } from "../utils/formatDate";

const ProfilePage = () => {
  const {
    user,
    updateProfile,
    getProfile,
    changePasswordWithOtp,
    sendOtpForPasswordChange,
    loading,
    error,
    clearError,
  } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordStep, setPasswordStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Change Password
  const [otpSent, setOtpSent] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    // Only fetch profile data on initial mount, not on every user change
    const refreshProfile = async () => {
      try {
        await getProfile();
      } catch (error) {
        console.error("Failed to refresh profile:", error);

        // Check if it's a 401 error (authentication failure)
        if (error.response?.status === 401) {
          console.error(
            "Authentication failed, user will be redirected to login"
          );
          // The fetchClient interceptor will handle the redirect to /signin
          // We don't need to do anything else here
          return;
        }

        // For other errors, just log them and continue
        // The error will be displayed in the UI via the error state
      }
    };

    // Only call refreshProfile once on mount if user exists
    if (user && !profileData.name && !profileData.email) {
      refreshProfile();
    }

    // Cleanup function to clear errors when component unmounts
    return () => {
      clearError();
    };
  }, [getProfile, clearError]); // Removed user dependency to prevent frequent calls

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      // Clear any validation errors when user data changes
      setValidationErrors({});
    }
  }, [user]);

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "HR":
        return "HR Manager";
      case "APPLICANT":
        return "Applicant";
      default:
        return role;
    }
  };

  const validateProfileForm = () => {
    const errors = {};

    // Name validation
    if (!profileData.name.trim()) {
      errors.name = "Full name is required";
    } else if (profileData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long";
    }

    // Email validation
    if (!profileData.email.trim()) {
      errors.email = "Email address is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    // Phone validation (optional but if provided, should be valid)
    if (profileData.phone && profileData.phone.trim()) {
      // Remove all non-digit characters except + for counting digits
      const cleanPhone = profileData.phone.replace(/[^\d]/g, "");

      // Flexible phone validation that accepts various formats:
      // - International: +1234567890, +1 234 567 8900
      // - Domestic: 1234567890, 123-456-7890, (123) 456-7890
      // - Various separators: spaces, dashes, dots, parentheses
      const phoneRegex = /^[\+]?[\s]?[\(]?[\d\s\-\.\(\)]{7,}$/;

      // Check if it has reasonable number of digits (7-15 is international standard)
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        errors.phone = "Phone number must contain 7-15 digits";
      } else if (!phoneRegex.test(profileData.phone.trim())) {
        errors.phone = "Please enter a valid phone number format";
      }
    }

    return errors;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess("");
    setValidationErrors({});
    clearError(); // Clear any existing errors

    // Validate form
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsUpdatingProfile(true); // Set local loading state
    try {
      await updateProfile(profileData);
      setIsEditing(false);
      setProfileSuccess("Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);

      // Handle 401 authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed during profile update");
        // The fetchClient interceptor will handle the redirect
        return;
      }

      // Error is already handled in the store and displayed via the error state
    } finally {
      setIsUpdatingProfile(false); // Clear local loading state
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    setIsPasswordLoading(true);
    try {
      await sendOtpForPasswordChange(passwordData.currentPassword);
      setPasswordStep(2);
      setOtpSent(true);
    } catch (error) {
      // Handle 401 authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed during OTP send");
        // The fetchClient interceptor will handle the redirect
        return;
      }

      setPasswordError(error.message || "Failed to send OTP");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (!passwordData.otp) {
      setPasswordError("Please enter the OTP code");
      return;
    }

    setIsPasswordLoading(true);
    try {
      await changePasswordWithOtp(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.otp
      );
      setPasswordSuccess("Password changed successfully!");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
          otp: "",
        });
        setPasswordStep(1);
        setOtpSent(false);
        setPasswordSuccess("");
        setIsPasswordLoading(false);
      }, 2000);
    } catch (error) {
      // Handle 401 authentication errors
      if (error.response?.status === 401) {
        console.error("Authentication failed during password change");
        // The fetchClient interceptor will handle the redirect
        return;
      }

      setPasswordError(error.message || "Failed to change password");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationErrors({});
    setProfileSuccess("");
    setIsUpdatingProfile(false); // Reset local loading state
    clearError();
    // Reset profile data to original values
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  };

  // Show loading state if no user data is available yet
  if (!user && loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no user data and not loading
  if (!user && !loading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Unable to load profile data.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Profile Settings
        </h1>
        <p className="text-gray-600">
          Manage your account information and security settings.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Display */}
      {profileSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {profileSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <DashboardCard title="Personal Information" className="h-fit">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <Input
                  label="Full Name"
                  value={profileData.name}
                  onChange={(e) => {
                    setProfileData({
                      ...profileData,
                      name: e.target.value,
                    });
                    // Clear validation error when user starts typing
                    if (validationErrors.name) {
                      const { name, ...rest } = validationErrors;
                      setValidationErrors(rest);
                    }
                  }}
                  disabled={!isEditing}
                  required
                  placeholder="Enter your full name"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => {
                    setProfileData({ ...profileData, email: e.target.value });
                    // Clear validation error when user starts typing
                    if (validationErrors.email) {
                      const { email, ...rest } = validationErrors;
                      setValidationErrors(rest);
                    }
                  }}
                  disabled={!isEditing}
                  required
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <Input
                  label="Phone Number"
                  value={profileData.phone}
                  onChange={(e) => {
                    setProfileData({
                      ...profileData,
                      phone: e.target.value,
                    });
                    // Clear validation error when user starts typing
                    if (validationErrors.phone) {
                      const { phone, ...rest } = validationErrors;
                      setValidationErrors(rest);
                    }
                  }}
                  disabled={!isEditing}
                  placeholder="Enter your phone number"
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="contents">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={
                      isUpdatingProfile ||
                      Object.keys(validationErrors).length > 0
                    }
                    className="w-full sm:w-auto"
                  >
                    {isUpdatingProfile ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    setIsEditing(true);
                    clearError(); // Clear any existing errors when starting to edit
                  }}
                  className="w-full sm:w-auto"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </DashboardCard>
        </div>

        {/* Account Summary & Security */}
        <div className="space-y-6">
          {/* Account Summary */}
          <DashboardCard title="Account Summary">
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    user?.role === "HR" ? "bg-blue-600" : "bg-green-600"
                  }`}
                >
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase())
                        .slice(0, 2)
                        .join("")
                    : "U"}
                </div>
              </div>

              <div className="text-center">
                <h3 className="font-medium text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-500 break-all">{user?.email}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                    user?.role === "HR"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {getRoleDisplayName(user?.role)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="font-medium">#{user?.id}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex justify-between">
                      <span>Phone:</span>
                      <span className="font-medium">{user.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Member since:</span>
                    <span className="font-medium">
                      {formatDate(user?.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span className="font-medium">
                      {formatDate(user?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Security Settings */}
          <DashboardCard title="Security Settings">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">Password</h4>
                  <p className="text-sm text-gray-600">
                    Last changed:{" "}
                    {formatDate(user?.passwordChangedAt || user?.createdAt)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">Account Status</h4>
                  <p className="text-sm text-gray-600">
                    Your account is active and verified
                  </p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setPasswordError("");
          setPasswordSuccess("");
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
            otp: "",
          });
          setPasswordStep(1);
          setOtpSent(false);
        }}
        title={
          passwordStep === 1
            ? "Change Password - Verify Identity"
            : "Change Password - Set New Password"
        }
      >
        {passwordStep === 1 ? (
          // Step 1: Enter current password and send OTP
          <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-6">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md">
              <p className="text-sm">
                For security, we'll send an OTP to your email to verify the
                password change.
              </p>
            </div>

            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              required
              placeholder="Enter your current password"
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                    otp: "",
                  });
                  setPasswordStep(1);
                  setOtpSent(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isPasswordLoading || !passwordData.currentPassword.trim()
                }
                className="w-full sm:w-auto"
              >
                {isPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </div>
          </form>
        ) : (
          // Step 2: Enter OTP and new password
          <form
            onSubmit={handlePasswordSubmit}
            className="space-y-4 sm:space-y-6"
          >
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {passwordSuccess}
              </div>
            )}

            {otpSent && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <p className="text-sm">
                  OTP has been sent to your email ({user?.email}). Please check
                  your inbox.
                </p>
              </div>
            )}

            <Input
              label="Enter OTP Code"
              name="otp"
              type="text"
              value={passwordData.otp}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  otp: e.target.value,
                })
              }
              required
              placeholder="Enter 6-digit OTP"
              maxLength={6}
            />

            <PasswordInput
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              required
              placeholder="Enter new password (minimum 6 characters)"
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              required
              placeholder="Re-enter your new password"
            />

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordStep(1);
                  setPasswordError("");
                  setPasswordSuccess("");
                  setOtpSent(false);
                }}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isPasswordLoading ||
                  !passwordData.otp.trim() ||
                  !passwordData.newPassword.trim() ||
                  !passwordData.confirmPassword.trim()
                }
                className="w-full sm:w-auto"
              >
                {isPasswordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Changing...
                  </div>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ProfilePage;
