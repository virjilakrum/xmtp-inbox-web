import React, { useState } from "react";
import { useAdvancedInboxStore } from "../../../store/advancedInbox";
import { useTranslation } from "react-i18next";
import { KeyboardShortcut } from "../../../types/xmtpV3Types";

// Simple icon components
const KeyboardIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
    />
  </svg>
);

const QuestionMarkIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const formatKeyboardShortcut = (shortcut: KeyboardShortcut): string => {
  const keys = [];
  if (shortcut.ctrlKey) keys.push("Ctrl");
  if (shortcut.altKey) keys.push("Alt");
  if (shortcut.shiftKey) keys.push("Shift");
  keys.push(shortcut.key.toUpperCase());
  return keys.join(" + ");
};

export const ShortcutHelper: React.FC = () => {
  const { t } = useTranslation();
  const {
    keyboardShortcuts,
    addKeyboardShortcut,
    removeKeyboardShortcut,
    executeShortcut,
  } = useAdvancedInboxStore();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShortcut, setNewShortcut] = useState<Partial<KeyboardShortcut>>({
    key: "",
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    action: "",
    description: "",
    category: "general",
  });

  const categories = [
    { id: "all", name: t("shortcuts.allCategories") },
    { id: "navigation", name: t("shortcuts.navigation") },
    { id: "messaging", name: t("shortcuts.messaging") },
    { id: "formatting", name: t("shortcuts.formatting") },
    { id: "general", name: t("shortcuts.general") },
  ];

  const filteredShortcuts =
    selectedCategory === "all"
      ? keyboardShortcuts
      : keyboardShortcuts.filter(
          (shortcut) => shortcut.category === selectedCategory,
        );

  const groupedShortcuts = filteredShortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(shortcut);
      return acc;
    },
    {} as Record<string, KeyboardShortcut[]>,
  );

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortcut.key && newShortcut.action && newShortcut.description) {
      addKeyboardShortcut({
        key: newShortcut.key,
        ctrlKey: newShortcut.ctrlKey || false,
        shiftKey: newShortcut.shiftKey || false,
        altKey: newShortcut.altKey || false,
        action: newShortcut.action,
        description: newShortcut.description,
        category: newShortcut.category as KeyboardShortcut["category"],
      });

      setNewShortcut({
        key: "",
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        action: "",
        description: "",
        category: "general",
      });
      setShowAddForm(false);
    }
  };

  const handleRemoveShortcut = (shortcutKey: string) => {
    if (window.confirm(t("shortcuts.deleteConfirm"))) {
      removeKeyboardShortcut(shortcutKey);
    }
  };

  const testShortcut = (shortcut: KeyboardShortcut) => {
    executeShortcut(
      shortcut.key,
      shortcut.ctrlKey,
      shortcut.shiftKey,
      shortcut.altKey,
    );
  };

  const defaultShortcuts: KeyboardShortcut[] = [
    {
      key: "n",
      ctrlKey: true,
      action: "new_conversation",
      description: t("shortcuts.newConversation"),
      category: "navigation",
    },
    {
      key: "k",
      ctrlKey: true,
      action: "search",
      description: t("shortcuts.search"),
      category: "navigation",
    },
    {
      key: "Enter",
      ctrlKey: true,
      action: "send_message",
      description: t("shortcuts.sendMessage"),
      category: "messaging",
    },
    {
      key: "b",
      ctrlKey: true,
      action: "bold",
      description: t("shortcuts.bold"),
      category: "formatting",
    },
    {
      key: "i",
      ctrlKey: true,
      action: "italic",
      description: t("shortcuts.italic"),
      category: "formatting",
    },
    {
      key: "Escape",
      action: "close_dialog",
      description: t("shortcuts.closeDialog"),
      category: "general",
    },
    {
      key: "r",
      ctrlKey: true,
      action: "reply",
      description: t("shortcuts.reply"),
      category: "messaging",
    },
    {
      key: "f",
      ctrlKey: true,
      action: "forward",
      description: t("shortcuts.forward"),
      category: "messaging",
    },
    {
      key: "a",
      ctrlKey: true,
      action: "select_all",
      description: t("shortcuts.selectAll"),
      category: "general",
    },
    {
      key: "/",
      action: "focus_search",
      description: t("shortcuts.focusSearch"),
      category: "navigation",
    },
  ];

  return (
    <div className="bg-white h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyboardIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t("shortcuts.title")}
            </h2>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <PlusIcon className="h-4 w-4" />
            {t("shortcuts.add")}
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showAddForm ? (
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("shortcuts.addNew")}
            </h3>
            <form onSubmit={handleAddShortcut} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("shortcuts.key")}
                </label>
                <input
                  type="text"
                  value={newShortcut.key || ""}
                  onChange={(e) =>
                    setNewShortcut({ ...newShortcut, key: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 'a', 'Enter', 'Escape'"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("shortcuts.modifiers")}
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newShortcut.ctrlKey || false}
                      onChange={(e) =>
                        setNewShortcut({
                          ...newShortcut,
                          ctrlKey: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Ctrl
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newShortcut.shiftKey || false}
                      onChange={(e) =>
                        setNewShortcut({
                          ...newShortcut,
                          shiftKey: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Shift
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newShortcut.altKey || false}
                      onChange={(e) =>
                        setNewShortcut({
                          ...newShortcut,
                          altKey: e.target.checked,
                        })
                      }
                      className="mr-2"
                    />
                    Alt
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("shortcuts.action")}
                </label>
                <input
                  type="text"
                  value={newShortcut.action || ""}
                  onChange={(e) =>
                    setNewShortcut({ ...newShortcut, action: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 'send_message', 'new_conversation'"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("shortcuts.description")}
                </label>
                <input
                  type="text"
                  value={newShortcut.description || ""}
                  onChange={(e) =>
                    setNewShortcut({
                      ...newShortcut,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("shortcuts.category")}
                </label>
                <select
                  value={newShortcut.category || "general"}
                  onChange={(e) =>
                    setNewShortcut({
                      ...newShortcut,
                      category: e.target.value as KeyboardShortcut["category"],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="navigation">
                    {t("shortcuts.navigation")}
                  </option>
                  <option value="messaging">{t("shortcuts.messaging")}</option>
                  <option value="formatting">
                    {t("shortcuts.formatting")}
                  </option>
                  <option value="general">{t("shortcuts.general")}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {t("shortcuts.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                  {t("shortcuts.cancel")}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {keyboardShortcuts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <KeyboardIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t("shortcuts.noShortcuts")}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {t("shortcuts.noShortcutsDescription")}
                  </p>
                  <button
                    onClick={() => {
                      defaultShortcuts.forEach((shortcut) =>
                        addKeyboardShortcut(shortcut),
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    {t("shortcuts.loadDefaults")}
                  </button>
                </div>
              </div>
            ) : (
              Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 capitalize">
                    {t(`shortcuts.${category}`)}
                  </h3>
                  <div className="space-y-2">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={`${shortcut.key}-${shortcut.ctrlKey}-${shortcut.shiftKey}-${shortcut.altKey}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-mono">
                                {formatKeyboardShortcut(shortcut)}
                              </kbd>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {shortcut.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                {t("shortcuts.action")}: {shortcut.action}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => testShortcut(shortcut)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-md hover:bg-green-200">
                            {t("shortcuts.test")}
                          </button>
                          <button
                            onClick={() => handleRemoveShortcut(shortcut.key)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded-md">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
