import React, { useState, useEffect } from "react";
import officersApi from "../../api/officersApi";
import LoadingSpinner from "../../components/LoadingSpinner";

const Officers = () => {
  const [officers, setOfficers] = useState({
    president: null,
    vicePresident: null,
    secretary: null,
    treasurer: null,
    pio: null,
  });
  const [loading, setLoading] = useState(true);

  const positions = [
    { key: "president", label: "President", icon: "👑" },
    { key: "vicePresident", label: "Vice President", icon: "🎖️" },
    { key: "secretary", label: "Secretary", icon: "📝" },
    { key: "treasurer", label: "Treasurer", icon: "💰" },
    { key: "pio", label: "Public Information Officer", icon: "📢" },
  ];

  useEffect(() => {
    fetchOfficers();
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
        <h1 className="text-2xl font-bold text-gray-900">PTA Officers</h1>
        <p className="text-gray-600 mt-1">
          Meet the current officers of the Parent-Teacher Association
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
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{position.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {position.label}
                  </h3>
                </div>

                {/* Officer Name */}
                {officer ? (
                  <div className="text-center">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-center mb-3">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-xl">
                            {officer.firstName?.charAt(0)}
                            {officer.lastName?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 text-lg">
                        {officer.firstName} {officer.middleName || ""} {officer.lastName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">Position vacant</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
            <h3 className="text-sm font-medium text-blue-900">About PTA Officers</h3>
            <p className="text-sm text-blue-700 mt-1">
              These officers are responsible for leading and managing the activities of the
              Parent-Teacher Association. They work together to ensure the welfare and success
              of our school community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Officers;
