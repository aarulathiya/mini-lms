// hooks/useNetwork.ts
import { useState, useEffect } from "react";
import * as Network from "expo-network";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkNetwork = async () => {
      const networkState = await Network.getNetworkStateAsync();
      setState({
        isConnected: networkState.isConnected ?? false,
        isInternetReachable: networkState.isInternetReachable ?? false,
      });
    };

    checkNetwork();
    intervalId = setInterval(checkNetwork, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return state;
}
