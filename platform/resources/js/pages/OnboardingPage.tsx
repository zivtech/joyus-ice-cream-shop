import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useOnboardingStatus, useLocations } from '@/api/hooks';
import client from '@/api/client';
import type { Location } from '@/types';

const STEP_KEYS = ['welcome', 'locations', 'connect_pos', 'import_data', 'business_rules', 'done'] as const;
const STEP_LABELS = ['Welcome', 'Locations', 'Connect POS', 'Import Data', 'Business Rules', 'Done'];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {STEP_LABELS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`mt-1 text-xs font-medium ${
                  isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Milk Jawn!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Let's get your account set up. We'll walk you through connecting your POS,
        importing data, and configuring your business rules.
      </p>
      <button
        type="button"
        onClick={onNext}
        className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}

function LocationsStep({ locations, onNext, onBack }: { locations: Location[]; onNext: () => void; onBack: () => void }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Locations</h2>
      <p className="text-sm text-gray-500 mb-6">
        Review your existing locations or create new ones from the Settings page.
      </p>

      {locations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center mb-6">
          <p className="text-sm text-gray-500 mb-3">No locations found.</p>
          <p className="text-xs text-gray-400">
            Locations can be created via the API or admin panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900">{loc.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Code: {loc.code}</p>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  loc.status === 'active'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {loc.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}

interface PosConnectionState {
  adapter: string;
  token: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message: string;
}

function ConnectPosStep({ locations, onNext, onBack }: { locations: Location[]; onNext: () => void; onBack: () => void }) {
  const [connections, setConnections] = useState<Record<number, PosConnectionState>>({});

  useEffect(() => {
    const initial: Record<number, PosConnectionState> = {};
    for (const loc of locations) {
      initial[loc.id] = {
        adapter: loc.pos_adapter || 'square',
        token: '',
        status: loc.square_location_id ? 'success' : 'idle',
        message: loc.square_location_id ? 'Already connected' : '',
      };
    }
    setConnections(initial);
  }, [locations]);

  function updateConnection(id: number, updates: Partial<PosConnectionState>) {
    setConnections((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  }

  async function testConnection(locationId: number) {
    const conn = connections[locationId];
    if (!conn) return;
    updateConnection(locationId, { status: 'testing', message: '' });
    try {
      await client.post('/onboarding/connect-pos', {
        location_id: locationId,
        adapter: conn.adapter,
        access_token: conn.token,
      });
      updateConnection(locationId, { status: 'success', message: 'Connected successfully' });
    } catch {
      updateConnection(locationId, { status: 'error', message: 'Connection failed. Check your access token.' });
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Connect Your POS</h2>
      <p className="text-sm text-gray-500 mb-6">
        Connect each location to your point-of-sale system.
      </p>

      {locations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center mb-6">
          <p className="text-sm text-gray-500">No locations to connect. Go back and add locations first.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {locations.map((loc) => {
            const conn = connections[loc.id];
            if (!conn) return null;
            return (
              <div key={loc.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{loc.name}</h3>
                    <p className="text-xs text-gray-500">{loc.code}</p>
                  </div>
                  {conn.status === 'success' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Connected
                    </span>
                  )}
                </div>

                {conn.status !== 'success' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">POS Adapter</label>
                      <select
                        value={conn.adapter}
                        onChange={(e) => updateConnection(loc.id, { adapter: e.target.value })}
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="square">Square</option>
                        <option value="toast">Toast</option>
                        <option value="clover">Clover</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Access Token</label>
                      <input
                        type="password"
                        value={conn.token}
                        onChange={(e) => updateConnection(loc.id, { token: e.target.value })}
                        placeholder="Paste your access token"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void testConnection(loc.id)}
                      disabled={conn.status === 'testing' || !conn.token}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {conn.status === 'testing' ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                )}

                {conn.status === 'error' && conn.message && (
                  <div className="mt-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {conn.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}

interface ImportState {
  status: 'idle' | 'importing' | 'done' | 'error';
  daysImported: number;
  employeesSynced: number;
  message: string;
}

function ImportDataStep({ locations, onNext, onBack }: { locations: Location[]; onNext: () => void; onBack: () => void }) {
  const [imports, setImports] = useState<Record<number, ImportState>>({});

  useEffect(() => {
    const initial: Record<number, ImportState> = {};
    for (const loc of locations) {
      initial[loc.id] = { status: 'idle', daysImported: 0, employeesSynced: 0, message: '' };
    }
    setImports(initial);
  }, [locations]);

  function updateImport(id: number, updates: Partial<ImportState>) {
    setImports((prev) => ({ ...prev, [id]: { ...prev[id], ...updates } }));
  }

  async function importData(locationId: number) {
    updateImport(locationId, { status: 'importing', message: '' });
    try {
      const res = await client.post<{ days_imported: number; employees_synced: number }>(
        '/onboarding/import-data',
        { location_id: locationId },
      );
      updateImport(locationId, {
        status: 'done',
        daysImported: res.data.days_imported,
        employeesSynced: res.data.employees_synced,
      });
    } catch {
      updateImport(locationId, { status: 'error', message: 'Import failed. Please try again.' });
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Import Historical Data</h2>
      <p className="text-sm text-gray-500 mb-6">
        Pull in your historical sales and employee data from each connected location.
      </p>

      {locations.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center mb-6">
          <p className="text-sm text-gray-500">No locations available for import.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          {locations.map((loc) => {
            const imp = imports[loc.id];
            if (!imp) return null;
            return (
              <div key={loc.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{loc.name}</h3>
                    <p className="text-xs text-gray-500">{loc.code}</p>
                  </div>
                  {imp.status === 'idle' && (
                    <button
                      type="button"
                      onClick={() => void importData(loc.id)}
                      className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                    >
                      Import Historical Data
                    </button>
                  )}
                  {imp.status === 'importing' && (
                    <span className="inline-flex items-center gap-2 text-sm text-indigo-600">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Importing...
                    </span>
                  )}
                  {imp.status === 'done' && (
                    <span className="text-sm text-green-700">
                      {imp.daysImported} days imported, {imp.employeesSynced} employees synced
                    </span>
                  )}
                </div>
                {imp.status === 'error' && imp.message && (
                  <div className="mt-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                    {imp.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Back
        </button>
        <button type="button" onClick={onNext} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
          Next
        </button>
      </div>
    </div>
  );
}

interface BusinessRulesFormData {
  manager_rate: string;
  key_lead_rate: string;
  scooper_rate: string;
  open_time: string;
  close_time: string;
  labor_target: string;
  labor_watch: string;
  min_openers: string;
  min_closers: string;
}

function BusinessRulesStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const [form, setForm] = useState<BusinessRulesFormData>({
    manager_rate: '18',
    key_lead_rate: '15',
    scooper_rate: '12',
    open_time: '11:00',
    close_time: '21:00',
    labor_target: '24',
    labor_watch: '27',
    min_openers: '2',
    min_closers: '2',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  function updateField(field: keyof BusinessRulesFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaved(false);
    try {
      await client.post('/onboarding/configure-rules', {
        pay_rates: {
          manager: parseFloat(form.manager_rate),
          key_lead: parseFloat(form.key_lead_rate),
          scooper: parseFloat(form.scooper_rate),
        },
        operating_hours: {
          open: form.open_time,
          close: form.close_time,
        },
        labor_targets: {
          target_pct: parseFloat(form.labor_target),
          watch_pct: parseFloat(form.labor_watch),
        },
        workflow: {
          min_openers: parseInt(form.min_openers, 10),
          min_closers: parseInt(form.min_closers, 10),
        },
      });
      setSaved(true);
    } catch {
      setSaveError('Failed to save configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Business Rules</h2>
      <p className="text-sm text-gray-500 mb-6">
        Configure your key operating parameters. These can be adjusted later in Settings.
      </p>

      <form onSubmit={(e) => void handleSave(e)} className="space-y-6 mb-6">
        {/* Pay Rates */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Pay Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Manager $/hr</label>
              <input type="number" step="0.01" min="0" value={form.manager_rate} onChange={(e) => updateField('manager_rate', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Key Lead $/hr</label>
              <input type="number" step="0.01" min="0" value={form.key_lead_rate} onChange={(e) => updateField('key_lead_rate', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Scooper $/hr</label>
              <input type="number" step="0.01" min="0" value={form.scooper_rate} onChange={(e) => updateField('scooper_rate', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Operating Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Open Time</label>
              <input type="time" value={form.open_time} onChange={(e) => updateField('open_time', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Close Time</label>
              <input type="time" value={form.close_time} onChange={(e) => updateField('close_time', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Labor Targets */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Labor Targets</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target %</label>
              <input type="number" step="0.1" min="0" max="100" value={form.labor_target} onChange={(e) => updateField('labor_target', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Watch %</label>
              <input type="number" step="0.1" min="0" max="100" value={form.labor_watch} onChange={(e) => updateField('labor_watch', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* Workflow */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Workflow</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Openers</label>
              <input type="number" min="1" value={form.min_openers} onChange={(e) => updateField('min_openers', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Min Closers</label>
              <input type="number" min="1" value={form.min_closers} onChange={(e) => updateField('min_closers', e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {saveError && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}
        {saved && (
          <div className="rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            Configuration saved successfully.
          </div>
        )}

        <div className="flex justify-between">
          <button type="button" onClick={onBack} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Back
          </button>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            <button type="button" onClick={onNext} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function DoneStep() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-3">You're all set!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Your account is configured and ready to go. You can always adjust your settings later.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/planner"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Shift Planner
        </Link>
        <Link
          to="/settings"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}

export function OnboardingPage() {
  const { data: onboardingStatus, loading: statusLoading } = useOnboardingStatus();
  const { data: locations, loading: locationsLoading } = useLocations();
  const [currentStep, setCurrentStep] = useState(1);

  // Resume from API status on mount
  useEffect(() => {
    if (onboardingStatus) {
      const stepIndex = STEP_KEYS.indexOf(onboardingStatus.current_step as typeof STEP_KEYS[number]);
      if (stepIndex >= 0) {
        setCurrentStep(stepIndex + 1);
      }
    }
  }, [onboardingStatus]);

  if (statusLoading || locationsLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Onboarding</h1>
        <p className="text-sm text-gray-500 mt-1">Set up your Milk Jawn account step by step.</p>
      </div>

      <StepIndicator currentStep={currentStep} />

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        {currentStep === 1 && <WelcomeStep onNext={() => setCurrentStep(2)} />}
        {currentStep === 2 && <LocationsStep locations={locations} onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
        {currentStep === 3 && <ConnectPosStep locations={locations} onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />}
        {currentStep === 4 && <ImportDataStep locations={locations} onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />}
        {currentStep === 5 && <BusinessRulesStep onNext={() => setCurrentStep(6)} onBack={() => setCurrentStep(4)} />}
        {currentStep === 6 && <DoneStep />}
      </div>
    </div>
  );
}
