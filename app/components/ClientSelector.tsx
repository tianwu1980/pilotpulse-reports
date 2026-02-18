"use client";

interface ClientSelectorProps {
  value: string;
  onChange: (client: string) => void;
}

const CLIENTS = [
  { id: "henderson", name: "Henderson Security", industry: "Security Services" },
  { id: "call_lade", name: "Call Lade HR", industry: "Logistics & Haulage" },
  // { id: "skylink", name: "Skylink", industry: "Automotive" },
];

export default function ClientSelector({ value, onChange }: ClientSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">
        Client
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-white border border-border rounded-xl text-text-primary font-medium
                   focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent
                   transition-all cursor-pointer appearance-none
                   bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%2364748b%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
                   bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10"
      >
        {CLIENTS.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name} — {client.industry}
          </option>
        ))}
      </select>
    </div>
  );
}
