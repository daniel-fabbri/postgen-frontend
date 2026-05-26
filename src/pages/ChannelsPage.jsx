import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelsAPI } from '../api';
import { Plus, Sparkles, Loader } from 'lucide-react';

const ChannelsPage = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await channelsAPI.getAll();
      setChannels(response.data);
    } catch (error) {
      console.error('Error loading channels:', error);
      alert('Error loading channels');
    } finally {
      setLoading(false);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Channels</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your social media channels
          </p>
        </div>
        <button
          onClick={() => navigate('/channels/create')}
          className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Channel</span>
        </button>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full">
              <Sparkles size={48} className="text-gray-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">No channels yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first channel to start generating content
          </p>
          <button
            onClick={() => navigate('/channels/create')}
            className="bg-primary-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
          >
            Create Channel
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map(channel => (
            <div
              key={channel.id}
              onClick={() => navigate(`/channels/${channel.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all cursor-pointer"
            >
              {/* Avatar banner */}
              <div className="relative h-32 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  {channel.avatar_url ? (
                    <img
                      src={channel.avatar_url}
                      alt={channel.name}
                      className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-lg">
                      <Sparkles size={32} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-16 pb-6 px-6 text-center">
                <h3 className="text-xl font-semibold">{channel.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;
