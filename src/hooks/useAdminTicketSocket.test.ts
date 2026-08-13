import { renderHook } from '@testing-library/react';
import { useAdminOpsSocket, useAdminTicketSocket } from './useAdminTicketSocket';
import { io } from 'socket.io-client';
import { dispatchAdminTicketActivity } from 'src/utils/supportTicketEvents';
import { dispatchAdminOnDemandEscalation } from 'src/utils/onDemandEscalationEvents';

jest.mock('socket.io-client', () => ({
  __esModule: true,
  io: jest.fn(),
}));

jest.mock('src/utils/supportTicketEvents', () => ({
  dispatchAdminTicketActivity: jest.fn(),
}));

jest.mock('src/utils/onDemandEscalationEvents', () => ({
  dispatchAdminOnDemandEscalation: jest.fn(),
}));

describe('useAdminOpsSocket', () => {
  let mockSocket: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
    (io as jest.Mock).mockReturnValue(mockSocket);
  });

  it('should not connect if not enabled', () => {
    renderHook(() => useAdminOpsSocket(false));
    expect(io).not.toHaveBeenCalled();
  });

  it('should connect and emit join event on connect', () => {
    renderHook(() => useAdminOpsSocket(true));
    
    expect(io).toHaveBeenCalledTimes(1);
    
    // Simulate 'connect' event
    const onConnect = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'connect')[1];
    onConnect();
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join', { adminTickets: true });
  });

  it('should handle support_ticket_activity', () => {
    renderHook(() => useAdminOpsSocket(true));
    
    const onTicketActivity = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'support_ticket_activity')[1];
    
    // Valid payload
    onTicketActivity({ ticketId: 5, action: 'update' });
    expect(dispatchAdminTicketActivity).toHaveBeenCalledWith({ ticketId: 5, action: 'update' });

    // Invalid payload
    jest.clearAllMocks();
    onTicketActivity({ ticketId: 'abc' });
    expect(dispatchAdminTicketActivity).not.toHaveBeenCalled();
  });

  it('should handle on_demand_crm_escalation', () => {
    renderHook(() => useAdminOpsSocket(true));
    
    const onEscalation = mockSocket.on.mock.calls.find((call: any[]) => call[0] === 'on_demand_crm_escalation')[1];
    
    // Valid payload
    onEscalation({ engagementId: 10, reason: 'delay' });
    expect(dispatchAdminOnDemandEscalation).toHaveBeenCalledWith({ engagementId: 10, reason: 'delay' });

    // Invalid payload
    jest.clearAllMocks();
    onEscalation({ engagementId: -1 });
    expect(dispatchAdminOnDemandEscalation).not.toHaveBeenCalled();
  });

  it('should disconnect on unmount', () => {
    const { unmount } = renderHook(() => useAdminOpsSocket(true));
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('should expose useAdminTicketSocket as an alias', () => {
    expect(useAdminTicketSocket).toBe(useAdminOpsSocket);
  });
});
