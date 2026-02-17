import React, { useEffect, useState } from 'react';
import { Search, MapPin, RefreshCw } from 'lucide-react';
import AgentCard from '../../components/features/AgentCard';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { agentAPI } from '../../services/api';

const AgentList = () => {
  const [agents, setAgents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [location, setLocation] = useState('');
  const [error, setError]       = useState('');

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async (loc = '') => {
    setLoading(true);
    setError('');
    try {
      const params = loc ? { location: loc } : {};
      const res = await agentAPI.getAgents(params);
      setAgents(res.data.data || res.data);
    } catch {
      setError('Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAgents(location);
  };

  const filtered = agents.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.store_name?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.agent_number?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">M-Pesa Agents</h1>
        <p className="text-gray-500 mt-1">Find a deposit or withdrawal agent near you</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, agent number…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="relative flex-1">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Search size={16} />
            Search
          </button>
          <button
            type="button"
            onClick={() => { setSearch(''); setLocation(''); fetchAgents(); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </form>
      </div>

      {/* Error */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-500">
          {filtered.length} agent{filtered.length !== 1 ? 's' : ''} found
          {location && ` in "${location}"`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" text="Finding agents…" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={30} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No Agents Found</h3>
          <p className="text-sm text-gray-400">
            Try searching a different location or clearing your filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentList;