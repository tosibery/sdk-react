# Dolivroo React SDK

React hooks and components for the Dolivroo API.

## Installation

```bash
npm install @dolivroo/react @dolivroo/sdk
```

## Quick Start

```tsx
import { DolivrooProvider, useCreateParcel, useWilayas } from '@dolivroo/react';

function App() {
    return (
        <DolivrooProvider apiKey="your-api-key">
            <ShippingForm />
        </DolivrooProvider>
    );
}

function ShippingForm() {
    const { createParcel, loading, error, data } = useCreateParcel();
    const { data: wilayas } = useWilayas();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createParcel('yalidine', {
            customer: { first_name: 'Mohamed', last_name: 'Ali', phone: '0555000000' },
            destination: { wilaya: 'Alger' },
            package: { products: 'T-Shirt' },
            payment: { amount: 2500 }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <select>
                {wilayas?.data?.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                ))}
            </select>
            <button disabled={loading}>
                {loading ? 'Creating...' : 'Create Parcel'}
            </button>
            {data && <p>Created: {data.tracking_id}</p>}
            {error && <p>Error: {error.message}</p>}
        </form>
    );
}
```

## Available Hooks

| Hook | Purpose |
|------|---------|
| `useDolivroo()` | Access the Dolivroo client |
| `useCreateParcel()` | Create new parcels |
| `useParcel(trackingId, companyCode)` | Get parcel details |
| `useParcels(companyCode, page, perPage)` | List parcels |
| `useRates(companyCode, from, to)` | Get shipping rates |
| `useCompareRates(from, to)` | Compare rates |
| `useWilayas(companyCode?)` | List wilayas |

## License

MIT
