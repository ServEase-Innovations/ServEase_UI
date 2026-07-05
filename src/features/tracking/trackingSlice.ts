import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy: number;
  bearing?: number;
  speed?: number;
  timestamp: number;
}

interface EstimatedPosition {
  latitude: number;
  longitude: number;
  estimated: true;
  confidence: number;
  based_on_update_at: number;
  seconds_since_update: number;
  estimation_method: string;
}

interface ETAResult {
  engagement_id: number;
  distance_meters: number;
  duration_seconds: number;
  eta_range: {
    min_seconds: number;
    max_seconds: number;
  };
  traffic_aware: boolean;
  calculated_at: number;
  confidence: string;
}

interface TeamData {
  lead_provider_id: number;
  member_ids: number[];
  member_count: number;
  members: Array<{ id: number; name: string }>;
}

interface TrackingState {
  session: {
    id: string | null;
    engagementId: number | null;
    isActive: boolean;
    startedAt: number | null;
    sessionToken: string | null;
  };
  connection: {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
    transport: 'websocket' | 'polling' | null;
    lastHeartbeat: number | null;
  };
  provider: {
    location: LocationUpdate | null;
    status: 'not_started' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
    isOnline: boolean;
    estimatedPosition: EstimatedPosition | null;
  };
  destination: {
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  };
  eta: ETAResult | null;
  team: {
    isTeam: boolean;
    leadProviderId: number | null;
    members: Array<{ id: number; name: string }>;
  };
  map: {
    center: { latitude: number; longitude: number } | null;
    zoom: number;
    isAutoCenter: boolean;
  };
  ui: {
    isMapVisible: boolean;
    error: string | null;
    isLoading: boolean;
  };
}

const initialState: TrackingState = {
  session: {
    id: null,
    engagementId: null,
    isActive: false,
    startedAt: null,
    sessionToken: null,
  },
  connection: {
    status: 'disconnected',
    transport: null,
    lastHeartbeat: null,
  },
  provider: {
    location: null,
    status: 'not_started',
    isOnline: false,
    estimatedPosition: null,
  },
  destination: {
    latitude: null,
    longitude: null,
    address: null,
  },
  eta: null,
  team: {
    isTeam: false,
    leadProviderId: null,
    members: [],
  },
  map: {
    center: null,
    zoom: 14,
    isAutoCenter: true,
  },
  ui: {
    isMapVisible: false,
    error: null,
    isLoading: false,
  },
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    // Session actions
    startSession: (state, action: PayloadAction<{
      session_id: string;
      engagement_id: number;
      session_token: string;
      is_team: boolean;
      team_data: TeamData | null;
    }>) => {
      state.session.id = action.payload.session_id;
      state.session.engagementId = action.payload.engagement_id;
      state.session.isActive = true;
      state.session.startedAt = Date.now();
      state.session.sessionToken = action.payload.session_token;
      state.team.isTeam = action.payload.is_team;
      state.team.members = action.payload.team_data?.members || [];
      state.team.leadProviderId = action.payload.team_data?.lead_provider_id || null;
    },
    
    stopSession: (state) => {
      state.session.id = null;
      state.session.engagementId = null;
      state.session.isActive = false;
      state.session.sessionToken = null;
      state.connection.status = 'disconnected';
      state.provider.location = null;
      state.provider.isOnline = false;
      state.eta = null;
    },
    
    // Connection actions
    setConnectionStatus: (state, action: PayloadAction<{
      status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
      transport?: 'websocket' | 'polling';
    }>) => {
      state.connection.status = action.payload.status;
      if (action.payload.transport) {
        state.connection.transport = action.payload.transport;
      }
    },
    
    setHeartbeat: (state, action: PayloadAction<number>) => {
      state.connection.lastHeartbeat = action.payload;
    },
    
    // Location actions
    updateLocation: (state, action: PayloadAction<LocationUpdate>) => {
      state.provider.location = action.payload;
      state.provider.isOnline = true;
      state.provider.estimatedPosition = null; // Clear estimation when we get real data
      
      // Auto-center map on first location
      if (state.map.isAutoCenter && !state.map.center) {
        state.map.center = {
          latitude: action.payload.latitude,
          longitude: action.payload.longitude,
        };
      }
    },
    
    updateEstimatedPosition: (state, action: PayloadAction<EstimatedPosition>) => {
      state.provider.estimatedPosition = action.payload;
      state.provider.isOnline = false;
    },
    
    setProviderStatus: (state, action: PayloadAction<
      'not_started' | 'en_route' | 'arrived' | 'in_progress' | 'completed'
    >) => {
      state.provider.status = action.payload;
    },
    
    // Destination actions
    setDestination: (state, action: PayloadAction<{
      latitude: number;
      longitude: number;
      address: string;
    }>) => {
      state.destination = action.payload;
    },
    
    // ETA actions
    updateETA: (state, action: PayloadAction<ETAResult>) => {
      state.eta = action.payload;
    },
    
    // Map actions
    setMapCenter: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.map.center = action.payload;
    },
    
    setMapZoom: (state, action: PayloadAction<number>) => {
      state.map.zoom = action.payload;
    },
    
    toggleAutoCenter: (state) => {
      state.map.isAutoCenter = !state.map.isAutoCenter;
    },
    
    setAutoCenter: (state, action: PayloadAction<boolean>) => {
      state.map.isAutoCenter = action.payload;
    },
    
    // UI actions
    showMap: (state) => {
      state.ui.isMapVisible = true;
    },
    
    hideMap: (state) => {
      state.ui.isMapVisible = false;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.ui.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.ui.error = action.payload;
    },
    
    clearError: (state) => {
      state.ui.error = null;
    },
    
    // Reset all state
    resetTracking: () => initialState,
  },
});

export const {
  startSession,
  stopSession,
  setConnectionStatus,
  setHeartbeat,
  updateLocation,
  updateEstimatedPosition,
  setProviderStatus,
  setDestination,
  updateETA,
  setMapCenter,
  setMapZoom,
  toggleAutoCenter,
  setAutoCenter,
  showMap,
  hideMap,
  setLoading,
  setError,
  clearError,
  resetTracking,
} = trackingSlice.actions;

export default trackingSlice.reducer;
