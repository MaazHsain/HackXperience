import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useGroups } from "../hooks/useGroups";
import { useInvitation } from "../hooks/useInvitation";
import { useManageInvitation } from "../hooks/useManageInvitation";
import { toast } from "react-toastify";
import { useCreateGroup } from "../hooks/useCreateGroup";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { data: groups, isLoading, error } = useGroups();
  const { data: invitations, isLoading: isInvitesLoading } = useInvitation();
  const { mutate: createGroup, isPending } = useCreateGroup();
  const { acceptInvite, rejectInvite } = useManageInvitation();

  const [showModal, setShowModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  const [invitedMembers, setInvitedMembers] = useState([]);

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Handles Adding Email on Enter Key or Button Click
  const handleAddMember = () => {
    if (!email.trim()) return;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!invitedMembers.includes(email)) {
      setInvitedMembers([...invitedMembers, email]);
      setEmail("");
    }
  };

  // Handles Removing an Invited Member
  const handleRemoveMember = (email) => {
    setInvitedMembers(invitedMembers.filter((member) => member !== email));
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Group name cannot be empty.");
      return;
    }

    createGroup(
      { groupName, invitedMembers },
      {
        onSuccess: () => {
          setGroupName("");
          setInvitedMembers([]);
          setShowCreateGroupModal(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[url('/bg_img.png')] bg-cover bg-center">
      <Navbar />

      <div className="mt-16 w-full min-w-[320px] max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Your Groups</h1>
          <div className="flex gap-3 flex-wrap justify-end">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 relative whitespace-nowrap"
            >
              View Invitations
              {invitations?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {invitations.length} {/* Badge count */}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              Create Group
            </button>
          </div>
        </div>

        {/* Loading & Error Handling */}
        {isLoading && <p className="text-gray-500">Loading groups...</p>}
        {error && <p className="text-red-500">Error loading groups</p>}

        {/* Group List */}
        {groups?.length > 0 ? (
          <ul className="space-y-3">
            {groups.map((group) => (
              <li
                key={group._id}
                className="p-3 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 hover:shadow-md transition-all"
                onClick={() => navigate(`/group/${group._id}`)}
              >
                {group.groupName}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">
            You are not part of any groups yet. Start by creating one!
          </p>
        )}
      </div>

      {/* Modal for Invitations */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Group Invitations</h2>
            {isInvitesLoading ? (
              <p>Loading invitations...</p>
            ) : invitations?.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto space-y-3">
                {invitations.map((invite) => (
                  <li
                    key={`${invite.groupId}-${invite.invitedBy}`}
                    className="p-3 bg-gray-100 rounded-md flex justify-between"
                  >
                    <span>{invite.groupName}</span>
                    <div className="flex gap-2">
                      <button
                        className="bg-green-800 text-white px-2 py-1 rounded hover:bg-green-950 transition-all"
                        onClick={() => acceptInvite.mutate(invite._id)}
                        disabled={rejectInvite.isLoading}
                      >
                        ✓
                      </button>
                      <button
                        className="bg-red-800 text-white px-2 py-1 rounded hover:bg-red-950 transition-all"
                        onClick={() => rejectInvite.mutate(invite._id)}
                        disabled={rejectInvite.isLoading}
                      >
                        ✗
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No pending invitations.</p>
            )}
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Create New Group</h2>

            {/* Group Name Input */}
            <label className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-3"
              placeholder="Enter group name"
            />

            {/* Member Invitation Input */}
            <label className="block text-sm font-medium text-gray-700">
              Invite Members
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddMember()} // Allow Enter Key
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter email and press Enter"
              />
              <button
                onClick={handleAddMember}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Display List of Added Members */}
            {invitedMembers.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Invited Members
                </h3>
                <ul className="space-y-2">
                  {invitedMembers.map((email) => (
                    <li
                      key={email}
                      className="p-2 bg-gray-200 rounded flex justify-between items-center"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => handleRemoveMember(email)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        ✗
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateGroup}
                className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
                  isPending ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
