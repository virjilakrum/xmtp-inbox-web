import React, { useState } from "react";
import { useAdvancedInboxStore } from "../../../store/advancedInbox";
import { useTranslation } from "react-i18next";
import { ContactInfo } from "../../../types/xmtpV3Types";

// Simple icon components
const UserIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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

const SearchIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const BlockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
    />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
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

export const ContactManagement: React.FC = () => {
  const { t } = useTranslation();
  const {
    contacts,
    addContact,
    updateContact,
    deleteContact,
    blockContact,
    searchContacts,
  } = useAdvancedInboxStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(
    null,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContact, setNewContact] = useState<Partial<ContactInfo>>({
    name: "",
    addresses: [""],
    tags: [],
    notes: "",
  });

  const filteredContacts = searchQuery ? searchContacts(searchQuery) : contacts;

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name && newContact.addresses?.[0]) {
      await addContact({
        name: newContact.name,
        addresses: newContact.addresses.filter((addr) => addr.trim() !== ""),
        phone: newContact.phone,
        email: newContact.email,
        tags: newContact.tags || [],
        notes: newContact.notes || "",
        isBlocked: false,
        conversationIds: [],
      });

      setNewContact({
        name: "",
        addresses: [""],
        tags: [],
        notes: "",
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateContact = async (
    contact: ContactInfo,
    updates: Partial<ContactInfo>,
  ) => {
    await updateContact(contact.id, updates);
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm(t("contacts.deleteConfirm"))) {
      await deleteContact(contactId);
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    }
  };

  const handleBlockContact = async (contactId: string, block: boolean) => {
    await blockContact(contactId, block);
  };

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return t("contacts.neverSeen");

    const now = new Date();
    const diff = now.getTime() - lastSeen.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return t("contacts.today");
    if (days === 1) return t("contacts.yesterday");
    if (days < 7) return t("contacts.daysAgo", { days });
    if (days < 30)
      return t("contacts.weeksAgo", { weeks: Math.floor(days / 7) });
    return t("contacts.monthsAgo", { months: Math.floor(days / 30) });
  };

  return (
    <div className="bg-white h-full flex">
      {/* Sidebar - Contact List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("contacts.title")}
            </h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" />
              {t("contacts.add")}
            </button>
          </div>

          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("contacts.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? t("contacts.noResults") : t("contacts.empty")}
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {contact.avatar ? (
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {contact.name}
                        </h3>
                        {contact.isBlocked && (
                          <BlockIcon className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {contact.addresses[0]}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatLastSeen(contact.lastSeen)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Contact Details or Add Form */}
      <div className="flex-1 overflow-y-auto">
        {showAddForm ? (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t("contacts.addNew")}
            </h3>
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contacts.name")}
                </label>
                <input
                  type="text"
                  value={newContact.name || ""}
                  onChange={(e) =>
                    setNewContact({ ...newContact, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contacts.address")}
                </label>
                <input
                  type="text"
                  value={newContact.addresses?.[0] || ""}
                  onChange={(e) =>
                    setNewContact({
                      ...newContact,
                      addresses: [e.target.value],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contacts.email")}
                </label>
                <input
                  type="email"
                  value={newContact.email || ""}
                  onChange={(e) =>
                    setNewContact({ ...newContact, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contacts.phone")}
                </label>
                <input
                  type="tel"
                  value={newContact.phone || ""}
                  onChange={(e) =>
                    setNewContact({ ...newContact, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contacts.notes")}
                </label>
                <textarea
                  value={newContact.notes || ""}
                  onChange={(e) =>
                    setNewContact({ ...newContact, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {t("contacts.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                  {t("contacts.cancel")}
                </button>
              </div>
            </form>
          </div>
        ) : selectedContact ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  {selectedContact.avatar ? (
                    <img
                      src={selectedContact.avatar}
                      alt={selectedContact.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedContact.name}
                  </h2>
                  <p className="text-gray-500">
                    {selectedContact.addresses[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleBlockContact(
                      selectedContact.id,
                      !selectedContact.isBlocked,
                    )
                  }
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    selectedContact.isBlocked
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}>
                  {selectedContact.isBlocked
                    ? t("contacts.unblock")
                    : t("contacts.block")}
                </button>
                <button
                  onClick={() => handleDeleteContact(selectedContact.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("contacts.details")}
                </h3>
                <div className="space-y-3">
                  {selectedContact.email && (
                    <div>
                      <label className="text-sm text-gray-500">
                        {t("contacts.email")}
                      </label>
                      <p className="text-gray-900">{selectedContact.email}</p>
                    </div>
                  )}
                  {selectedContact.phone && (
                    <div>
                      <label className="text-sm text-gray-500">
                        {t("contacts.phone")}
                      </label>
                      <p className="text-gray-900">{selectedContact.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-500">
                      {t("contacts.lastSeen")}
                    </label>
                    <p className="text-gray-900">
                      {formatLastSeen(selectedContact.lastSeen)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      {t("contacts.conversations")}
                    </label>
                    <p className="text-gray-900">
                      {selectedContact.conversationIds.length}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {t("contacts.notes")}
                </h3>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-700">
                    {selectedContact.notes || t("contacts.noNotes")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t("contacts.selectContact")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
