import React, { useState, useEffect } from "react";
import { userApi } from "../../api/userApi";
import officersApi from "../../api/officersApi";
import Button from "../../components/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";

const Officers = () => {
  const [officers, setOfficers] = useState({
    president: null,
    vicePresident: null,
    secretary: null,
    treasurer: null,
    pio: null,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const positions = [
    { key: "president", label: "President", icon: "👑" },
    { key: "vicePresident", label: "Vice President", icon: "🎖️" },
    { key: "secretary", label: "Secretary", icon: "📝" },
    { key: "treasurer", label: "Treasurer", icon: "💰" },
    { key: "pio", label: "Public Information Officer", icon: "📢" },
  ];

  useEffect(() => {
    fetchOfficers();
    fetchUsers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const response = await officersApi.getAllOfficers();
      setOfficers(response.data);
    } catch (error) {
      console.error("Error fetching officers:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers();
      // Filter only PARENT role users
      const parentUsers = response.data?.users?.filter(
        (user) => user.role === "PARENT"
      ) || [];
      setUsers(parentUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleSelectPosition = (positionKey) => {
    setSelectedPosition(positionKey);
    setSearchTerm("");
    setShowSelectModal(true);
  };

  const handleAssignOfficer = async (user) => {
    try {
      await officersApi.assignOfficer(selectedPosition, user.id);
      
      const updatedOfficers = {
        ...officers,
        [selectedPosition]: user,
      };
      setOfficers(updatedOfficers);
      
      setShowSelectModal(false);
      setSelectedPosition(null);
      alert(`Successfully assigned ${user.firstName} ${user.lastName} as ${getPositionLabel(selectedPosition)}`);
    } catch (error) {
      console.error("Error assigning officer:", error);
      alert(error.response?.data?.message || "Error assigning officer. Please try again.");
    }
  };

  const handleRemoveOfficer = async (positionKey) => {
    if (!window.confirm(`Are you sure you want to remove the ${getPositionLabel(positionKey)}?`)) {
      return;
    }

    try {
      await officersApi.removeOfficer(positionKey);
      
      const updatedOfficers = {
        ...officers,
        [positionKey]: null,
      };
      setOfficers(updatedOfficers);
      
      alert(`Successfully removed ${getPositionLabel(positionKey)}`);
    } catch (error) {
      console.error("Error removing officer:", error);
      alert(error.response?.data?.message || "Error removing officer. Please try again.");
    }
  };

  const getPositionLabel = (key) => {
    return positions.find((p) => p.key === key)?.label || key;
  };

  const getPositionIcon = (key) => {
    return positions.find((p) => p.key === key)?.icon || "👤";
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${user.firstName} ${user.middleName || ""} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    
    // Exclude users who are already assigned to other positions
    const isAlreadyAssigned = Object.entries(officers).some(
      ([key, officer]) => key !== selectedPosition && officer?.id === user.id
    );
    
    return !isAlreadyAssigned && (fullName.includes(searchLower) || email.includes(searchLower));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Officers Management</h1>
        <p className="text-gray-600 mt-1">
          Manage PTA officers and their positions
        </p>
      </div>

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((position) => {
          const officer = officers[position.key];
          
          return (
            <div
              key={position.key}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all"
            >
              <div className="p-6">
                {/* Position Header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{position.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {position.label}
                    </h3>
                  </div>
                </div>

                {/* Officer Details */}
                {officer ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {officer.firstName?.charAt(0)}
                            {officer.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {officer.firstName} {officer.middleName || ""} {officer.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {officer.email}
                          </p>
                        </div>
                      </div>
                      
                      {officer.contactNumber && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Contact:</span> {officer.contactNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSelectPosition(position.key)}
                        className="flex-1"
                      >
                        Change
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveOfficer(position.key)}
                        className="flex-1"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 text-sm mb-3">No officer assigned</p>
                      <Button
                        size="sm"
                        onClick={() => handleSelectPosition(position.key)}
                      >
                        Assign Officer
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Select Officer Modal */}
      <Modal
        isOpen={showSelectModal}
        onClose={() => {
          setShowSelectModal(false);
          setSelectedPosition(null);
          setSearchTerm("");
        }}
        title={`Select ${selectedPosition ? getPositionLabel(selectedPosition) : "Officer"}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* User List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAssignOfficer(user)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.firstName} {user.middleName || ""} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button size="sm">Select</Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No users found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try a different search term</p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">About Officers</h3>
            <p className="text-sm text-blue-700 mt-1">
              Officers are selected from existing parent users. Each position can only be
              assigned to one person at a time. You can change or remove officers at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Officers;
