import { useState, useEffect } from 'react';
import { X, Plus, Upload, Link as LinkIcon, BarChart, Search } from 'lucide-react';
import axios from 'axios';

// CreatePostButton component that can be reused
export function CreatePostButton({ onPostCreated, currentUser = { name: "You", avatar: "./images/pfp2.jpg" } }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  
  // Form fields for all post types
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [tags, setTags] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  
  // Poll specific fields
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [pollDuration, setPollDuration] = useState('1 day');

  // Animation control for tabs
  const [tabChangeAnimation, setTabChangeAnimation] = useState(false);

  // For smooth modal opening and closing
  useEffect(() => {
    let timeout;
    if (isModalVisible) {
      // Slight delay to allow the backdrop to start appearing first
      timeout = setTimeout(() => {
        setIsModalOpen(true);
      }, 50);
    } 
    return () => clearTimeout(timeout);
  }, [isModalVisible]);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Delay hiding the modal container until after animation completes
    setTimeout(() => {
      setIsModalVisible(false);
    }, 300); // Match this with your CSS transition duration
  };

  // Tab changing with animation
  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    setTabChangeAnimation(true);
    
    // Short delay to allow fade out before changing tab content
    setTimeout(() => {
      setActiveTab(tab);
      // Reset animation state
      setTimeout(() => {
        setTabChangeAnimation(false);
      }, 50);
    }, 150);
  };

  // New state for movies and TV shows
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedTvShow, setSelectedTvShow] = useState('');
  const [searchMovieQuery, setSearchMovieQuery] = useState('');
  const [searchTvShowQuery, setSearchTvShowQuery] = useState('');

  // Fetch movies and TV shows
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [moviesRes, tvShowsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/movies'),
          axios.get('http://localhost:3001/api/tvshows')
        ]);
        setMovies(moviesRes.data);
        setTvShows(tvShowsRes.data);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };
    fetchContent();
  }, []);

  // Filter movies and TV shows based on search
  const filteredMovies = movies.filter(movie => 
    movie.name.toLowerCase().includes(searchMovieQuery.toLowerCase())
  );

  const filteredTvShows = tvShows.filter(show => 
    show.Name.toLowerCase().includes(searchTvShowQuery.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.username) {
        console.error('No user data found');
        return;
    }

    // Structure the post data according to the API requirements
    const postData = {
        username: storedUser.username,
        title: title,
        contentText: content,
        media: null,
        pollID: null,
        movieId: selectedMovie || null,
        tvShowId: selectedTvShow || null,
        tags: tags
    };

    // Send to API
    axios.post('http://localhost:3001/api/posts', postData)
        .then(response => {
            console.log('Post created:', response.data);
            // Only call onPostCreated with the response data
            if (onPostCreated) {
                const newPost = {
                    postID: response.data.postId,
                    author: storedUser.username,
                    authorAvatar: storedUser.pfp,
                    title,
                    timestamp: new Date().toISOString(),
                    displayTime: "Just now",
                    upvoteCount: 0,
                    commentCount: 0,
                    dateOfPost: new Date().toISOString(),
                    userVote: null,
                    comments: [],
                    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                    movieID: selectedMovie || null,
                    tvShowID: selectedTvShow || null,
                    content: content,
                    pfp: storedUser.pfp || null
                };
                onPostCreated(newPost);
            }
            // Reset form and close modal
            setTitle('');
            setContent('');
            setTags('');
            setSelectedMovie('');
            setSelectedTvShow('');
            closeModal();
        })
        .catch(error => {
            console.error('Error creating post:', error);
            alert('Error creating post: ' + (error.response?.data?.message || error.message));
        });
};
  
  const handleMediaUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setMediaFiles(Array.from(e.target.files));
    }
  };
  
  const addPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };
  
  const removePollOption = (index) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };
  
  const updatePollOption = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  return (
    <>
      <button 
        onClick={openModal}
        className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
      >
        <Plus size={18} className="mr-2" />
        Create
      </button>

      {/* Create Post Modal */}
      {isModalVisible && (
        <div 
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-300 ease-in-out ${
            isModalOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div 
            className={`bg-white rounded-lg w-full max-w-xl relative flex flex-col transition-all duration-300 ease-in-out ${
              isModalOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-xl font-medium text-gray-900">Create post</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => handleTabChange('text')} 
                className={`px-4 py-2 text-center flex-1 transition-all duration-300 ${
                  activeTab === 'text' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Text
              </button>
              <button 
                onClick={() => handleTabChange('media')} 
                className={`px-4 py-2 text-center flex-1 transition-all duration-300 ${
                  activeTab === 'media' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Images & Video
              </button>
              <button 
                onClick={() => handleTabChange('link')} 
                className={`px-4 py-2 text-center flex-1 transition-all duration-300 ${
                  activeTab === 'link' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Link
              </button>
              <button 
                onClick={() => handleTabChange('movies')} 
                className={`px-4 py-2 text-center flex-1 transition-all duration-300 ${
                  activeTab === 'movies' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Movies
              </button>
              <button 
                onClick={() => handleTabChange('tvshows')} 
                className={`px-4 py-2 text-center flex-1 transition-all duration-300 ${
                  activeTab === 'tvshows' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                TV Shows
              </button>
              <button 
                onClick={() => handleTabChange('poll')} 
                className={`px-4 py-2 text-center flex-1 transition-all duration-300 ${
                  activeTab === 'poll' 
                    ? 'text-blue-500 border-b-2 border-blue-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Poll
              </button>
            </div>

            {/* Tab Content with fade transition */}
            <div className={`transition-opacity duration-200 ease-in-out ${tabChangeAnimation ? 'opacity-0' : 'opacity-100'}`}>
              <form onSubmit={handleSubmit} className="p-4 flex-1 overflow-y-auto">
                {/* Title Field (common to all tabs) */}
                <input
                  type="text"
                  placeholder="Title*"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-md p-2 mb-4 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />
                
                <div className="text-right text-xs text-gray-500 -mt-3 mb-2">
                  {title.length}/300
                </div>

                {/* Tags input */}
                <input
                  type="text"
                  placeholder="Add tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-gray-50 rounded-md p-2 mb-4 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                />

                {/* Text Tab Content */}
                {activeTab === 'text' && (
                  <div className="border border-gray-200 rounded-md p-2 min-h-32 mb-4 transition-all duration-200 hover:border-gray-300">
                    <textarea
                      placeholder="Body text (optional)"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-transparent min-h-24 text-gray-900 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Media Tab Content */}
                {activeTab === 'media' && (
                  <div className="border border-gray-200 border-dashed rounded-md p-8 min-h-32 mb-4 flex items-center justify-center flex-col transition-all duration-300 hover:border-blue-500 hover:bg-blue-50">
                    <input
                      type="file"
                      id="media-upload"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="media-upload"
                      className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                    >
                      <Upload size={24} className="text-gray-400 mb-2" />
                      <p className="text-gray-500 text-center mb-2">Drag and Drop or upload media</p>
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        Select Files
                      </button>
                    </label>
                    
                    {mediaFiles.length > 0 && (
                      <div className="mt-4 w-full">
                        <p className="text-gray-700 mb-2">Selected files ({mediaFiles.length}):</p>
                        <ul className="text-gray-500 text-sm">
                          {mediaFiles.map((file, index) => (
                            <li key={index} className="truncate">{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Link Tab Content */}
                {activeTab === 'link' && (
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="Link URL *"
                        required
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-md p-2 pl-9 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                      />
                      <LinkIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Movies Tab Content */}
{activeTab === 'movies' && (
  <div className="mb-4">
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search movies..."
        value={searchMovieQuery}
        onChange={(e) => setSearchMovieQuery(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-md p-2 pl-9 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
      />
      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
      {filteredMovies.map(movie => (
        <button
          type="button" // Add type="button" to prevent form submission
          key={movie.id}
          onClick={() => {
            setSelectedMovie(movie.id === selectedMovie ? '' : movie.id); // Toggle selection
            setSearchMovieQuery(movie.name); // Fill search with selected movie name
          }}
          className={`w-full text-left p-3 flex items-center hover:bg-gray-50 ${
            selectedMovie === movie.id ? 'bg-blue-50' : ''
          }`}
        >
          <img
            src={movie.posters}
            alt={movie.name}
            className="w-12 h-16 object-cover rounded mr-3"
          />
          <div>
            <h4 className="font-medium text-gray-900">{movie.name}</h4>
            <p className="text-sm text-gray-500">{movie.release_year} • {movie.genre}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
)}

{/* TV Shows Tab Content */}
{activeTab === 'tvshows' && (
  <div className="mb-4">
    <div className="relative mb-4">
      <input
        type="text"
        placeholder="Search TV shows..."
        value={searchTvShowQuery}
        onChange={(e) => setSearchTvShowQuery(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-md p-2 pl-9 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
      />
      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
      {filteredTvShows.map(show => (
        <button
          type="button" // Add type="button" to prevent form submission
          key={show.TVShow_ID}
          onClick={() => {
            setSelectedTvShow(show.TVShow_ID === selectedTvShow ? '' : show.TVShow_ID); // Toggle selection
            setSearchTvShowQuery(show.Name); // Fill search with selected show name
          }}
          className={`w-full text-left p-3 flex items-center hover:bg-gray-50 ${
            selectedTvShow === show.TVShow_ID ? 'bg-blue-50' : ''
          }`}
        >
          <img
            src={show.Posters}
            alt={show.Name}
            className="w-12 h-16 object-cover rounded mr-3"
          />
          <div>
            <h4 className="font-medium text-gray-900">{show.Name}</h4>
            <p className="text-sm text-gray-500">{show.Seasons} Seasons • {show.Genre}</p>
          </div>
        </button>
      ))}
    </div>
  </div>
)}

                {/* Poll Tab Content */}
                {activeTab === 'poll' && (
                  <div className="mb-4">
                    <div className="border border-gray-200 rounded-md p-4 min-h-32 transition-all duration-200 hover:border-gray-300">
                      <h3 className="text-lg mb-3 text-gray-900">Poll Options</h3>
                      
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center mb-3">
                          <input
                            type="text"
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => updatePollOption(index, e.target.value)}
                            className="flex-1 bg-white border border-gray-200 rounded-md p-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                            required={index < 2}
                          />
                          {index >= 2 && (
                            <button
                              type="button"
                              onClick={() => removePollOption(index)}
                              className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {pollOptions.length < 6 && (
                        <button
                          type="button"
                          onClick={addPollOption}
                          className="mt-2 text-blue-500 hover:text-blue-600 transition-colors flex items-center"
                        >
                          <Plus size={16} className="mr-1" />
                          Add Option
                        </button>
                      )}
                      
                      <div className="mt-4">
                        <label className="block text-gray-700 mb-2">Poll Duration</label>
                        <select
                          value={pollDuration}
                          onChange={(e) => setPollDuration(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-md p-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                        >
                          <option value="1 day">1 Day</option>
                          <option value="3 days">3 Days</option>
                          <option value="1 week">1 Week</option>
                          <option value="1 month">1 Month</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
