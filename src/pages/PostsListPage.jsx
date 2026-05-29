import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { channelsAPI, postsAPI, postImageUrl } from '../api';
import { ArrowLeft, Loader, Calendar, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const PostsListPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load channel info
      const channelResponse = await channelsAPI.get(id);
      setChannel(channelResponse.data);
      
      // Load all posts and filter by channel
      const postsResponse = await postsAPI.getAll();
      const channelPosts = postsResponse.data.filter(post => post.channel_id === id);
      setPosts(channelPosts);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/channels')}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
      >
        <ArrowLeft size={20} />
        <span>Back to Channels</span>
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{channel?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Posts salvos: {posts.length}
            </p>
          </div>
          <button
            onClick={() => navigate(`/channels/${id}/generate`)}
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <Sparkles size={20} />
            <span>Generate New Post</span>
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Sparkles size={48} className="text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Generate your first post for this channel
          </p>
          <button
            onClick={() => navigate(`/channels/${id}/generate`)}
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center space-x-2"
          >
            <Sparkles size={20} />
            <span>Generate Post</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Image */}
                <div className="space-y-3">
                  {post.image_path && (
                    <img
                      src={postImageUrl(post.image_path)}
                      alt="Post"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Calendar size={16} />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.credits_consumed > 0 && (
                        <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                          <Sparkles size={16} />
                          <span className="font-medium">{post.credits_consumed.toFixed(2)} créditos</span>
                        </span>
                      )}
                      {post.published ? (
                        <span className="flex items-center space-x-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                          <CheckCircle size={16} />
                          <span className="font-medium">Published</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                          <XCircle size={16} />
                          <span className="font-medium">Draft</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-3">Post Caption</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {post.text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsListPage;
