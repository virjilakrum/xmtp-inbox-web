import React, { useState } from "react";
import { useAdvancedInboxStore } from "../../../store/advancedInbox";
import { useTranslation } from "react-i18next";
import { NotificationSettings } from "../../../types/xmtpV3Types";

// Simple icon components
const CogIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z"
    />
  </svg>
);

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

export const AdvancedSettings: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, updateNotificationSettings, updateUserSettings } =
    useAdvancedInboxStore();
  const [activeSection, setActiveSection] = useState("notifications");

  const handleNotificationChange = (
    key: keyof NotificationSettings,
    value: any,
  ) => {
    if (currentUser) {
      const updatedSettings = {
        ...currentUser.settings.notifications,
        [key]: value,
      };
      updateNotificationSettings(updatedSettings);
    }
  };

  const handleUserSettingChange = (
    category: string,
    key: string,
    value: any,
  ) => {
    if (currentUser) {
      updateUserSettings({
        [category]: {
          ...currentUser.settings[
            category as keyof typeof currentUser.settings
          ],
          [key]: value,
        },
      });
    }
  };

  const NotificationSettingsComponent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.notifications.title")}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.notifications.enabled")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.notifications.enabledDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.notifications.enabled || false}
              onChange={(e) =>
                handleNotificationChange("enabled", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.notifications.sound")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.notifications.soundDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.notifications.sound || false}
              onChange={(e) =>
                handleNotificationChange("sound", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.notifications.showPreview")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.notifications.showPreviewDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.notifications.showPreview || false}
              onChange={(e) =>
                handleNotificationChange("showPreview", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.notifications.mentionsOnly")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.notifications.mentionsOnlyDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={
                currentUser?.settings.notifications.mentionsOnly || false
              }
              onChange={(e) =>
                handleNotificationChange("mentionsOnly", e.target.checked)
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceSettingsComponent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.appearance.title")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t("settings.appearance.theme")}
            </label>
            <select
              value={currentUser?.settings.appearance.theme || "auto"}
              onChange={(e) =>
                handleUserSettingChange("appearance", "theme", e.target.value)
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="light">{t("settings.appearance.light")}</option>
              <option value="dark">{t("settings.appearance.dark")}</option>
              <option value="auto">{t("settings.appearance.auto")}</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              {t("settings.appearance.fontSize")}
            </label>
            <select
              value={currentUser?.settings.appearance.fontSize || "medium"}
              onChange={(e) =>
                handleUserSettingChange(
                  "appearance",
                  "fontSize",
                  e.target.value,
                )
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="small">{t("settings.appearance.small")}</option>
              <option value="medium">{t("settings.appearance.medium")}</option>
              <option value="large">{t("settings.appearance.large")}</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.appearance.compactMode")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.appearance.compactModeDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.appearance.compactMode || false}
              onChange={(e) =>
                handleUserSettingChange(
                  "appearance",
                  "compactMode",
                  e.target.checked,
                )
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const PrivacySettingsComponent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t("settings.privacy.title")}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.privacy.readReceipts")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.privacy.readReceiptsDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.privacy.readReceipts || false}
              onChange={(e) =>
                handleUserSettingChange(
                  "privacy",
                  "readReceipts",
                  e.target.checked,
                )
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.privacy.typingIndicators")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.privacy.typingIndicatorsDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.privacy.typingIndicators || false}
              onChange={(e) =>
                handleUserSettingChange(
                  "privacy",
                  "typingIndicators",
                  e.target.checked,
                )
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("settings.privacy.onlineStatus")}
              </label>
              <p className="text-sm text-gray-500">
                {t("settings.privacy.onlineStatusDescription")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={currentUser?.settings.privacy.onlineStatus || false}
              onChange={(e) =>
                handleUserSettingChange(
                  "privacy",
                  "onlineStatus",
                  e.target.checked,
                )
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const sections: SettingsSection[] = [
    {
      id: "notifications",
      title: t("settings.notifications.title"),
      icon: <BellIcon className="h-5 w-5" />,
      component: <NotificationSettingsComponent />,
    },
    {
      id: "appearance",
      title: t("settings.appearance.title"),
      icon: <PaletteIcon className="h-5 w-5" />,
      component: <AppearanceSettingsComponent />,
    },
    {
      id: "privacy",
      title: t("settings.privacy.title"),
      icon: <EyeIcon className="h-5 w-5" />,
      component: <PrivacySettingsComponent />,
    },
  ];

  return (
    <div className="bg-white h-full flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-6">
          <CogIcon className="h-6 w-6 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            {t("settings.title")}
          </h2>
        </div>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}>
              {section.icon}
              <span className="font-medium">{section.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {sections.find((s) => s.id === activeSection)?.component}
      </div>
    </div>
  );
};
