import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getUserFriends, getStreamToken } from "../lib/api";
import { Link } from "react-router";
import { 
  PlusIcon, 
  UsersIcon, 
  MessageCircleIcon,
  SearchIcon,
  UserPlusIcon,
  CheckIcon,
  XIcon,
  HashIcon,
  CrownIcon,
  SettingsIcon
} from "lucide-react";
import { StreamChat } from "stream-chat";
import { Chat, Channel, ChannelList, MessageInput, MessageList, Window } from "stream-chat-react";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const GroupPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [chatClient, setChatClient] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  
  // Create Group States
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    image: ""
  });
  
  // Invite Friends States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFriends, setSelectedFriends] = useState(new Set());

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  // Initialize Stream Chat
  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        setChatClient(client);
        
        // Load user's groups
        const channels = await client.queryChannels({
          type: 'team',
          members: { $in: [authUser._id] }
        });
        
        setGroups(channels);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      }
    };

    initChat();
  }, [tokenData, authUser]);

  // Create Group
  const createGroup = async () => {
    if (!chatClient || !groupData.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    try {
      const channelId = `group-${Date.now()}-${authUser._id}`;
      
      const channel = chatClient.channel('team', channelId, {
        name: groupData.name,
        description: groupData.description,
        image: groupData.image || `https://avatar.iran.liara.run/public/group-${Math.floor(Math.random() * 50) + 1}.png`,
        created_by_id: authUser._id,
        members: [authUser._id]
      });

      await channel.create();
      
      toast.success("Group created successfully!");
      setShowCreateModal(false);
      setGroupData({ name: "", description: "", image: "" });
      setSelectedChannel(channel);
      
      // Add to groups list
      setGroups(prev => [...prev, channel]);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  // Invite Friends to Group
  const inviteFriends = async () => {
    if (!selectedChannel || selectedFriends.size === 0) {
      toast.error("Please select friends to invite");
      return;
    }

    try {
      const friendIds = Array.from(selectedFriends);
      await selectedChannel.addMembers(friendIds);
      
      toast.success(`Invited ${friendIds.length} friends to the group!`);
      setShowInviteModal(false);
      setSelectedFriends(new Set());
      setSearchTerm("");
    } catch (error) {
      console.error("Error inviting friends:", error);
      toast.error("Failed to invite friends");
    }
  };

  // Handle group selection
  const handleGroupSelect = async (group) => {
    try {
      console.log("Selecting group:", group.data?.name);
      
      // Watch the channel to get real-time updates
      if (!group.initialized) {
        await group.watch();
      }
      
      setSelectedChannel(group);
      setSelectedGroup(group);
    } catch (error) {
      console.error("Error selecting group:", error);
      toast.error("Could not load group chat");
    }
  };

  // Filter friends for invitation
  const filteredFriends = friends.filter(friend => 
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFriendSelection = (friendId) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  if (!chatClient) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Connecting to groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Mobile Header Spacer */}
      <div className="h-16 lg:hidden"></div>
      
      <div className="p-0 lg:p-2">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 lg:mb-4 px-4 lg:px-6 py-2 lg:py-4">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Group Chats
            </h1>
            <p className="text-base-content/70 mt-2 text-sm lg:text-base">
              Create groups and chat with multiple sahabat nabi
            </p>
          </div>
          
          <button 
            className="btn btn-primary btn-sm lg:btn-md"
            onClick={() => setShowCreateModal(true)}
          >
            <PlusIcon className="size-4 lg:size-5" />
            <span className="hidden sm:inline">Create Group</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Chat Interface - Absolutely Full Width */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-[calc(100vh-8rem)] w-full">
          
          {/* Groups List */}
          <div className="w-full lg:w-80 bg-base-200 shadow-xl flex-shrink-0 border-r border-base-300">
            <div className="p-3 lg:p-4 h-full flex flex-col">
              <h3 className="font-bold text-base lg:text-lg mb-3 lg:mb-4 flex items-center gap-2">
                <UsersIcon className="size-4 lg:size-5" />
                Your Groups
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2">
                {groups.length === 0 ? (
                  <div className="text-center py-6 lg:py-8">
                    <UsersIcon className="size-10 lg:size-12 mx-auto text-base-content/30 mb-2" />
                    <p className="text-sm text-base-content/70 mb-2">No groups yet</p>
                    <p className="text-xs text-base-content/50 mb-4">Create your first group!</p>
                    <button 
                      className="btn btn-primary btn-xs lg:btn-sm"
                      onClick={() => setShowCreateModal(true)}
                    >
                      <PlusIcon className="size-3 lg:size-4" />
                      Create
                    </button>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className={`card cursor-pointer transition-all duration-200 border ${
                        selectedChannel?.id === group.id 
                          ? 'bg-primary/10 border-primary shadow-md' 
                          : 'bg-base-100 border-base-300 hover:bg-base-300 hover:shadow-md'
                      }`}
                      onClick={() => handleGroupSelect(group)}
                    >
                      <div className="card-body p-2 lg:p-3">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div className="avatar">
                            <div className="size-8 lg:size-10 rounded-full">
                              <img 
                                src={group.data?.image || "https://avatar.iran.liara.run/public/group-1.png"} 
                                alt={group.data?.name || "Group"} 
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs lg:text-sm truncate flex items-center gap-1">
                              <HashIcon className="size-2 lg:size-3" />
                              {group.data?.name || "Unnamed Group"}
                            </h4>
                            <p className="text-xs text-base-content/70">
                              {Object.keys(group.state?.members || {}).length} members
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area - Takes 100% Remaining Width */}
          <div className="flex-1 bg-base-100 shadow-xl w-full min-w-0">
            {selectedChannel ? (
              <div className="h-full w-full">
                <Chat client={chatClient}>
                  <Channel channel={selectedChannel}>
                    <div className="flex flex-col h-full w-full">
                      {/* Group Header */}
                      <div className="p-3 lg:p-4 border-b border-base-300 bg-base-200 flex-shrink-0 w-full">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
                            <div className="avatar">
                              <div className="size-8 lg:size-12 rounded-full">
                                <img 
                                  src={selectedChannel.data?.image || "https://avatar.iran.liara.run/public/group-1.png"} 
                                  alt="Group" 
                                />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-sm lg:text-lg flex items-center gap-1 lg:gap-2 truncate">
                                <HashIcon className="size-3 lg:size-4" />
                                {selectedChannel.data?.name}
                              </h3>
                              <p className="text-xs lg:text-sm text-base-content/70">
                                {Object.keys(selectedChannel.state?.members || {}).length} members
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-1 lg:gap-2 flex-shrink-0">
                            <button 
                              className="btn btn-outline btn-xs lg:btn-sm"
                              onClick={() => setShowInviteModal(true)}
                            >
                              <UserPlusIcon className="size-3 lg:size-4" />
                              <span className="hidden lg:inline">Invite</span>
                            </button>
                            <button className="btn btn-ghost btn-xs lg:btn-sm">
                              <SettingsIcon className="size-3 lg:size-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Chat Messages Area - Absolutely Full Width */}
                      <div className="flex-1 min-h-0 w-full [&_.str-chat__main-panel]:!bg-transparent [&_.str-chat__main-panel]:!h-full [&_.str-chat__main-panel]:!w-full [&_.str-chat__message-list]:!bg-transparent [&_.str-chat__message-list]:!h-full [&_.str-chat__message-list]:!w-full [&_.str-chat__message-input]:!bg-base-200 [&_.str-chat__message-input]:!border-t [&_.str-chat__message-input]:!border-base-300 [&_.str-chat__message-input]:!rounded-none [&_.str-chat__message-input]:!w-full [&_.str-chat__message-input]:!max-w-none [&_.str-chat__thread]:!hidden [&_.str-chat__container]:!w-full [&_.str-chat__container]:!max-w-none">
                        <Window>
                          <MessageList />
                          <MessageInput focus />
                        </Window>
                      </div>
                    </div>
                  </Channel>
                </Chat>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center p-4">
                  <MessageCircleIcon className="size-12 lg:size-16 mx-auto text-base-content/30 mb-4" />
                  <h3 className="text-lg lg:text-xl font-semibold mb-2">Select a group to start chatting</h3>
                  <p className="text-base-content/70 text-sm lg:text-base">Choose a group from the left or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

          {/* Create Group Modal */}
          {showCreateModal && (
            <div className="modal modal-open">
              <div className="modal-box max-w-md">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <PlusIcon className="size-5" />
                  Create New Group
                </h3>
                
                <div className="space-y-4">
                  {/* Group Image Preview */}
                  <div className="text-center">
                    <div className="avatar mb-4">
                      <div className="size-20 rounded-full ring-2 ring-primary ring-offset-2">
                        <img 
                          src={groupData.image || `https://avatar.iran.liara.run/public/group-${Math.floor(Math.random() * 50) + 1}.png`} 
                          alt="Group" 
                        />
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setGroupData({
                        ...groupData, 
                        image: `https://avatar.iran.liara.run/public/group-${Math.floor(Math.random() * 50) + 1}.png`
                      })}
                    >
                      Random Image
                    </button>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Group Name *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter group name"
                      className="input input-bordered"
                      value={groupData.name}
                      onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      placeholder="Describe your group"
                      className="textarea textarea-bordered h-20"
                      value={groupData.description}
                      onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-action">
                  <button 
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowCreateModal(false);
                      setGroupData({ name: "", description: "", image: "" });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={createGroup}
                    disabled={!groupData.name.trim()}
                  >
                    Create Group
                  </button>
                </div>
              </div>
              <div className="modal-backdrop bg-black/50" onClick={() => setShowCreateModal(false)}></div>
            </div>
          )}

          {/* Invite Friends Modal */}
          {showInviteModal && (
            <div className="modal modal-open">
              <div className="modal-box max-w-lg">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <UserPlusIcon className="size-5" />
                  Invite Friends to {selectedChannel?.data?.name}
                </h3>
                
                {/* Search Friends */}
                <div className="form-control mb-4">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search friends..."
                      className="input input-bordered flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="btn btn-square">
                      <SearchIcon className="size-4" />
                    </span>
                  </div>
                </div>

                {/* Selected Friends Count */}
                {selectedFriends.size > 0 && (
                  <div className="alert alert-info mb-4">
                    <div className="flex items-center gap-2">
                      <CheckIcon className="size-4" />
                      <span>{selectedFriends.size} friends selected</span>
                    </div>
                  </div>
                )}

                {/* Friends List */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredFriends.map((friend) => {
                    const isSelected = selectedFriends.has(friend._id);
                    
                    return (
                      <div 
                        key={friend._id}
                        className={`card cursor-pointer transition-all duration-200 ${
                          isSelected ? 'bg-primary/10 border-primary' : 'bg-base-200 hover:bg-base-300'
                        }`}
                        onClick={() => toggleFriendSelection(friend._id)}
                      >
                        <div className="card-body p-3">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="size-10 rounded-full">
                                <img src={friend.profilePic} alt={friend.fullName} />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{friend.fullName}</h4>
                              <p className="text-xs text-base-content/70">
                                {friend.nativeLanguage} • {friend.learningLanguage}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckIcon className="size-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredFriends.length === 0 && (
                  <div className="text-center py-8">
                    <UsersIcon className="size-12 mx-auto text-base-content/30 mb-2" />
                    <p className="text-base-content/70">No friends found</p>
                  </div>
                )}

                <div className="modal-action">
                  <button 
                    className="btn btn-ghost"
                    onClick={() => {
                      setShowInviteModal(false);
                      setSelectedFriends(new Set());
                      setSearchTerm("");
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={inviteFriends}
                    disabled={selectedFriends.size === 0}
                  >
                    Invite {selectedFriends.size > 0 ? selectedFriends.size : ''} Friends
                  </button>
                </div>
              </div>
              <div className="modal-backdrop bg-black/50" onClick={() => setShowInviteModal(false)}></div>
            </div>
          )}

    </div>
  );
};

export default GroupPage; 