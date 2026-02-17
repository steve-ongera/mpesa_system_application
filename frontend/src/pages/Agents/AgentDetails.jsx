import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, DollarSign, Star, Shield, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { agentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AgentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await agentAPI.getAgents();
        const data = (res.data.data || res.data).find((a) => a.id === id);
        if (!data) throw new Error('Not found');
        setAgent(data);
      } catch {
        toast.error('Agent not found');
        navigate('/agents');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" text="Loading agent…" /></div>;
  }
  if (!agent) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate('/agents')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Agents</span>
      </button>

      {/* Hero */}
      <Card>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow">
              <span className="text-white font-bold text-2xl">
                {agent.store_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{agent.store_name}</h1>
              <p className="text-gray-500">{agent.agent_number}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={agent.is_active ? 'success' : 'error'}>
                  {agent.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {agent.is_verified && (
                  <Badge variant="info">
                    <Shield size={12} className="mr-1 inline" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              icon={<ArrowDownToLine size={18} />}
              onClick={() => navigate('/deposit')}
            >
              Deposit Here
            </Button>
            <Button
              variant="outline"
              icon={<ArrowUpFromLine size={18} />}
              onClick={() => navigate('/withdraw')}
            >
              Withdraw Here
            </Button>
          </div>
        </div>
      </Card>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Contact & Location">
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{agent.location}</p>
              </div>
            </div>
            {agent.user?.phone_number && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{agent.user.phone_number}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card title="Float & Commission">
          <div className="space-y-3 mt-2">
            <div className="flex items-start gap-3">
              <DollarSign size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Available Float</p>
                <p className="font-bold text-green-600 text-lg">
                  KES {Number(agent.float_balance || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500">Commission Rate</p>
                <p className="font-medium text-gray-900">{agent.commission_rate}%</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AgentDetails;