import trackingReducer, {
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
} from './trackingSlice';

describe('trackingSlice', () => {
  const initialState = {
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

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should handle initial state', () => {
    expect(trackingReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle startSession and stopSession', () => {
    const sessionData = {
      session_id: 'session-123',
      engagement_id: 456,
      session_token: 'token-abc',
      is_team: true,
      team_data: {
        lead_provider_id: 1,
        member_ids: [1, 2],
        member_count: 2,
        members: [{ id: 1, name: 'Lead' }, { id: 2, name: 'Member' }],
      },
    };

    let state = trackingReducer(initialState as any, startSession(sessionData));
    expect(state.session.id).toEqual('session-123');
    expect(state.session.isActive).toEqual(true);
    expect(state.session.startedAt).toEqual(1672531200000);
    expect(state.team.isTeam).toEqual(true);
    expect(state.team.leadProviderId).toEqual(1);
    expect(state.team.members.length).toEqual(2);

    state = trackingReducer(state, stopSession());
    expect(state.session.isActive).toEqual(false);
    expect(state.session.id).toBeNull();
  });

  it('should handle connection updates', () => {
    let state = trackingReducer(initialState as any, setConnectionStatus({ status: 'connected', transport: 'websocket' }));
    expect(state.connection.status).toEqual('connected');
    expect(state.connection.transport).toEqual('websocket');

    state = trackingReducer(state, setHeartbeat(12345));
    expect(state.connection.lastHeartbeat).toEqual(12345);
  });

  it('should handle location updates and auto-center map', () => {
    const loc = { latitude: 10, longitude: 20, accuracy: 5, timestamp: 123 };
    let state = trackingReducer(initialState as any, updateLocation(loc));
    
    expect(state.provider.location).toEqual(loc);
    expect(state.provider.isOnline).toEqual(true);
    expect(state.map.center).toEqual({ latitude: 10, longitude: 20 });

    // Turn off auto center
    state = trackingReducer(state, setAutoCenter(false));
    const loc2 = { latitude: 15, longitude: 25, accuracy: 5, timestamp: 124 };
    state = trackingReducer(state, updateLocation(loc2));
    
    // Center shouldn't change
    expect(state.map.center).toEqual({ latitude: 10, longitude: 20 });
  });

  it('should handle UI state toggles', () => {
    let state = trackingReducer(initialState as any, showMap());
    expect(state.ui.isMapVisible).toEqual(true);

    state = trackingReducer(state, hideMap());
    expect(state.ui.isMapVisible).toEqual(false);

    state = trackingReducer(state, setLoading(true));
    expect(state.ui.isLoading).toEqual(true);

    state = trackingReducer(state, setError('failed'));
    expect(state.ui.error).toEqual('failed');

    state = trackingReducer(state, clearError());
    expect(state.ui.error).toBeNull();
  });

  it('should handle resetTracking', () => {
    const dirtyState = { ...initialState, ui: { ...initialState.ui, isMapVisible: true } };
    const state = trackingReducer(dirtyState as any, resetTracking());
    expect(state).toEqual(initialState);
  });
});
