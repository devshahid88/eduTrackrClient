// VideoCall.tsx
import React, { useEffect, useState, useRef } from 'react';
import AgoraRTC, {
  ICameraVideoTrack,
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';
import type { UID, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

// import type { UID, IRemoteUser } from 'agora-rtc-sdk-ng';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from '../../api/axiosInstance';

AgoraRTC.setLogLevel(2);

type Tracks = {
  videoTrack: ICameraVideoTrack | null;
  audioTrack: IMicrophoneAudioTrack | null;
};

type RemoteUsersMap = { [uid: string]: Partial<IAgoraRTCRemoteUser> & { uid: UID } };



const VideoCall = ({ channelName, onLeave }: { channelName: string; onLeave: () => void }) => {
  const authState = useSelector((state: { auth: any }) => state.auth);
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState<Tracks>({ videoTrack: null, audioTrack: null });
  const [remoteUsers, setRemoteUsers] = useState<RemoteUsersMap>({});
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [micMuted, setMicMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRefs = useRef<{ [uid: string]: HTMLDivElement | null }>({});
  const isCleaningUp = useRef(false);
  const joinPromiseRef = useRef<Promise<UID> | null>(null);

  const APP_ID = import.meta.env.VITE_APP_ID;
  const userId = authState?.user?._id || authState?.user?.id;

  useEffect(() => {
    const fetchToken = async () => {
      if (!userId || !authState?.accessToken) {
        setError('Please log in to join the class.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          '/api/agora/token',
          { channelName, userId },
          { headers: { Authorization: `Bearer ${authState.accessToken}` } }
        );
        setToken(response.data.data?.token || response.data.token);
      } catch (error: any) {
        console.error('Error fetching token:', error);
        setError(`Failed to initialize call: ${error.response?.data?.message || error.message}`);
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [channelName, userId, authState]);

  useEffect(() => {
    if (!channelName || !token || isCleaningUp.current) return;

    const joinChannel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!APP_ID) throw new Error('Agora App ID is not configured.');
        if (client.connectionState !== 'DISCONNECTED') await client.leave();

        let tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;
        try {
          await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          tracks = await Promise.all([
            AgoraRTC.createMicrophoneAudioTrack({ encoderConfig: 'music_standard' }),
            AgoraRTC.createCameraVideoTrack({ encoderConfig: '480p_1' })
          ]);
          setLocalTracks({ audioTrack: tracks[0], videoTrack: tracks[1] });
          if (localVideoRef.current && tracks[1]) tracks[1].play(localVideoRef.current);
        } catch (mediaError: any) {
          console.warn('Media access failed, joining as listener only:', mediaError);
          toast.error('Could not access camera/mic. Joining as listener.');
          // We continue without tracks
        }

        joinPromiseRef.current = client.join(APP_ID, channelName, token, userId);
        await joinPromiseRef.current;

        if (client.connectionState === 'CONNECTED' && tracks) {
          await client.publish(tracks.filter(Boolean) as any);
        }

        setIsJoined(true);
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error joining channel:', error);
        
        let errorMsg = error.message;
        if (error.name === 'NotAllowedError') {
          errorMsg = 'Camera/Microphone access denied. Please check your browser permissions.';
        } else if (error.name === 'NotFoundError') {
          errorMsg = 'No camera or microphone found. Please connect a device.';
        } else if (error.name === 'NotReadableError') {
           errorMsg = 'Camera/Microphone is being used by another application.';
        }

        setError(errorMsg);
        setIsLoading(false);
        toast.error(`Failed to join call: ${errorMsg}`);
      }
    };

    const setupEventHandlers = () => {
      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
        try {
          await client.subscribe(user, mediaType);
          setRemoteUsers(prev => ({
            ...prev,
            [user.uid]: {
              ...prev[user.uid],
              uid: user.uid,
              ...(mediaType === 'video' && { videoTrack: user.videoTrack }),
              ...(mediaType === 'audio' && { audioTrack: user.audioTrack })
            }
          }));
          if (mediaType === 'audio' && user.audioTrack) user.audioTrack.play();
        } catch (error: any) {
          console.error('Error subscribing:', error);
          toast.error(`Subscription failed: ${error.message}`);
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser, mediaType) => {
        setRemoteUsers(prev => {
          const updated = { ...prev };
          if (updated[user.uid]) {
          if (mediaType === 'video') updated[user.uid].videoTrack = undefined;
          if (mediaType === 'audio') updated[user.uid].audioTrack = undefined;

          }
          return updated;
        });
      });

      client.on('user-left', (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(prev => {
          const updated = { ...prev };
          delete updated[user.uid];
          return updated;
        });
      });

      client.on('connection-state-change', (cur, prev) => {
        console.log('Connection state changed:', cur);
        if (cur === 'DISCONNECTED' && isJoined) {
          setError('Disconnected from call. Please try again.');
          setIsJoined(false);
          setIsLoading(false);
        }
      });

      client.on('exception', (event) => {
        console.error('Agora exception:', event);
        toast.error(`Agora error: ${event.code}`);
      });
    };

    setupEventHandlers();
    joinChannel();

    return () => {
      isCleaningUp.current = true;
      const cleanup = async () => {
        try {
          if (joinPromiseRef.current) await joinPromiseRef.current;
          localTracks.videoTrack?.stop();
          localTracks.videoTrack?.close();
          localTracks.audioTrack?.stop();
          localTracks.audioTrack?.close();
          if (client.connectionState !== 'DISCONNECTED') await client.leave();
          client.removeAllListeners();
        } catch (error) {
          console.error('Cleanup error:', error);
        } finally {
          isCleaningUp.current = false;
        }
      };
      cleanup();
    };
  }, [client, channelName, token]);

  useEffect(() => {
    Object.entries(remoteUsers).forEach(([uid, user]) => {
      if (user.videoTrack && remoteVideoRefs.current[uid]) {
        try {
          user.videoTrack.play(remoteVideoRefs.current[uid]!);
        } catch (error) {
          console.error('Play error:', error);
        }
      }
    });
  }, [remoteUsers]);

  const handleLeaveCall = async () => {
    try {
      isCleaningUp.current = true;
      localTracks.videoTrack?.stop();
      localTracks.videoTrack?.close();
      localTracks.audioTrack?.stop();
      localTracks.audioTrack?.close();
      if (client.connectionState !== 'DISCONNECTED') await client.leave();
      client.removeAllListeners();
      setIsJoined(false);
      onLeave();
    } catch (error: any) {
      console.error('Leave error:', error);
      toast.error(`Leave failed: ${error.message}`);
      onLeave();
    } finally {
      isCleaningUp.current = false;
    }
  };

  const toggleMic = async () => {
    if (localTracks.audioTrack) {
      try {
        await localTracks.audioTrack.setMuted(!micMuted);
        setMicMuted(!micMuted);
        toast.success(`Microphone ${!micMuted ? 'muted' : 'unmuted'}`);
      } catch (error: any) {
        console.error('Mic toggle error:', error);
        toast.error(`Mic toggle failed: ${error.message}`);
      }
    }
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      try {
        await localTracks.videoTrack.setMuted(!videoMuted);
        setVideoMuted(!videoMuted);
        toast.success(`Camera ${!videoMuted ? 'off' : 'on'}`);
      } catch (error: any) {
        console.error('Video toggle error:', error);
        toast.error(`Camera toggle failed: ${error.message}`);
      }
    }
  };

  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Live Class: {channelName.replace('class_', '')}</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {Object.keys(remoteUsers).length + 1} participant{Object.keys(remoteUsers).length !== 0 ? 's' : ''}
            </span>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-gray-600">Connecting...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 overflow-y-auto">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[200px]">
            <div
              ref={localVideoRef}
              className="w-full h-full"
              style={{ backgroundColor: videoMuted ? '#1f2937' : 'transparent' }}
            >
              {videoMuted && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
              {authState?.user?.username || 'You'} {micMuted && '(Muted)'}
            </div>
            <div className="absolute top-2 right-2 flex space-x-1">
              {videoMuted && (
                <div className="bg-red-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 14V8a2 2 0 00-2-2h-1.586l-.293-.293A1 1 0 0012.414 5H7.586l-2-2zM7 9a1 1 0 012 0v6a1 1 0 11-2 0V9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              {micMuted && (
                <div className="bg-red-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.293 7.293a1 1 0 011.414 0L18 8.586l1.293-1.293a1 1 0 111.414 1.414L19.414 10l1.293 1.293a1 1 0 01-1.414 1.414L18 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {Object.entries(remoteUsers).map(([uid, user]) => (
            <div key={uid} className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[200px]">
              <div
                ref={(el) => {
                  if (el) remoteVideoRefs.current[uid] = el;
                }}
                className="w-full h-full"
              >
                {!user.videoTrack && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded">
                User {uid}
              </div>
              {!user.audioTrack && (
                <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.293 7.293a1 1 0 011.414 0L18 8.586l1.293-1.293a1 1 0 111.414 1.414L19.414 10l1.293 1.293a1 1 0 01-1.414 1.414L18 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full ${micMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors`}
            title={micMuted ? 'Unmute' : 'Mute'}
          >
            {micMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.293 7.293a1 1 0 011.414 0L18 8.586l1.293-1.293a1 1 0 111.414 1.414L19.414 10l1.293 1.293a1 1 0 01-1.414 1.414L18 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L16.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${videoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'} text-white transition-colors`}
            title={videoMuted ? 'Turn on camera' : 'Turn off camera'}
          >
            {videoMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0017 14V8a2 2 0 00-2-2h-1.586l-.293-.293A1 1 0 0012.414 5H7.586l-2-2zM7 9a1 1 0 012 0v6a1 1 0 11-2 0V9z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleLeaveCall}
            className="px-6 py-3 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors"
          >
            Leave Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
