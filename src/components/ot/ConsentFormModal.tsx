import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SignaturePad } from '@/components/ui/signature-pad';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useSurgeryConsents,
  useCreateConsent,
  useRevokeConsent,
  CONSENT_TYPES,
  type SurgeryConsent,
} from '@/hooks/useConsentForms';
import { format } from 'date-fns';
import { Plus, Check, X, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ConsentFormModalProps {
  surgeryId: string;
  patientName: string;
  procedureName: string;
}

type ConsentType = 'surgical' | 'anesthesia' | 'blood_transfusion' | 'high_risk';

const RELATIONSHIP_OPTIONS = [
  { value: 'self', label: 'Self (Patient)' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Adult Child' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'power_of_attorney', label: 'Power of Attorney' },
];

export function ConsentFormModal({
  surgeryId,
  patientName,
  procedureName,
}: ConsentFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  // Form state
  const [consentType, setConsentType] = useState<ConsentType>('surgical');
  const [procedureExplained, setProcedureExplained] = useState('');
  const [risksExplained, setRisksExplained] = useState('');
  const [alternativesExplained, setAlternativesExplained] = useState('');
  const [patientQuestions, setPatientQuestions] = useState('');
  const [patientSignature, setPatientSignature] = useState('');
  const [patientRelationship, setPatientRelationship] = useState('self');
  const [witnessName, setWitnessName] = useState('');
  const [witnessSignature, setWitnessSignature] = useState('');

  const { data: consents, isLoading } = useSurgeryConsents(surgeryId);
  const createConsent = useCreateConsent();
  const revokeConsent = useRevokeConsent();

  const resetForm = () => {
    setConsentType('surgical');
    setProcedureExplained('');
    setRisksExplained('');
    setAlternativesExplained('');
    setPatientQuestions('');
    setPatientSignature('');
    setPatientRelationship('self');
    setWitnessName('');
    setWitnessSignature('');
    setIsAddingNew(false);
  };

  const handleSubmit = async () => {
    if (!patientSignature) {
      toast.error('Patient signature is required');
      return;
    }

    await createConsent.mutateAsync({
      surgery_id: surgeryId,
      consent_type: consentType,
      procedure_explained: procedureExplained,
      risks_explained: risksExplained,
      alternatives_explained: alternativesExplained,
      patient_questions: patientQuestions,
      patient_signature: patientSignature,
      patient_relationship: patientRelationship,
      witness_name: witnessName,
      witness_signature: witnessSignature,
    });

    resetForm();
  };

  const handleRevoke = async (consent: SurgeryConsent) => {
    if (!revokeReason.trim()) {
      toast.error('Revocation reason is required');
      return;
    }

    await revokeConsent.mutateAsync({
      consentId: consent.id,
      surgeryId: surgeryId,
      reason: revokeReason,
    });

    setRevokeReason('');
  };

  const getExistingConsentTypes = () => {
    return consents?.filter(c => c.is_valid).map(c => c.consent_type) || [];
  };

  const validConsents = consents?.filter(c => c.is_valid) || [];
  const revokedConsents = consents?.filter(c => !c.is_valid) || [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Consent Forms
          {validConsents.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {validConsents.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Consent Forms</DialogTitle>
          <DialogDescription>
            {patientName} - {procedureName}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {!isAddingNew ? (
            <div className="space-y-4">
              {/* Existing Consents */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Signed Consents</h3>
                <Button onClick={() => setIsAddingNew(true)} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Consent
                </Button>
              </div>

              {isLoading ? (
                <p className="text-muted-foreground text-sm">Loading consents...</p>
              ) : validConsents.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No consent forms signed yet</p>
                    <Button
                      variant="link"
                      onClick={() => setIsAddingNew(true)}
                      className="mt-2"
                    >
                      Add the first consent form
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {validConsents.map((consent) => (
                    <ConsentCard
                      key={consent.id}
                      consent={consent}
                      onRevoke={handleRevoke}
                      revokeReason={revokeReason}
                      setRevokeReason={setRevokeReason}
                      isRevoking={revokeConsent.isPending}
                    />
                  ))}
                </div>
              )}

              {/* Revoked Consents */}
              {revokedConsents.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    Revoked Consents
                  </h3>
                  <div className="space-y-3 opacity-60">
                    {revokedConsents.map((consent) => (
                      <ConsentCard
                        key={consent.id}
                        consent={consent}
                        isRevoked
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Add New Consent Form */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">New Consent Form</h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              </div>

              {/* Consent Type */}
              <div className="space-y-2">
                <Label>Consent Type *</Label>
                <Select value={consentType} onValueChange={(v) => setConsentType(v as ConsentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CONSENT_TYPES).map(([key, { label, description }]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={getExistingConsentTypes().includes(key as ConsentType)}
                      >
                        <div className="flex flex-col">
                          <span>{label}</span>
                          {getExistingConsentTypes().includes(key as ConsentType) && (
                            <span className="text-xs text-muted-foreground">Already signed</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {CONSENT_TYPES[consentType].description}
                </p>
              </div>

              {/* Procedure Explained */}
              <div className="space-y-2">
                <Label>Procedure Explained</Label>
                <Textarea
                  value={procedureExplained}
                  onChange={(e) => setProcedureExplained(e.target.value)}
                  placeholder="Description of procedure explained to patient..."
                  rows={3}
                />
              </div>

              {/* Risks Explained */}
              <div className="space-y-2">
                <Label>Risks Explained</Label>
                <Textarea
                  value={risksExplained}
                  onChange={(e) => setRisksExplained(e.target.value)}
                  placeholder="Risks discussed with patient..."
                  rows={3}
                />
              </div>

              {/* Alternatives Explained */}
              <div className="space-y-2">
                <Label>Alternatives Explained</Label>
                <Textarea
                  value={alternativesExplained}
                  onChange={(e) => setAlternativesExplained(e.target.value)}
                  placeholder="Alternative treatment options discussed..."
                  rows={2}
                />
              </div>

              {/* Patient Questions */}
              <div className="space-y-2">
                <Label>Patient Questions & Responses</Label>
                <Textarea
                  value={patientQuestions}
                  onChange={(e) => setPatientQuestions(e.target.value)}
                  placeholder="Questions asked by patient and responses given..."
                  rows={2}
                />
              </div>

              <Separator />

              {/* Patient/Representative Info */}
              <div className="space-y-2">
                <Label>Signed By (Relationship to Patient) *</Label>
                <Select value={patientRelationship} onValueChange={setPatientRelationship}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Signature */}
              <div className="space-y-2">
                <Label>Patient/Representative Signature *</Label>
                <SignaturePad
                  value={patientSignature}
                  onChange={setPatientSignature}
                  height={120}
                />
              </div>

              <Separator />

              {/* Witness Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Witness Name</Label>
                  <Input
                    value={witnessName}
                    onChange={(e) => setWitnessName(e.target.value)}
                    placeholder="Witness full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Witness Signature</Label>
                <SignaturePad
                  value={witnessSignature}
                  onChange={setWitnessSignature}
                  height={100}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!patientSignature || createConsent.isPending}
                >
                  {createConsent.isPending ? 'Saving...' : 'Sign Consent Form'}
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface ConsentCardProps {
  consent: SurgeryConsent;
  onRevoke?: (consent: SurgeryConsent) => void;
  revokeReason?: string;
  setRevokeReason?: (reason: string) => void;
  isRevoking?: boolean;
  isRevoked?: boolean;
}

function ConsentCard({
  consent,
  onRevoke,
  revokeReason = '',
  setRevokeReason,
  isRevoking,
  isRevoked,
}: ConsentCardProps) {
  return (
    <Card className={isRevoked ? 'border-destructive/30' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {isRevoked ? (
              <X className="h-4 w-4 text-destructive" />
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
            {CONSENT_TYPES[consent.consent_type as ConsentType].label}
          </CardTitle>
          {isRevoked ? (
            <Badge variant="destructive">Revoked</Badge>
          ) : (
            <Badge variant="default" className="bg-green-600">Valid</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <span>Signed:</span>
          <span className="text-foreground">
            {consent.patient_signed_at
              ? format(new Date(consent.patient_signed_at), 'PPp')
              : '-'}
          </span>
          <span>Relationship:</span>
          <span className="text-foreground capitalize">
            {consent.patient_relationship?.replace('_', ' ') || 'Self'}
          </span>
          {consent.witness_name && (
            <>
              <span>Witness:</span>
              <span className="text-foreground">{consent.witness_name}</span>
            </>
          )}
          {consent.explained_by_profile?.full_name && (
            <>
              <span>Explained by:</span>
              <span className="text-foreground">{consent.explained_by_profile.full_name}</span>
            </>
          )}
        </div>

        {isRevoked && consent.revocation_reason && (
          <div className="mt-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
            <strong>Revocation Reason:</strong> {consent.revocation_reason}
          </div>
        )}

        {!isRevoked && onRevoke && setRevokeReason && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive mt-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Revoke Consent
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke Consent</AlertDialogTitle>
                <AlertDialogDescription>
                  This will invalidate the consent form. A new consent must be obtained
                  before proceeding with the procedure. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label>Reason for Revocation *</Label>
                <Textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Enter the reason for revoking this consent..."
                  className="mt-2"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRevokeReason('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRevoke(consent)}
                  disabled={!revokeReason.trim() || isRevoking}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isRevoking ? 'Revoking...' : 'Revoke Consent'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
}
