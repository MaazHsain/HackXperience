import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeftCircleIcon as ArrowLeftCircleSolid } from "@heroicons/react/24/solid";
import { ArrowLeftCircleIcon as ArrowLeftCircleOutline } from "@heroicons/react/24/outline";

const GroupPage = () => {
  const [groupedWishlists, setGroupedWishlists] = useState({});
  const [groupMembers, setGroupMembers] = useState([]);
  const { userData } = useContext(AppContext);
  const { groupId } = useParams();
  const navigate = useNavigate();

  // For add new members
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  // For add item to wishlist
  const [allItems, setAllItems] = useState([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Select items
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  // For AI Prompt
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [isAISuggestionModalOpen, setIsAISuggestionModalOpen] = useState(false);
  const [isLoadingAISuggestions, setIsLoadingAISuggestions] = useState(false);

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails((prev) => [...prev, trimmed]);
      setEmailInput("");
    }
  };

  const submitInvites = async () => {
    const res = await fetch("http://localhost:4000/api/group/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ groupId, invitedUsers: emails }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Invites sent!");
      setEmails([]);
      setShowInviteModal(false);
    } else {
      alert(data.message);
    }
  };

  const handleAddToWishlist = async (groupId, selectedItemId, creatorId) => {
    if (!creatorId) return alert("User not found");

    const res = await fetch("http://localhost:4000/api/wishlist/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ creatorId, groupId, itemId: selectedItemId }),
    });

    const result = await res.json();
    if (result.success) {
      setIsAddItemModalOpen(false);
      setSelectedItemId("");
      window.location.reload();
    } else {
      alert(result.message || "Error adding item");
    }
  };

  const handleDeleteWishlist = async (wishlistId) => {
    const userId = userData?._id;
    if (!userId || !wishlistId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this item?"
    );
    if (!confirmed) return;

    const res = await fetch("http://localhost:4000/api/wishlist/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, wishlistId }),
    });

    const result = await res.json();
    if (result.success) {
      window.location.reload();
    } else {
      alert(result.message || "Failed to remove item");
    }
  };

  const handleBuyAlone = async (wishlistId) => {
    const res = await fetch(
      "http://localhost:4000/api/wishlist/add-request-to-buy",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          creatorId: userData._id,
          wishlistId,
        }),
      }
    );

    const data = await res.json();
    if (data.success) {
      alert("You are now requesting to buy this item alone.");
      setIsItemDetailModalOpen(false);
      window.location.reload();
    } else {
      alert(data.message || "Failed to process request.");
    }
  };

  const handleGroupBuy = async (wishlistId) => {
    const res = await fetch("http://localhost:4000/api/wishlist/add-groupbuy", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        addedId: userData._id,
        wishlistId,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("You have joined the group buy.");
      setIsItemDetailModalOpen(false);
      window.location.reload();
    } else {
      alert(data.message || "Failed to join group buy.");
    }
  };

  const getDaysUntilBirthday = (birthdateStr) => {
    const today = new Date();
    const birthdate = new Date(birthdateStr);

    // Normalize to midnight to avoid partial-day errors
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    let nextBirthday = new Date(
      today.getFullYear(),
      birthdate.getMonth(),
      birthdate.getDate()
    );

    if (nextBirthday < todayMidnight) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = nextBirthday - todayMidnight;
    const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // now safe to floor

    return daysLeft === 0 ? "birthday today!!" : `${daysLeft} days left`;
  };

  const handleAISuggestions = async (wishlistUserId) => {
    const wishlist = groupedWishlists[wishlistUserId]?.wishlist || [];
  
    const items = wishlist.map(item => ({
      name: item.itemName,
      description: item.description || ""
    }));
  
    if (items.length === 0) {
      alert("This user has no wishlist items yet.");
      return;
    }
  
    try {
      setIsLoadingAISuggestions(true);

      const res = await fetch("http://localhost:4000/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items }),
      });
  
      const data = await res.json();
      if (data.success) {
        setAiSuggestions(data.suggestions);
        setIsAISuggestionModalOpen(true);
      } else {
        alert(data.message || "Failed to get AI suggestions.");
      }
    } catch (err) {
      console.error("AI suggestion error:", err);
      alert("Error calling AI service.");
    } finally {
    setIsLoadingAISuggestions(false); // end loading
    }
  };
  

  useEffect(() => {
    const fetchWishlistAndMembers = async () => {
      try {
        const [wishlistRes, membersRes] = await Promise.all([
          fetch(`http://localhost:4000/api/wishlist/${groupId}`, {
            credentials: "include",
          }),
          fetch(`http://localhost:4000/api/group/${groupId}/members`, {
            credentials: "include",
          }),
        ]);

        const wishlistData = await wishlistRes.json();
        const membersData = await membersRes.json();

        if (wishlistData.success && membersData.success) {
          setGroupMembers(membersData.members); // save all members

          const grouped = {};

          for (const member of membersData.members) {
            grouped[member._id] = {
              userName: member.name,
              wishlist: [],
            };
          }

          for (const entry of wishlistData.wishlists) {
            const uid = entry.creatorId._id;
            if (grouped[uid]) {
              grouped[uid].wishlist.push({
                ...entry.itemId,
                _wishlistId: entry._id,
                creatorId: entry.creatorId._id,
                requestToBuy: entry.requestToBuy,
                buyAsGroup: entry.buyAsGroup,
              });
            }
          }

          setGroupedWishlists(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch group data:", err);
      }
    };

    fetchWishlistAndMembers();
  }, [groupId]);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch("http://localhost:4000/api/item/all", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setAllItems(data.items);
    };

    fetchItems();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 sm:px-6">
        {/* Top Nav Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-[800px] mx-auto mb-8 gap-4">
          <button
            onClick={() => navigate("/user-dashboard")}
            className="group flex items-center"
          >
            <ArrowLeftCircleOutline className="h-8 w-8 mr-1 group-hover:hidden" />
            <ArrowLeftCircleSolid className="h-8 w-8 mr-1 hidden group-hover:block" />
          </button>

          <h2 className="text-2xl sm:text-3xl font-bold text-center flex-1">
            Group Wishlist
          </h2>

          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-gray-600 text-white text-sm px-4 py-2 rounded hover:bg-gray-700"
          >
            Add New Members
          </button>
        </div>

        {/* Wishlist Sections */}
        {Object.entries(groupedWishlists).map(
          ([userId, { userName, wishlist }]) => (
            <div
              key={userId}
              className="border rounded-lg p-4 shadow mb-6 w-full max-w-[800px] mx-auto"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-xl sm:text-2xl font-semibold">
                  {userName}
                </h3>

                {groupMembers.find((m) => m._id === userId)?.birthdate && (
                  <span className="text-sm text-gray-700 sm:ml-4 mt-1 sm:mt-0">
                    • Birthday at:{" "}
                    {new Date(
                      groupMembers.find((m) => m._id === userId).birthdate
                    ).toLocaleDateString()}{" "}
                    (
                    {getDaysUntilBirthday(
                      groupMembers.find((m) => m._id === userId).birthdate
                    )}
                    )
                  </span>
                )}
              </div>

              {isLoadingAISuggestions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-md w-[300px] text-center">
                    <h3 className="text-xl font-bold mb-2">Generating Ideas...</h3>
                    <p className="text-gray-600">Please wait while we fetch gift suggestions.</p>
                    <div className="mt-4">
                      <div className="w-10 h-10 mx-auto border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mb-4 gap-2">
                <button
                  onClick={() => handleAISuggestions(userId)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                >
                  AI Recommendations
                </button>
                <button
                  onClick={() => {
                    setSelectedUserId(userId);
                    setIsAddItemModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Item to Wishlist
                </button>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-gray-500 italic text-sm">
                  No items in wishlist yet... Add Now!
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {wishlist.map((item) => (
                    <div
                      key={item._wishlistId}
                      className="relative min-w-[170px] max-w-[170px] h-[190px] border rounded bg-gray-100 flex flex-col justify-between cursor-pointer transform transition duration-300 ease-in-out hover:shadow-xl hover:bg-white"
                      onClick={() => {
                        setSelectedItemDetails(item);
                        setIsItemDetailModalOpen(true);
                      }}
                    >
                      {item.creatorId === userData?._id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWishlist(item._wishlistId);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                          title="Remove"
                        >
                          ✕
                        </button>
                      )}
                      <div className="w-full h-[100px] flex items-center justify-center overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.itemName}
                          className="h-full object-contain"
                        />
                      </div>
                      <div className="p-2 text-center text-sm">
                        {item.itemName}

                        {/* Badge Section */}
                        {item.creatorId !== userData?._id && (
                          <div className="mt-1 text-xs text-gray-600">
                            {item.requestToBuy && (
                              <div
                                className="mt-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full max-w-[170px] truncate"
                                title={`${item.requestToBuy.name} is buying this gift`}
                              >
                                {item.requestToBuy.name} is buying this gift
                              </div>
                            )}

                            {!item.requestToBuy &&
                              Array.isArray(item.buyAsGroup) &&
                              item.buyAsGroup.length > 0 && (
                                <div
                                  className="mt-1 bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full max-w-[170px] truncate"
                                  title={`${item.buyAsGroup
                                    .map((u) => u.name)
                                    .join(", ")} ${
                                    item.buyAsGroup.length === 1 ? "is" : "are"
                                  } buying as a group`}
                                >
                                  {item.buyAsGroup
                                    .map((u) => u.name)
                                    .join(", ")}{" "}
                                  {item.buyAsGroup.length === 1 ? "is" : "are"}{" "}
                                  buying as a group
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[400px] p-6 relative shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Add New Members</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-red-500 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {showInviteModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
                  <h2 className="text-xl font-semibold mb-4">
                    Add New Members
                  </h2>

                  {/* Member Invitation Input */}
                  <label className="block text-sm font-medium text-gray-700">
                    Invite Members
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="Enter email and press Enter"
                    />
                    <button
                      onClick={handleAddEmail}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>

                  {/* Display List of Added Members */}
                  {emails.length > 0 && (
                    <div className="mt-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Invited Members
                      </h3>
                      <ul className="space-y-2">
                        {emails.map((email) => (
                          <li
                            key={email}
                            className="p-2 bg-gray-200 rounded flex justify-between items-center"
                          >
                            <span>{email}</span>
                            <button
                              onClick={() =>
                                setEmails((prev) =>
                                  prev.filter((e) => e !== email)
                                )
                              }
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
                      onClick={() => {
                        setShowInviteModal(false);
                        setEmails([]);
                      }}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={submitInvites}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Send Invites
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Display List of Added Members */}
            {emails.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Invited Members
                </h3>
                <ul className="space-y-2">
                  {emails.map((email) => (
                    <li
                      key={email}
                      className="p-2 bg-gray-200 rounded flex justify-between items-center"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() =>
                          setEmails((prev) => prev.filter((e) => e !== email))
                        }
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
                onClick={() => {
                  setShowInviteModal(false);
                  setEmails([]);
                }}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>

              <button
                onClick={submitInvites}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg w-[400px]">
            <h2 className="text-2xl font-bold mb-4 text-center">Add Item</h2>

            <select
              className="border p-2 w-full mb-4"
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">Select an item</option>
              {allItems.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.itemName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                disabled={!selectedItemId}
                onClick={() =>
                  handleAddToWishlist(groupId, selectedItemId, selectedUserId)
                }
                className={`px-4 py-2 rounded ${
                  selectedItemId
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {isItemDetailModalOpen && selectedItemDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg w-[500px]">
            <h2 className="text-2xl font-bold mb-4 text-center">
              {selectedItemDetails.itemName}
            </h2>
            <img
              src={selectedItemDetails.imageUrl}
              alt={selectedItemDetails.itemName}
              className="w-full h-[200px] object-contain mb-4"
            />
            <p>
              <strong>Description:</strong> {selectedItemDetails.description}
            </p>
            <p>
              <strong>Category:</strong> {selectedItemDetails.category}
            </p>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() =>
                  window.open(selectedItemDetails.shoppingUrl, "_blank")
                }
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Buy here
              </button>

              {selectedItemDetails.creatorId !== userData?._id && (
                <>
                  {selectedItemDetails.requestToBuy === null &&
                  (!Array.isArray(selectedItemDetails.buyAsGroup) ||
                    selectedItemDetails.buyAsGroup.length === 0) ? (
                    <>
                      <button
                        onClick={() =>
                          handleBuyAlone(selectedItemDetails._wishlistId)
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Buy this alone
                      </button>
                      <button
                        onClick={() =>
                          handleGroupBuy(selectedItemDetails._wishlistId)
                        }
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                      >
                        Buy as a group
                      </button>
                    </>
                  ) : (
                    <>
                      {selectedItemDetails.requestToBuy === null &&
                        !selectedItemDetails.buyAsGroup?.some(
                          (member) => member._id === userData?._id
                        ) && (
                          <button
                            onClick={() =>
                              handleGroupBuy(selectedItemDetails._wishlistId)
                            }
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                          >
                            Join to buy as group
                          </button>
                        )}
                    </>
                  )}
                </>
              )}

              <button
                onClick={() => setIsItemDetailModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isAISuggestionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-[400px]">
            <h3 className="text-xl font-bold mb-4">AI Gift Recommendations</h3>
            <p className="text-gray-700 whitespace-pre-line">{aiSuggestions}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsAISuggestionModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupPage;
