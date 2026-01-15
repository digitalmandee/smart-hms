import { Badge } from '@/components/ui/badge';
import { ImagingModality, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { cn } from '@/lib/utils';

interface ModalityBadgeProps {
  modality: ImagingModality;
  className?: string;
}

const MODALITY_COLORS: Record<ImagingModality, string> = {
  xray: 'bg-blue-100 text-blue-800 border-blue-200',
  ultrasound: 'bg-purple-100 text-purple-800 border-purple-200',
  ct_scan: 'bg-orange-100 text-orange-800 border-orange-200',
  mri: 'bg-green-100 text-green-800 border-green-200',
  fluoroscopy: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  mammography: 'bg-pink-100 text-pink-800 border-pink-200',
  dexa: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  ecg: 'bg-red-100 text-red-800 border-red-200',
  echo: 'bg-rose-100 text-rose-800 border-rose-200',
  pet_ct: 'bg-amber-100 text-amber-800 border-amber-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ModalityBadge({ modality, className }: ModalityBadgeProps) {
  const config = IMAGING_MODALITIES.find(m => m.value === modality);
  const colorClass = MODALITY_COLORS[modality] || MODALITY_COLORS.other;

  return (
    <Badge variant="outline" className={cn(colorClass, className)}>
      {config?.label || modality}
    </Badge>
  );
}
