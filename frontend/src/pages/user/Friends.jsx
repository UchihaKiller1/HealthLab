import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Friends = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('all-users'); // all-users, requests, friends
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch users for search
  useEffect(() => {
    if (activeTab === 'all-users') {
      fetchUsers();
    }
  }, [activeTab, searchQuery]);

  // Fetch pending requests
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchPendingRequests();
      fetchSentRequests();
    }
  }, [activeTab]);

  // Fetch friends
  useEffect(() => {
    if (activeTab === 'friends') {
      fetchFriends();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/friends/users', {
        params: { search: searchQuery },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/friends/requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast.error('Failed to load pending requests');
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await axios.get('/api/friends/requests/sent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSentRequests(response.data);
    } catch (error) {
      console.error('Error fetching sent requests:', error);
    }
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/friends/friends', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await axios.post('/api/friends/requests', 
        { recipientId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Friend request sent!');
      fetchUsers(); // Refresh to update button status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.patch(`/api/friends/requests/${requestId}/accept`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Friend request accepted!');
      fetchPendingRequests();
      setActiveTab('friends');
    } catch (error) {
      toast.error('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.patch(`/api/friends/requests/${requestId}/reject`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Friend request rejected');
      fetchPendingRequests();
    } catch (error) {
      toast.error('Failed to reject friend request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await axios.delete(`/api/friends/requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Friend request cancelled');
      fetchSentRequests();
      fetchUsers();
    } catch (error) {
      toast.error('Failed to cancel friend request');
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm('Are you sure you want to remove this friend?')) {
      return;
    }
    try {
      await axios.delete(`/api/friends/friends/${friendId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Friend removed');
      fetchFriends();
    } catch (error) {
      toast.error('Failed to remove friend');
    }
  };

  const getAvatarUrl = (profilePicture) => {
    if (!profilePicture) return null;
    return profilePicture.startsWith('http') ? profilePicture : `http://localhost:4000/${profilePicture}`;
  };

  const getUserInitials = (user) => {
    if (user.firstname && user.lastname) {
      return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">Connect with other HealthLab users</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all-users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all-users'
                    ? 'border-[#75A64D] text-[#75A64D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Users
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-[#75A64D] text-[#75A64D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Requests{' '}
                {pendingRequests.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'friends'
                    ? 'border-[#75A64D] text-[#75A64D]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Friends ({friends.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar for All Users */}
        {activeTab === 'all-users' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#75A64D] focus:border-transparent"
            />
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#75A64D]"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* All Users Tab */}
              {activeTab === 'all-users' && (
                <div>
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No users found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((user) => (
                        <div
                          key={user._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-[#75A64D] flex items-center justify-center text-white font-semibold">
                              {getAvatarUrl(user.profilePicture) ? (
                                <img
                                  src={getAvatarUrl(user.profilePicture)}
                                  alt={user.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getUserInitials(user)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/user/${user._id}`}
                                className="text-sm font-semibold text-gray-900 hover:text-[#75A64D] truncate block"
                              >
                                {user.firstname} {user.lastname}
                              </Link>
                              <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                            </div>
                          </div>
                          {user.friendStatus === 'sent_pending' ? (
                            <button
                              onClick={() => handleCancelRequest(user.friendshipId)}
                              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                            >
                              Cancel Request
                            </button>
                          ) : user.friendStatus === 'received_pending' ? (
                            <button
                              disabled
                              className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md text-sm font-medium cursor-not-allowed"
                            >
                              Request Sent to You
                            </button>
                          ) : user.friendStatus === 'accepted' ? (
                            <button
                              onClick={() => handleRemoveFriend(user._id)}
                              className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                            >
                              Remove Friend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(user._id)}
                              className="w-full px-4 py-2 bg-[#75A64D] text-white rounded-md hover:bg-[#2C5835] transition-colors text-sm font-medium"
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-6">
                  {/* Pending Requests Received */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Incoming Requests ({pendingRequests.length})
                    </h2>
                    {pendingRequests.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No pending requests</p>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequests.map((request) => (
                          <div
                            key={request._id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-full bg-[#75A64D] flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {getAvatarUrl(request.requester.profilePicture) ? (
                                  <img
                                    src={getAvatarUrl(request.requester.profilePicture)}
                                    alt={request.requester.username}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  getUserInitials(request.requester)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/user/${request.requester._id}`}
                                  className="text-sm font-semibold text-gray-900 hover:text-[#75A64D] truncate block"
                                >
                                  {request.requester.firstname} {request.requester.lastname}
                                </Link>
                                <p className="text-xs text-gray-500 truncate">@{request.requester.username}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2 flex-shrink-0">
                              <button
                                onClick={() => handleAcceptRequest(request._id)}
                                className="px-4 py-2 bg-[#75A64D] text-white rounded-md hover:bg-[#2C5835] transition-colors text-sm font-medium"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request._id)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sent Requests */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Sent Requests ({sentRequests.length})
                    </h2>
                    {sentRequests.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No sent requests</p>
                    ) : (
                      <div className="space-y-3">
                        {sentRequests.map((request) => (
                          <div
                            key={request._id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-12 h-12 rounded-full bg-[#75A64D] flex items-center justify-center text-white font-semibold flex-shrink-0">
                                {getAvatarUrl(request.recipient.profilePicture) ? (
                                  <img
                                    src={getAvatarUrl(request.recipient.profilePicture)}
                                    alt={request.recipient.username}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  getUserInitials(request.recipient)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={`/user/${request.recipient._id}`}
                                  className="text-sm font-semibold text-gray-900 hover:text-[#75A64D] truncate block"
                                >
                                  {request.recipient.firstname} {request.recipient.lastname}
                                </Link>
                                <p className="text-xs text-gray-500 truncate">@{request.recipient.username}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleCancelRequest(request._id)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium flex-shrink-0"
                            >
                              Cancel
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div>
                  {friends.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">You don't have any friends yet</p>
                      <p className="text-sm text-gray-400 mt-2">Start by searching for users and sending friend requests!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {friends.map((friend) => (
                        <div
                          key={friend._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-[#75A64D] flex items-center justify-center text-white font-semibold">
                              {getAvatarUrl(friend.profilePicture) ? (
                                <img
                                  src={getAvatarUrl(friend.profilePicture)}
                                  alt={friend.username}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                getUserInitials(friend)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/user/${friend._id}`}
                                className="text-sm font-semibold text-gray-900 hover:text-[#75A64D] truncate block"
                              >
                                {friend.firstname} {friend.lastname}
                              </Link>
                              <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFriend(friend._id)}
                            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
                          >
                            Remove Friend
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Friends;
