/**
 * Dolivroo React Hooks
 * 
 * React hooks and context for the Dolivroo SDK.
 * 
 * @example
 * ```tsx
 * import { DolivrooProvider, useDolivroo, useCreateParcel } from '@dolivroo/react';
 * 
 * function App() {
 *   return (
 *     <DolivrooProvider apiKey="your-api-key">
 *       <ShippingForm />
 *     </DolivrooProvider>
 *   );
 * }
 * 
 * function ShippingForm() {
 *   const { createParcel, loading, error } = useCreateParcel();
 *   // ...
 * }
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import Dolivroo, { OrderData, ParcelResponse, DolivrooConfig } from '@dolivroo/sdk';

// Types
interface DolivrooContextValue {
    client: Dolivroo | null;
    isReady: boolean;
}

interface DolivrooProviderProps {
    apiKey: string;
    config?: DolivrooConfig;
    children: ReactNode;
}

interface UseAsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

// Context
const DolivrooContext = createContext<DolivrooContextValue | null>(null);

// Provider
export function DolivrooProvider({ apiKey, config, children }: DolivrooProviderProps) {
    const client = useMemo(() => {
        if (!apiKey) return null;
        return new Dolivroo(apiKey, config);
    }, [apiKey, config]);

    const value = useMemo(() => ({
        client,
        isReady: !!client
    }), [client]);

    return (
        <DolivrooContext.Provider value={value}>
            {children}
        </DolivrooContext.Provider>
    );
}

// Base hook
export function useDolivroo() {
    const context = useContext(DolivrooContext);
    if (!context) {
        throw new Error('useDolivroo must be used within a DolivrooProvider');
    }
    return context;
}

// Parcel hooks
export function useCreateParcel() {
    const { client } = useDolivroo();
    const [state, setState] = useState<UseAsyncState<ParcelResponse>>({
        data: null,
        loading: false,
        error: null
    });

    const createParcel = useCallback(async (companyCode: string, order: OrderData) => {
        if (!client) throw new Error('Dolivroo client not initialized');

        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const result = await client.parcels.create(companyCode, order);
            setState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error });
            throw error;
        }
    }, [client]);

    return { ...state, createParcel };
}

export function useParcel(trackingId: string, companyCode: string) {
    const { client } = useDolivroo();
    const [state, setState] = useState<UseAsyncState<ParcelResponse>>({
        data: null,
        loading: true,
        error: null
    });

    const refresh = useCallback(async () => {
        if (!client || !trackingId) return;

        setState(prev => ({ ...prev, loading: true }));
        try {
            const result = await client.parcels.get(trackingId, companyCode);
            setState({ data: result, loading: false, error: null });
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error });
        }
    }, [client, trackingId, companyCode]);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    return { ...state, refresh };
}

export function useParcels(companyCode: string, page = 1, perPage = 25) {
    const { client } = useDolivroo();
    const [state, setState] = useState<UseAsyncState<ParcelResponse>>({
        data: null,
        loading: true,
        error: null
    });

    const refresh = useCallback(async () => {
        if (!client) return;

        setState(prev => ({ ...prev, loading: true }));
        try {
            const result = await client.parcels.list(companyCode, page, perPage);
            setState({ data: result, loading: false, error: null });
        } catch (error) {
            setState({ data: null, loading: false, error: error as Error });
        }
    }, [client, companyCode, page, perPage]);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    return { ...state, refresh };
}

// Rate hooks
export function useRates(companyCode: string, fromWilaya: string, toWilaya: string) {
    const { client } = useDolivroo();
    const [state, setState] = useState<UseAsyncState<any>>({
        data: null,
        loading: !!fromWilaya && !!toWilaya,
        error: null
    });

    React.useEffect(() => {
        if (!client || !fromWilaya || !toWilaya) return;

        setState(prev => ({ ...prev, loading: true }));
        client.rates.get(companyCode, fromWilaya, toWilaya)
            .then(data => setState({ data, loading: false, error: null }))
            .catch(error => setState({ data: null, loading: false, error }));
    }, [client, companyCode, fromWilaya, toWilaya]);

    return state;
}

export function useCompareRates(fromWilaya: string, toWilaya: string) {
    const { client } = useDolivroo();
    const [state, setState] = useState<UseAsyncState<any>>({
        data: null,
        loading: !!fromWilaya && !!toWilaya,
        error: null
    });

    React.useEffect(() => {
        if (!client || !fromWilaya || !toWilaya) return;

        setState(prev => ({ ...prev, loading: true }));
        client.rates.compare(fromWilaya, toWilaya)
            .then(data => setState({ data, loading: false, error: null }))
            .catch(error => setState({ data: null, loading: false, error }));
    }, [client, fromWilaya, toWilaya]);

    return state;
}

// Wilaya hooks
export function useWilayas(companyCode?: string) {
    const { client } = useDolivroo();
    const [state, setState] = useState<UseAsyncState<any>>({
        data: null,
        loading: true,
        error: null
    });

    React.useEffect(() => {
        if (!client) return;

        client.wilayas.list(companyCode)
            .then(data => setState({ data, loading: false, error: null }))
            .catch(error => setState({ data: null, loading: false, error }));
    }, [client, companyCode]);

    return state;
}

// Exports
export { Dolivroo, DolivrooConfig, OrderData, ParcelResponse };
export default Dolivroo;
