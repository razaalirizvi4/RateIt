import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { ArrowUp, ArrowDown, MessageSquare, Share, BookmarkPlus, X } from 'lucide-react';

export default function Trending({ onInteract }) {
  const [posts, setPosts] = useState([]);
  const [activeSidebarItem, setActiveSidebarItem] = useState('trending');
  const [exploreExpanded, setExploreExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/posts/trending');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      }
    };

    fetchTrendingPosts();
  }, []);

  const toggleExplore = () => {
    setExploreExpanded(!exploreExpanded);
  };

  const handleVote = async (postId, vote) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        onInteract(); // Trigger login popup
        return;
      }

      const user = JSON.parse(storedUser);
      
      const post = posts.find(p => p.postID === postId);
      const endpoint = post.userVote === 'up' ? 
        `http://localhost:3001/api/posts/${postId}/removeupvote` : 
        `http://localhost:3001/api/posts/${postId}/upvote`;
      
      const response = await axios.post(endpoint, {
        userId: user.id
      });

      setPosts(prevPosts => {
        return prevPosts.map(post => {
          if (post.postID === postId) {
            return {
              ...post,
              upvoteCount: response.data.upvoteCount,
              userVote: post.userVote === 'up' ? null : 'up'
            };
          }
          return post;
        });
      });
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const handlePostClick = async (post) => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      onInteract();
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:3001/api/posts/${post.postID}/comments`, {
        params: { sortBy: 'recent' }
      });
      
      setSelectedPost({
        ...post,
        comments: response.data
      });
    } catch (error) {
      console.error('Error fetching comments:', error);
      setSelectedPost(post);
    }
  };

  const closeModal = () => {
    setSelectedPost(null);
    setNewComment('');
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      onInteract();
      return;
    }

    const user = JSON.parse(storedUser);
    
    try {
      const response = await axios.post(`http://localhost:3001/api/posts/${selectedPost.postID}/comments`, {
        username: user.username,
        commentText: newComment
      });

      setSelectedPost(prev => ({
        ...prev,
        comments: [...(prev.comments || []), response.data]
      }));
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        profileDropdownOpen={profileDropdownOpen} 
        setProfileDropdownOpen={setProfileDropdownOpen} 
      />

      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex gap-6">
          <Sidebar 
            activeSidebarItem={activeSidebarItem} 
            setActiveSidebarItem={setActiveSidebarItem} 
            toggleExplore={toggleExplore} 
            exploreExpanded={exploreExpanded} 
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Trending Posts</h1>
            <div className="space-y-4">
              {posts.map(post => (
                <div 
                  key={post.postID}
                  className="bg-white border border-gray-200 rounded-md mb-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex">
                    <div className="flex flex-col items-center px-2 py-2 bg-gray-50 rounded-l-md">
                      <button 
                        onClick={() => handleVote(post.postID, 'up')}
                        className={`p-1 rounded hover:bg-gray-200 transition ${post.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
                      >
                        <ArrowUp size={20} />
                      </button>
                      <span className="text-xs font-medium text-gray-900">{post.upvoteCount || 0}</span>
                      <button 
                        onClick={() => handleVote(post.postID, 'down')}
                        className={`p-1 rounded hover:bg-gray-200 transition ${post.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
                      >
                        <ArrowDown size={20} />
                      </button>
                    </div>

                    <div className="flex-1 p-3">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <img src={post.pfp || './images/pfp.jpg'} alt={post.username} className="w-5 h-5 rounded-full mr-1" />
                        <span className="font-medium text-gray-900">r/{post.username}</span>
                        <span className="mx-1">•</span>
                        <span>{new Date(post.dateOfPost).toLocaleString()}</span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{post.title || 'Untitled'}</h3>
                      <p className="text-gray-800 text-sm mb-2">{post.contentText}</p>
                      
                      {post.media && (
                        <div className="mb-2 rounded-md overflow-hidden">
                          <img src={post.media} alt="Post image" className="w-full" />
                        </div>
                      )}
                      
                      <div className="flex items-center text-gray-500 text-xs">
                        <button 
                          onClick={() => handlePostClick(post)}
                          className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1"
                        >
                          <MessageSquare size={16} className="mr-1" />
                          {post.commentCount || 0} Comments
                        </button>
                        <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1 ml-2">
                          <Share size={16} className="mr-1" />
                          Share
                        </button>
                        <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1 ml-2">
                          <BookmarkPlus size={16} className="mr-1" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && localStorage.getItem('user') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">Comments</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {/* Original post */}
              <div className="bg-gray-50 rounded-md p-4 mb-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <img src={selectedPost.pfp || './images/pfp.jpg'} alt={selectedPost.username} className="w-5 h-5 rounded-full mr-1" />
                  <span className="font-medium text-gray-900">r/{selectedPost.username}</span>
                  <span className="mx-1">•</span>
                  <span>{new Date(selectedPost.dateOfPost).toLocaleString()}</span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">{selectedPost.title || 'Untitled'}</h3>
                <p className="text-gray-800 text-sm mb-3">{selectedPost.contentText}</p>
                
                {selectedPost.media && (
                  <div className="mb-3 rounded-md overflow-hidden">
                    <img src={selectedPost.media} alt="Post image" className="w-full" />
                  </div>
                )}
                
                <div className="flex items-center text-gray-500 text-xs">
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleVote(selectedPost.postID, 'up')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${selectedPost.userVote === 'up' ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span className="mx-1 font-medium text-gray-900">{selectedPost.upvoteCount || 0}</span>
                    <button 
                      onClick={() => handleVote(selectedPost.postID, 'down')}
                      className={`p-1 rounded hover:bg-gray-200 transition ${selectedPost.userVote === 'down' ? 'text-blue-500' : 'text-gray-400'}`}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Comments */}
              <div className="space-y-4">
                {selectedPost?.comments?.map(comment => (
                  <div key={comment.commentID} className="bg-white border border-gray-200 rounded-md p-3">
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <img src={comment.pfp || './images/pfp.jpg'} alt={comment.username} className="w-5 h-5 rounded-full mr-1" />
                      <span className="font-medium text-gray-900">r/{comment.username}</span>
                      <span className="mx-1">•</span>
                      <span>{new Date(comment.dateOfComment).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-800 text-sm">{comment.commentText}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1">
                        <ArrowUp size={14} className="mr-1" />
                        {comment.upvoteCount || 0}
                      </button>
                      <button className="flex items-center hover:bg-gray-100 rounded-full px-2 py-1 ml-2">
                        <MessageSquare size={14} className="mr-1" />
                        Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Comment input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleCommentSubmit} className="flex items-center">
                <input
                  type="text"
                  placeholder="What are your thoughts?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-gray-100 rounded-full py-2 px-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                <button 
                  type="submit"
                  className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}