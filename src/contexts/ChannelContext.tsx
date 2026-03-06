import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Channel, ChannelCreate, APP_CONFIG, VerificationResult } from '../types';

interface ChannelContextType {
  channels: Channel[];
  isLoading: boolean;
  addChannel: (channel: ChannelCreate) => void;
  removeChannel: (id: string) => void;
  updateChannel: (id: string, updates: Partial<Channel>) => void;
  verifyChannel: (id: string) => Promise<void>;
  verifyAllChannels: () => Promise<void>;
  selectedChannel: Channel | null;
  setSelectedChannel: (channel: Channel | null) => void;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

// Función para verificar si una URL m3u8 está activa
async function verifyM3U8Url(url: string): Promise<VerificationResult> {
  const startTime = Date.now();

  try {
    // Intentar hacer HEAD request primero
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(timeoutId);

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      // Verificar si es un stream válido
      if (contentType.includes('mpegurl') ||
          contentType.includes('application/vnd.apple.mpegurl') ||
          contentType.includes('audio') ||
          contentType.includes('video') ||
          url.endsWith('.m3u8') ||
          url.endsWith('.m3u')) {
        return { url, status: 'online', responseTime };
      }
    }

    // Si HEAD no funciona, intentar con GET
    const getController = new AbortController();
    const getTimeoutId = setTimeout(() => getController.abort(), 15000);

    const getResponse = await fetch(url, {
      method: 'GET',
      signal: getController.signal,
      mode: 'cors'
    });

    clearTimeout(getTimeoutId);

    if (getResponse.ok) {
      return { url, status: 'online', responseTime: Date.now() - startTime };
    }

    return { url, status: 'offline', responseTime: Date.now() - startTime };
  } catch (error) {
    return {
      url,
      status: 'offline',
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

export function ChannelProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const verificationQueue = useRef<Set<string>>(new Set());
  const intervalRef = useRef<number | null>(null);

  // Cargar canales desde localStorage al iniciar
  useEffect(() => {
    const storedChannels = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.CHANNELS);
    if (storedChannels) {
      try {
        const parsed = JSON.parse(storedChannels);
        setChannels(parsed.map((ch: Channel) => ({
          ...ch,
          status: 'unknown' as const,
          lastChecked: undefined
        })));
      } catch {
        console.error('Error al cargar canales desde localStorage');
      }
    }
    setIsLoading(false);
  }, []);

  // Guardar canales en localStorage cuando cambien
  useEffect(() => {
    if (!isLoading && channels.length > 0) {
      const channelsToSave = channels.map(({ status, lastChecked, ...rest }) => rest);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.CHANNELS, JSON.stringify(channelsToSave));
    }
  }, [channels, isLoading]);

  // Verificar un canal específico
  const verifyChannel = useCallback(async (id: string) => {
    if (verificationQueue.current.has(id)) return;
    verificationQueue.current.add(id);

    setChannels(prev => prev.map(ch =>
      ch.id === id ? { ...ch, status: 'checking' } : ch
    ));

    const channel = channels.find(ch => ch.id === id);
    if (!channel) {
      verificationQueue.current.delete(id);
      return;
    }

    const result = await verifyM3U8Url(channel.url);

    setChannels(prev => prev.map(ch =>
      ch.id === id ? {
        ...ch,
        status: result.status,
        lastChecked: new Date()
      } : ch
    ));

    verificationQueue.current.delete(id);
  }, [channels]);

  // Verificar todos los canales
  const verifyAllChannels = useCallback(async () => {
    const offlineChannels = channels.filter(ch => ch.status !== 'online');
    await Promise.all(offlineChannels.map(ch => verifyChannel(ch.id)));
  }, [channels, verifyChannel]);

  // Intervalo de verificación automática cada 30 segundos
  useEffect(() => {
    if (channels.length === 0) return;

    // Verificar inmediatamente al cargar
    verifyAllChannels();

    // Configurar intervalo
    intervalRef.current = window.setInterval(() => {
      verifyAllChannels();
    }, APP_CONFIG.CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [channels.length]); // Solo se ejecuta cuando cambia el número de canales

  // Agregar un nuevo canal
  const addChannel = useCallback((channelData: ChannelCreate) => {
    const newChannel: Channel = {
      id: crypto.randomUUID(),
      ...channelData,
      isActive: true,
      status: 'unknown',
      createdAt: new Date()
    };

    setChannels(prev => [...prev, newChannel]);

    // Verificar el nuevo canal inmediatamente
    setTimeout(() => verifyChannel(newChannel.id), 500);
  }, [verifyChannel]);

  // Eliminar un canal
  const removeChannel = useCallback((id: string) => {
    setChannels(prev => prev.filter(ch => ch.id !== id));
    if (selectedChannel?.id === id) {
      setSelectedChannel(null);
    }
  }, [selectedChannel]);

  // Actualizar un canal
  const updateChannel = useCallback((id: string, updates: Partial<Channel>) => {
    setChannels(prev => prev.map(ch =>
      ch.id === id ? { ...ch, ...updates } : ch
    ));
  }, []);

  return (
    <ChannelContext.Provider value={{
      channels,
      isLoading,
      addChannel,
      removeChannel,
      updateChannel,
      verifyChannel,
      verifyAllChannels,
      selectedChannel,
      setSelectedChannel
    }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannels() {
  const context = useContext(ChannelContext);
  if (context === undefined) {
    throw new Error('useChannels debe ser usado dentro de un ChannelProvider');
  }
  return context;
}
