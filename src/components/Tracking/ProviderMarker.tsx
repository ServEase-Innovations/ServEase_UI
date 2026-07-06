import React from 'react';
import { OverlayView } from '@react-google-maps/api';

interface ProviderMarkerProps {
  position: { lat: number; lng: number };
  isEstimated?: boolean;
}

export const ProviderMarker: React.FC<ProviderMarkerProps> = ({ position, isEstimated = false }) => {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div style={{ position: 'relative', transform: 'translate(-50%, -100%)' }}>
        {/* Marker Container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          filter: isEstimated ? 'opacity(0.6)' : 'none',
        }}>
          {/* Bike Icon with Serveaso Badge */}
          <div style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            backgroundColor: '#dc2626',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
            border: '3px solid white',
          }}>
            {/* Bike SVG Icon */}
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 19C3.34315 19 2 17.6569 2 16C2 14.3431 3.34315 13 5 13C6.65685 13 8 14.3431 8 16C8 17.6569 6.65685 19 5 19Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 19C17.3431 19 16 17.6569 16 16C16 14.3431 17.3431 13 19 13C20.6569 13 22 14.3431 22 16C22 17.6569 20.6569 19 19 19Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 5L14 9H17L19 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 13L8 9L12 9L10 5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 9L12 16"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Pulse animation for active tracking */}
            {!isEstimated && (
              <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }} />
            )}
          </div>

          {/* Serveaso Label */}
          <div style={{
            marginTop: '8px',
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            whiteSpace: 'nowrap',
            letterSpacing: '0.5px',
          }}>
            ServEaso
          </div>

          {/* Pointer */}
          <div style={{
            width: '0',
            height: '0',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #1e293b',
            marginTop: '-1px',
          }} />

          {/* Estimated badge */}
          {isEstimated && (
            <div style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '9px',
              fontWeight: '600',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}>
              EST
            </div>
          )}
        </div>

        {/* CSS Animation */}
        <style>
          {`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
                transform: scale(1);
              }
              50% {
                opacity: 0;
                transform: scale(1.3);
              }
            }
          `}
        </style>
      </div>
    </OverlayView>
  );
};
