import { useState, useEffect, type FormEvent } from 'react';
import client from '@/api/client';

interface SectionState {
  saving: boolean;
  saved: boolean;
  error: string;
}

const SEASONS = ['Winter', 'Spring', 'Summer', 'Fall'] as const;

interface SeasonHours {
  open: string;
  close: string;
}

function useSectionState(): [SectionState, (updates: Partial<SectionState>) => void] {
  const [state, setState] = useState<SectionState>({ saving: false, saved: false, error: '' });
  function update(updates: Partial<SectionState>) {
    setState((prev) => ({ ...prev, ...updates }));
  }
  return [state, update];
}

export function BusinessRulesPage() {
  // Pay Rates
  const [managerRate, setManagerRate] = useState('18.00');
  const [keyLeadRate, setKeyLeadRate] = useState('15.00');
  const [scooperRate, setScooperRate] = useState('12.00');
  const [payState, setPayState] = useSectionState();

  // Operating Hours (per season)
  const [seasonHours, setSeasonHours] = useState<Record<string, SeasonHours>>({
    Winter: { open: '12:00', close: '20:00' },
    Spring: { open: '11:00', close: '21:00' },
    Summer: { open: '11:00', close: '22:00' },
    Fall: { open: '11:00', close: '21:00' },
  });
  const [hoursState, setHoursState] = useSectionState();

  // Labor Targets
  const [laborTarget, setLaborTarget] = useState('24');
  const [laborWatch, setLaborWatch] = useState('27');
  const [profitFloor, setProfitFloor] = useState('10');
  const [laborState, setLaborState] = useSectionState();

  // Workflow
  const [minOpeners, setMinOpeners] = useState('2');
  const [minClosers, setMinClosers] = useState('2');
  const [requirePolicyApproval, setRequirePolicyApproval] = useState(true);
  const [requireGmApproval, setRequireGmApproval] = useState(false);
  const [workflowState, setWorkflowState] = useSectionState();

  // Monday Scenarios
  const [mondayLow, setMondayLow] = useState('0.55');
  const [mondayBase, setMondayBase] = useState('0.65');
  const [mondayHigh, setMondayHigh] = useState('0.75');
  const [mondayState, setMondayState] = useSectionState();

  // Load current values
  useEffect(() => {
    client
      .get<Record<string, string>>('/settings', { params: { category: 'pay_rates' } })
      .then((res) => {
        const d = res.data;
        if (d.manager_rate) setManagerRate(d.manager_rate);
        if (d.key_lead_rate) setKeyLeadRate(d.key_lead_rate);
        if (d.scooper_rate) setScooperRate(d.scooper_rate);
      })
      .catch(() => { /* use defaults */ });

    client
      .get<Record<string, SeasonHours>>('/settings', { params: { category: 'operating_hours' } })
      .then((res) => {
        const d = res.data;
        if (d && typeof d === 'object' && Object.keys(d).length > 0) {
          setSeasonHours((prev) => ({ ...prev, ...d }));
        }
      })
      .catch(() => { /* use defaults */ });

    client
      .get<Record<string, string>>('/settings', { params: { category: 'labor_targets' } })
      .then((res) => {
        const d = res.data;
        if (d.target_pct) setLaborTarget(d.target_pct);
        if (d.watch_pct) setLaborWatch(d.watch_pct);
        if (d.profit_floor_pct) setProfitFloor(d.profit_floor_pct);
      })
      .catch(() => { /* use defaults */ });

    client
      .get<Record<string, string>>('/settings', { params: { category: 'workflow' } })
      .then((res) => {
        const d = res.data;
        if (d.min_openers) setMinOpeners(d.min_openers);
        if (d.min_closers) setMinClosers(d.min_closers);
        if (d.require_policy_approval !== undefined) setRequirePolicyApproval(d.require_policy_approval === 'true');
        if (d.require_gm_approval !== undefined) setRequireGmApproval(d.require_gm_approval === 'true');
      })
      .catch(() => { /* use defaults */ });

    client
      .get<Record<string, string>>('/settings', { params: { category: 'monday_scenarios' } })
      .then((res) => {
        const d = res.data;
        if (d.low_factor) setMondayLow(d.low_factor);
        if (d.base_factor) setMondayBase(d.base_factor);
        if (d.high_factor) setMondayHigh(d.high_factor);
      })
      .catch(() => { /* use defaults */ });
  }, []);

  async function savePayRates(e: FormEvent) {
    e.preventDefault();
    setPayState({ saving: true, saved: false, error: '' });
    try {
      await client.put('/settings', {
        category: 'pay_rates',
        values: {
          manager_rate: managerRate,
          key_lead_rate: keyLeadRate,
          scooper_rate: scooperRate,
        },
      });
      setPayState({ saving: false, saved: true, error: '' });
    } catch {
      setPayState({ saving: false, saved: false, error: 'Failed to save pay rates.' });
    }
  }

  async function saveHours(e: FormEvent) {
    e.preventDefault();
    setHoursState({ saving: true, saved: false, error: '' });
    try {
      await client.put('/settings', {
        category: 'operating_hours',
        values: seasonHours,
      });
      setHoursState({ saving: false, saved: true, error: '' });
    } catch {
      setHoursState({ saving: false, saved: false, error: 'Failed to save operating hours.' });
    }
  }

  async function saveLaborTargets(e: FormEvent) {
    e.preventDefault();
    setLaborState({ saving: true, saved: false, error: '' });
    try {
      await client.put('/settings', {
        category: 'labor_targets',
        values: {
          target_pct: laborTarget,
          watch_pct: laborWatch,
          profit_floor_pct: profitFloor,
        },
      });
      setLaborState({ saving: false, saved: true, error: '' });
    } catch {
      setLaborState({ saving: false, saved: false, error: 'Failed to save labor targets.' });
    }
  }

  async function saveWorkflow(e: FormEvent) {
    e.preventDefault();
    setWorkflowState({ saving: true, saved: false, error: '' });
    try {
      await client.put('/settings', {
        category: 'workflow',
        values: {
          min_openers: minOpeners,
          min_closers: minClosers,
          require_policy_approval: String(requirePolicyApproval),
          require_gm_approval: String(requireGmApproval),
        },
      });
      setWorkflowState({ saving: false, saved: true, error: '' });
    } catch {
      setWorkflowState({ saving: false, saved: false, error: 'Failed to save workflow settings.' });
    }
  }

  async function saveMondayScenarios(e: FormEvent) {
    e.preventDefault();
    setMondayState({ saving: true, saved: false, error: '' });
    try {
      await client.put('/settings', {
        category: 'monday_scenarios',
        values: {
          low_factor: mondayLow,
          base_factor: mondayBase,
          high_factor: mondayHigh,
        },
      });
      setMondayState({ saving: false, saved: true, error: '' });
    } catch {
      setMondayState({ saving: false, saved: false, error: 'Failed to save Monday scenarios.' });
    }
  }

  function updateSeasonHours(season: string, field: 'open' | 'close', value: string) {
    setSeasonHours((prev) => ({
      ...prev,
      [season]: { ...prev[season], [field]: value },
    }));
  }

  function renderFeedback(state: SectionState) {
    return (
      <>
        {state.error && (
          <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        )}
        {state.saved && (
          <div className="mt-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            Saved successfully.
          </div>
        )}
      </>
    );
  }

  function renderSaveButton(state: SectionState) {
    return (
      <button
        type="submit"
        disabled={state.saving}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state.saving ? 'Saving...' : 'Save'}
      </button>
    );
  }

  const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Business Rules</h1>
        <p className="text-sm text-gray-500 mt-1">Configure operating parameters for your locations.</p>
      </div>

      {/* Pay Rates */}
      <form onSubmit={(e) => void savePayRates(e)} className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Pay Rates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Manager $/hr</label>
            <input type="number" step="0.01" min="0" value={managerRate} onChange={(e) => setManagerRate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Key Lead $/hr</label>
            <input type="number" step="0.01" min="0" value={keyLeadRate} onChange={(e) => setKeyLeadRate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Scooper $/hr</label>
            <input type="number" step="0.01" min="0" value={scooperRate} onChange={(e) => setScooperRate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">{renderSaveButton(payState)}</div>
        {renderFeedback(payState)}
      </form>

      {/* Operating Hours */}
      <form onSubmit={(e) => void saveHours(e)} className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Operating Hours</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Season</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Open</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {SEASONS.map((season) => (
                <tr key={season}>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{season}</td>
                  <td className="px-4 py-2">
                    <input type="time" value={seasonHours[season]?.open ?? ''} onChange={(e) => updateSeasonHours(season, 'open', e.target.value)} className={inputClass} />
                  </td>
                  <td className="px-4 py-2">
                    <input type="time" value={seasonHours[season]?.close ?? ''} onChange={(e) => updateSeasonHours(season, 'close', e.target.value)} className={inputClass} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">{renderSaveButton(hoursState)}</div>
        {renderFeedback(hoursState)}
      </form>

      {/* Labor Targets */}
      <form onSubmit={(e) => void saveLaborTargets(e)} className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Labor Targets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Labor %</label>
            <input type="number" step="0.1" min="0" max="100" value={laborTarget} onChange={(e) => setLaborTarget(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Watch Threshold %</label>
            <input type="number" step="0.1" min="0" max="100" value={laborWatch} onChange={(e) => setLaborWatch(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Profit Floor %</label>
            <input type="number" step="0.1" min="0" max="100" value={profitFloor} onChange={(e) => setProfitFloor(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">{renderSaveButton(laborState)}</div>
        {renderFeedback(laborState)}
      </form>

      {/* Workflow */}
      <form onSubmit={(e) => void saveWorkflow(e)} className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Workflow</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Openers</label>
            <input type="number" min="1" value={minOpeners} onChange={(e) => setMinOpeners(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Closers</label>
            <input type="number" min="1" value={minClosers} onChange={(e) => setMinClosers(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={requirePolicyApproval}
              onChange={(e) => setRequirePolicyApproval(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Require policy approval for exceptions</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={requireGmApproval}
              onChange={(e) => setRequireGmApproval(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Require GM approval for schedule publish</span>
          </label>
        </div>
        <div className="mt-4 flex justify-end">{renderSaveButton(workflowState)}</div>
        {renderFeedback(workflowState)}
      </form>

      {/* Monday Scenarios */}
      <form onSubmit={(e) => void saveMondayScenarios(e)} className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Monday Scenarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Low Factor</label>
            <input type="number" step="0.01" min="0" max="1" value={mondayLow} onChange={(e) => setMondayLow(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Base Factor</label>
            <input type="number" step="0.01" min="0" max="1" value={mondayBase} onChange={(e) => setMondayBase(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">High Factor</label>
            <input type="number" step="0.01" min="0" max="1" value={mondayHigh} onChange={(e) => setMondayHigh(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">{renderSaveButton(mondayState)}</div>
        {renderFeedback(mondayState)}
      </form>
    </div>
  );
}
