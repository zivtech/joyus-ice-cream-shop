import { useState, useCallback } from 'react';
import { useComplianceRules } from '@/api/hooks';
import client from '@/api/client';
import type { ComplianceRule } from '@/types';

type CoverageRequirement = ComplianceRule['coverage_requirement'];
type ConstraintType = ComplianceRule['constraint_type'];

interface RuleFormData {
  jurisdiction: string;
  certification_type: string;
  coverage_requirement: CoverageRequirement;
  constraint_type: ConstraintType;
  minimum_certified_count: number;
  expiration_months: number | null;
  active: boolean;
  notes: string;
}

const emptyForm: RuleFormData = {
  jurisdiction: '',
  certification_type: '',
  coverage_requirement: 'every_shift',
  constraint_type: 'hard',
  minimum_certified_count: 1,
  expiration_months: null,
  active: true,
  notes: '',
};

const coverageLabels: Record<CoverageRequirement, string> = {
  every_shift: 'Every Shift',
  operating_hours: 'Operating Hours',
  per_location: 'Per Location',
};

export function CompliancePage() {
  const [jurisdictionFilter, setJurisdictionFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(undefined);
  const { data: rules, loading, error, refresh } = useComplianceRules({
    jurisdiction: jurisdictionFilter || undefined,
    active: activeFilter,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [form, setForm] = useState<RuleFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [presets, setPresets] = useState<string[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);

  const jurisdictions = Array.from(new Set(rules.map((r) => r.jurisdiction))).sort();

  function openAdd() {
    setEditingRule(null);
    setForm(emptyForm);
    setSaveError('');
    setModalOpen(true);
  }

  function openEdit(rule: ComplianceRule) {
    setEditingRule(rule);
    setForm({
      jurisdiction: rule.jurisdiction,
      certification_type: rule.certification_type,
      coverage_requirement: rule.coverage_requirement,
      constraint_type: rule.constraint_type,
      minimum_certified_count: rule.minimum_certified_count,
      expiration_months: rule.expiration_months,
      active: rule.active,
      notes: rule.notes ?? '',
    });
    setSaveError('');
    setModalOpen(true);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError('');
    try {
      if (editingRule) {
        await client.put(`/compliance-rules/${editingRule.id}`, form);
      } else {
        await client.post('/compliance-rules', form);
      }
      setModalOpen(false);
      refresh();
    } catch {
      setSaveError('Failed to save rule.');
    } finally {
      setSaving(false);
    }
  }, [editingRule, form, refresh]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this compliance rule?')) return;
    try {
      await client.delete(`/compliance-rules/${id}`);
      refresh();
    } catch {
      /* ignore */
    }
  }

  async function loadPresets() {
    setPresetsLoading(true);
    try {
      const res = await client.get<string[]>('/compliance-rules/presets');
      setPresets(res.data);
      setPresetsOpen(true);
    } catch {
      /* ignore */
    } finally {
      setPresetsLoading(false);
    }
  }

  async function importPreset(jurisdiction: string) {
    try {
      await client.post('/compliance-rules', { import_preset: jurisdiction });
      setPresetsOpen(false);
      refresh();
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Compliance Rules</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage certification and coverage requirements by jurisdiction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPresets}
            disabled={presetsLoading}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {presetsLoading ? 'Loading...' : 'Load Presets'}
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Add Rule
          </button>
        </div>
      </div>

      {/* Preset dropdown */}
      {presetsOpen && presets.length > 0 && (
        <div className="mb-4 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Import Preset by Jurisdiction</h3>
            <button
              type="button"
              onClick={() => setPresetsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Close
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => void importPreset(j)}
                className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {j}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <select
          value={jurisdictionFilter}
          onChange={(e) => setJurisdictionFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Jurisdictions</option>
          {jurisdictions.map((j) => (
            <option key={j} value={j}>{j}</option>
          ))}
        </select>
        <select
          value={activeFilter === undefined ? '' : String(activeFilter)}
          onChange={(e) => {
            const v = e.target.value;
            setActiveFilter(v === '' ? undefined : v === 'true');
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Active &amp; Inactive</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Rules table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">Loading...</div>
        ) : rules.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            No compliance rules found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Jurisdiction</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Certification</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Coverage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Constraint</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Min Count</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Expiration (mo)</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{rule.jurisdiction}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{rule.certification_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{coverageLabels[rule.coverage_requirement]}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        rule.constraint_type === 'hard'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rule.constraint_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{rule.minimum_certified_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">{rule.expiration_months ?? '--'}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        rule.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(rule)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(rule.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">
                {editingRule ? 'Edit Compliance Rule' : 'Add Compliance Rule'}
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              {saveError && (
                <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {saveError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
                  <input
                    type="text"
                    value={form.jurisdiction}
                    onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certification Type</label>
                  <input
                    type="text"
                    value={form.certification_type}
                    onChange={(e) => setForm({ ...form, certification_type: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Requirement</label>
                  <select
                    value={form.coverage_requirement}
                    onChange={(e) => setForm({ ...form, coverage_requirement: e.target.value as CoverageRequirement })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="every_shift">Every Shift</option>
                    <option value="operating_hours">Operating Hours</option>
                    <option value="per_location">Per Location</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Constraint Type</label>
                  <select
                    value={form.constraint_type}
                    onChange={(e) => setForm({ ...form, constraint_type: e.target.value as ConstraintType })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="hard">Hard</option>
                    <option value="soft">Soft</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Certified Count</label>
                  <input
                    type="number"
                    min={1}
                    value={form.minimum_certified_count}
                    onChange={(e) => setForm({ ...form, minimum_certified_count: Number(e.target.value) })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiration (months)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.expiration_months ?? ''}
                    onChange={(e) => setForm({ ...form, expiration_months: e.target.value ? Number(e.target.value) : null })}
                    placeholder="None"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rule-active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="rule-active" className="text-sm text-gray-700">Active</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || !form.jurisdiction || !form.certification_type}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingRule ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
