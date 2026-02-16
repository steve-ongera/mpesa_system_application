import React from 'react';
import { MapPin, Phone } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';

const AgentCard = ({ agent }) => {
  return (
    <Card hover>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{agent.store_name}</h3>
          <p className="text-sm text-gray-600">{agent.agent_number}</p>
        </div>
        <Badge variant={agent.is_active ? 'success' : 'error'}>
          {agent.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>{agent.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone size={16} />
          <span>{agent.user?.phone_number}</span>
        </div>
      </div>

      <Button variant="outline" size="sm" fullWidth>
        View Details
      </Button>
    </Card>
  );
};

export default AgentCard;