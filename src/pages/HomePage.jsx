import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelsAPI } from '../api';
import { Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await channelsAPI.getAll();
      setChannels(response.data);
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-lg">
            <Sparkles size={48} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-purple-600 bg-clip-text text-transparent">
          Welcome to PostGen
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          AI-powered social media content generator. Create engaging posts with one click.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
            <Zap className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">AI-Powered Content</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate engaging posts and images using Azure OpenAI
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
            <TrendingUp className="text-purple-600 dark:text-purple-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Multi-Channel</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Manage multiple social media channels from one place
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="text-pink-600 dark:text-pink-400" size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">One-Click Publishing</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Generate, review, and publish posts with ease
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-4">Get Started</h2>
        <p className="mb-6 text-primary-100">
          {channels.length === 0 
            ? "Create your first channel to start generating amazing content!"
            : `You have ${channels.length} channel${channels.length > 1 ? 's' : ''} configured. Ready to create your next post?`
          }
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/channels/create')}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors flex items-center space-x-2"
          >
            <span>Create Channel</span>
            <ArrowRight size={18} />
          </button>
          {channels.length > 0 && (
            <button
              onClick={() => navigate('/channels')}
              className="bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors flex items-center space-x-2"
            >
              <span>View Channels</span>
              <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Recent Channels */}
      {!loading && channels.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Channels</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.slice(0, 3).map(channel => (
              <div
                key={channel.id}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/channels/${channel.id}/generate`)}
              >
                {channel.suggested_image_url && (
                  <img 
                    src={channel.suggested_image_url} 
                    alt={channel.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">{channel.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {channel.objective}
                </p>
                <button className="text-primary-600 dark:text-primary-400 font-medium text-sm hover:underline">
                  Generate Post →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
