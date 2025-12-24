'use client';

import { useEffect, useState } from 'react';

export interface DeviceInfo {
  id: string;
  status: 'device' | 'offline' | 'unauthorized';
}

export function useDevices(refreshInterval: number = 5000) {
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices/check');
      const data = await response.json();
      
      setDevices(data.devices || []);
      setError(null);
    } catch (err) {
      setError('获取设备列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchDevices, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return { devices, loading, error, refetch: fetchDevices };
}
