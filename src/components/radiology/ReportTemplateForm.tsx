import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagingFindingStatus } from '@/hooks/useImaging';

interface ReportTemplateFormProps {
  findings: string;
  impression: string;
  recommendations: string;
  technique: string;
  comparison: string;
  findingStatus?: ImagingFindingStatus;
  onChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const FINDING_STATUSES: { value: ImagingFindingStatus; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'abnormal', label: 'Abnormal' },
  { value: 'critical', label: 'Critical' },
];

export function ReportTemplateForm({
  findings,
  impression,
  recommendations,
  technique,
  comparison,
  findingStatus,
  onChange,
  disabled = false,
}: ReportTemplateFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="technique">Technique</Label>
          <Textarea
            id="technique"
            value={technique}
            onChange={(e) => onChange('technique', e.target.value)}
            placeholder="Describe the imaging technique used..."
            rows={2}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="comparison">Comparison</Label>
          <Textarea
            id="comparison"
            value={comparison}
            onChange={(e) => onChange('comparison', e.target.value)}
            placeholder="Compare with prior studies if available..."
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="findings">Findings *</Label>
        <Textarea
          id="findings"
          value={findings}
          onChange={(e) => onChange('findings', e.target.value)}
          placeholder="Describe the detailed findings from the study..."
          rows={8}
          disabled={disabled}
          className="font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="impression">Impression *</Label>
        <Textarea
          id="impression"
          value={impression}
          onChange={(e) => onChange('impression', e.target.value)}
          placeholder="Summarize the key findings and diagnosis..."
          rows={4}
          disabled={disabled}
          className="font-semibold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="findingStatus">Finding Status</Label>
          <Select
            value={findingStatus || ''}
            onValueChange={(value) => onChange('finding_status', value)}
            disabled={disabled}
          >
            <SelectTrigger id="findingStatus">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {FINDING_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="recommendations">Recommendations</Label>
          <Textarea
            id="recommendations"
            value={recommendations}
            onChange={(e) => onChange('recommendations', e.target.value)}
            placeholder="Any follow-up recommendations..."
            rows={3}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
