import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router";
import { 
  CheckCircleIcon, 
  MapPinIcon, 
  UserPlusIcon, 
  SearchIcon,
  FilterIcon,
  MessageCircleIcon,
  UsersIcon,
  VideoIcon,
  StarIcon
} from "lucide-react";
import { capitialize } from "../lib/utils";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] }),
  });

  useEffect(() => {
    const outgoingIds = new Set();
    if (outgoingFriendReqs && outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        outgoingIds.add(req.recipient._id);
      });
      setOutgoingRequestsIds(outgoingIds);
    }
  }, [outgoingFriendReqs]);

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend => 
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.nativeLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.learningLanguage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter recommended users based on language filter
  const filteredRecommended = recommendedUsers.filter(user => {
    if (!filterLanguage) return true;
    return user.nativeLanguage.toLowerCase() === filterLanguage.toLowerCase() ||
           user.learningLanguage.toLowerCase() === filterLanguage.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-base-100">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl space-y-8">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              List Sahabat Nabi
            </h1>
            <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
              Connect with amazing people from around the world and practice languages together
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat bg-primary text-primary-content rounded-2xl shadow-lg">
              <div className="stat-figure">
                <UsersIcon className="size-8" />
              </div>
              <div className="stat-title text-primary-content/80">Total Friends</div>
              <div className="stat-value">{friends.length}</div>
            </div>
            
            <div className="stat bg-secondary text-secondary-content rounded-2xl shadow-lg">
              <div className="stat-figure">
                <StarIcon className="size-8" />
              </div>
              <div className="stat-title text-secondary-content/80">New Matches</div>
              <div className="stat-value">{recommendedUsers.length}</div>
            </div>

            <div className="stat bg-accent text-accent-content rounded-2xl shadow-lg">
              <div className="stat-figure">
                <MessageCircleIcon className="size-8" />
              </div>
              <div className="stat-title text-accent-content/80">Active Chats</div>
              <div className="stat-value">{friends.length}</div>
            </div>
          </div>

          {/* Your Friends Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <UsersIcon className="size-8 text-primary" />
                  <h2 className="text-2xl sm:text-3xl font-bold">Your Friends</h2>
                  <div className="badge badge-primary">{friends.length}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link to="/notifications" className="btn btn-outline btn-sm">
                    <UsersIcon className="size-4" />
                    Friend Requests
                  </Link>
                  
                  {/* Search Friends */}
                  <div className="form-control w-full sm:w-auto">
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        placeholder="Search friends..."
                        className="input input-bordered input-sm w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <span className="btn btn-square btn-sm">
                        <SearchIcon className="size-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {loadingFriends ? (
                <div className="flex justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary" />
                </div>
              ) : filteredFriends.length === 0 ? (
                searchTerm ? (
                  <div className="text-center py-8">
                    <SearchIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No friends found</h3>
                    <p className="text-base-content/70">Try searching with different keywords</p>
                  </div>
                ) : (
                  <NoFriendsFound />
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredFriends.map((friend) => (
                    <div key={friend._id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300">
                      <div className="card-body p-5">
                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="avatar">
                            <div className="size-14 rounded-full ring-2 ring-primary ring-offset-2">
                              <img src={friend.profilePic} alt={friend.fullName} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg truncate">{friend.fullName}</h3>
                            <div className="text-xs text-success flex items-center gap-1">
                              <span className="size-2 rounded-full bg-success animate-pulse" />
                              Online
                            </div>
                          </div>
                        </div>

                        {/* Languages */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2">
                            {getLanguageFlag(friend.nativeLanguage)}
                            <span className="badge badge-secondary badge-sm">
                              Native: {capitialize(friend.nativeLanguage)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getLanguageFlag(friend.learningLanguage)}
                            <span className="badge badge-outline badge-sm">
                              Learning: {capitialize(friend.learningLanguage)}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Link 
                            to={`/chat/${friend._id}`} 
                            className="btn btn-primary btn-sm flex-1"
                          >
                            <MessageCircleIcon className="size-4" />
                            Chat
                          </Link>
                          <Link 
                            to={`/call/${friend._id}`} 
                            className="btn btn-outline btn-sm"
                          >
                            <VideoIcon className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Discover New Friends Section */}
          <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <StarIcon className="size-8 text-primary" />
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Discover New Friends</h2>
                    <p className="text-base-content/70">Perfect language exchange partners for you</p>
                  </div>
                </div>
                
                {/* Language Filter */}
                <div className="form-control w-full sm:w-auto">
                  <div className="input-group input-group-sm">
                    <select 
                      className="select select-bordered select-sm w-full sm:w-48"
                      value={filterLanguage}
                      onChange={(e) => setFilterLanguage(e.target.value)}
                    >
                      <option value="">All Languages</option>
                      <option value="english">English</option>
                      <option value="spanish">Spanish</option>
                      <option value="french">French</option>
                      <option value="german">German</option>
                      <option value="japanese">Japanese</option>
                      <option value="korean">Korean</option>
                      <option value="mandarin">Mandarin</option>
                    </select>
                    <span className="btn btn-square btn-sm">
                      <FilterIcon className="size-4" />
                    </span>
                  </div>
                </div>
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-primary" />
                </div>
              ) : filteredRecommended.length === 0 ? (
                <div className="text-center py-12">
                  <StarIcon className="size-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No recommendations available</h3>
                  <p className="text-base-content/70">
                    {filterLanguage ? "Try different language filter" : "Check back later for new language partners!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecommended.map((user) => {
                    const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                    return (
                      <div
                        key={user._id}
                        className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border border-base-300"
                      >
                        <div className="card-body p-6">
                          {/* User Header */}
                          <div className="flex items-center gap-4 mb-4">
                            <div className="avatar">
                              <div className="size-16 rounded-full ring-2 ring-primary/20 ring-offset-2">
                                <img src={user.profilePic} alt={user.fullName} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg">{user.fullName}</h3>
                              {user.location && (
                                <div className="flex items-center text-sm text-base-content/70 mt-1">
                                  <MapPinIcon className="size-4 mr-1" />
                                  {user.location}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Languages */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                              {getLanguageFlag(user.nativeLanguage)}
                              <span className="badge badge-secondary">
                                Native: {capitialize(user.nativeLanguage)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getLanguageFlag(user.learningLanguage)}
                              <span className="badge badge-outline">
                                Learning: {capitialize(user.learningLanguage)}
                              </span>
                            </div>
                          </div>

                          {/* Bio */}
                          {user.bio && (
                            <div className="mb-4">
                              <p className="text-sm text-base-content/80 line-clamp-2">{user.bio}</p>
                            </div>
                          )}

                          {/* Action Button */}
                          <button
                            className={`btn w-full ${
                              hasRequestBeenSent 
                                ? "btn-success btn-disabled" 
                                : "btn-primary hover:btn-primary-focus"
                            }`}
                            onClick={() => sendRequestMutation(user._id)}
                            disabled={hasRequestBeenSent || isPending}
                          >
                            {hasRequestBeenSent ? (
                              <>
                                <CheckCircleIcon className="size-5" />
                                Request Sent
                              </>
                            ) : (
                              <>
                                <UserPlusIcon className="size-5" />
                                Add Friend
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsPage; 