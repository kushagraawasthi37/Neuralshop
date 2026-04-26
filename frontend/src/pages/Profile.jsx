import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth.js";
import { useUiStore } from "../../stores/uiStore.js";
import { MESSAGES } from "../../constants/messages.js";
import Button from "../../components/ui/atoms/Button.jsx";
import Input from "../../components/ui/atoms/Input.jsx";
import Label from "../../components/ui/atoms/Label.jsx";
import Card from "../../components/ui/molecules/Card.jsx";
import Spinner from "../../components/ui/atoms/Spinner.jsx";
import Tabs from "../../components/ui/molecules/Tabs.jsx";

// Validation schemas
const profileSchema = z.object({
  name: z
    .string()
    .min(2, MESSAGES.VALIDATION.NAME_MIN)
    .max(50, MESSAGES.VALIDATION.NAME_MAX),
  email: z
    .string()
    .min(1, MESSAGES.VALIDATION.REQUIRED)
    .email(MESSAGES.VALIDATION.EMAIL),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
    newPassword: z.string().min(8, MESSAGES.VALIDATION.PASSWORD_MIN),
    confirmPassword: z.string().min(1, MESSAGES.VALIDATION.REQUIRED),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: MESSAGES.VALIDATION.PASSWORD_MATCH,
    path: ["confirmPassword"],
  });

/**
 * Profile page component - User profile management
 */
const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { showSuccess, showError } = useUiStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (data) => {
    setIsUpdatingProfile(true);

    try {
      const result = await updateProfile(data);

      if (result.success) {
        showSuccess("Profile updated successfully");
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError(MESSAGES.ERROR.UPDATE_PROFILE);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (result.success) {
        showSuccess("Password changed successfully");
        passwordForm.reset();
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError(MESSAGES.ERROR.CHANGE_PASSWORD);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Information" },
    { id: "password", label: "Change Password" },
    { id: "orders", label: "Order History" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Profile Information Tab */}
        {activeTab === "profile" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Profile Information
            </h2>

            <form
              onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" required>
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    {...profileForm.register("name")}
                    error={!!profileForm.formState.errors.name}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email" required>
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...profileForm.register("email")}
                    error={!!profileForm.formState.errors.email}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...profileForm.register("phone")}
                  error={!!profileForm.formState.errors.phone}
                />
                {profileForm.formState.errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Account Info (Read-only) */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Account Created</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label>Last Updated</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      {user?.updatedAt
                        ? new Date(user.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Updating...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Change Password Tab */}
        {activeTab === "password" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Change Password
            </h2>

            <form
              onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="currentPassword" required>
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register("currentPassword")}
                  error={!!passwordForm.formState.errors.currentPassword}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="newPassword" required>
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register("newPassword")}
                  error={!!passwordForm.formState.errors.newPassword}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" required>
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register("confirmPassword")}
                  error={!!passwordForm.formState.errors.confirmPassword}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Order History Tab */}
        {activeTab === "orders" && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Order History
            </h2>

            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No orders yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                When you place orders, they'll appear here.
              </p>
              <div className="mt-6">
                <Button as={Link} to={ROUTES.PRODUCTS}>
                  Start Shopping
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Tabs>
    </div>
  );
};

export default Profile;
