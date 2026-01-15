import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Search, UserPlus } from "lucide-react";
import { 
  useBloodDonors,
  useBloodDonor,
  useCreateDonation,
  type DonationStatus,
} from "@/hooks/useBloodBank";
import { BloodGroupBadge } from "@/components/blood-bank/BloodGroupBadge";
import { Link } from "react-router-dom";

const donationTypes = [
  { value: 'voluntary', label: 'Voluntary' },
  { value: 'replacement', label: 'Replacement' },
  { value: 'directed', label: 'Directed' },
  { value: 'autologous', label: 'Autologous' },
];

export default function DonationFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedDonorId = searchParams.get('donorId');
  
  const [donorSearch, setDonorSearch] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(preselectedDonorId);
  
  const { data: donors, isLoading: loadingDonors } = useBloodDonors({ search: donorSearch });
  const { data: selectedDonor } = useBloodDonor(selectedDonorId || '');
  const createDonation = useCreateDonation();

  const [formData, setFormData] = useState({
    donation_date: new Date().toISOString().split('T')[0],
    donation_time: new Date().toTimeString().slice(0, 5),
    donation_type: 'voluntary',
    hemoglobin_reading: '',
    bag_number: '',
    volume_collected_ml: '',
    screening_passed: false,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDonorId) {
      return;
    }

    try {
      await createDonation.mutateAsync({
        donor_id: selectedDonorId,
        donation_date: formData.donation_date,
        donation_time: formData.donation_time,
        donation_type: formData.donation_type,
        hemoglobin_reading: formData.hemoglobin_reading ? parseFloat(formData.hemoglobin_reading) : null,
        bag_number: formData.bag_number || null,
        volume_collected_ml: formData.volume_collected_ml ? parseInt(formData.volume_collected_ml) : null,
        screening_result: formData.screening_passed ? 'passed' : 'pending',
        status: 'registered' as DonationStatus,
      });
      navigate('/app/blood-bank/donations');
    } catch (error) {
      // Error handled in hook
    }
  };

  const isLoading = createDonation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Start New Donation"
        description="Register a blood donation"
        actions={
          <Button variant="outline" onClick={() => navigate('/app/blood-bank/donations')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Donations
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Donor Selection</CardTitle>
              <Link to="/app/blood-bank/donors/new">
                <Button type="button" variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register New Donor
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDonor ? (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">
                    {selectedDonor.first_name} {selectedDonor.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedDonor.donor_number} • {selectedDonor.phone}
                  </p>
                  {selectedDonor.last_donation_date && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last donation: {selectedDonor.last_donation_date}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <BloodGroupBadge group={selectedDonor.blood_group} size="lg" />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDonorId(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donors by name, phone, or donor number..."
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {donorSearch && donors && donors.length > 0 && (
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {donors.filter(d => d.status === 'active').slice(0, 5).map((donor) => (
                      <div
                        key={donor.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => {
                          setSelectedDonorId(donor.id);
                          setDonorSearch('');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {donor.first_name} {donor.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {donor.donor_number} • {donor.total_donations} donations
                            </p>
                          </div>
                          <BloodGroupBadge group={donor.blood_group} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {donorSearch && donors?.filter(d => d.status === 'active').length === 0 && !loadingDonors && (
                  <p className="text-sm text-muted-foreground">No active donors found</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="donation_date">Donation Date *</Label>
              <Input
                id="donation_date"
                type="date"
                value={formData.donation_date}
                onChange={(e) => setFormData({ ...formData, donation_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation_time">Donation Time</Label>
              <Input
                id="donation_time"
                type="time"
                value={formData.donation_time}
                onChange={(e) => setFormData({ ...formData, donation_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donation_type">Donation Type *</Label>
              <Select 
                value={formData.donation_type} 
                onValueChange={(v) => setFormData({ ...formData, donation_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {donationTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="hemoglobin_reading">Hemoglobin (g/dL)</Label>
              <Input
                id="hemoglobin_reading"
                type="number"
                step="0.1"
                min="10"
                max="20"
                placeholder="e.g., 13.5"
                value={formData.hemoglobin_reading}
                onChange={(e) => setFormData({ ...formData, hemoglobin_reading: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bag_number">Bag Number</Label>
              <Input
                id="bag_number"
                placeholder="Blood bag number"
                value={formData.bag_number}
                onChange={(e) => setFormData({ ...formData, bag_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volume_collected_ml">Volume Collected (ml)</Label>
              <Input
                id="volume_collected_ml"
                type="number"
                min="300"
                max="500"
                placeholder="e.g., 450"
                value={formData.volume_collected_ml}
                onChange={(e) => setFormData({ ...formData, volume_collected_ml: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pre-Donation Screening</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="screening_passed"
                checked={formData.screening_passed}
                onCheckedChange={(checked) => setFormData({ ...formData, screening_passed: checked === true })}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="screening_passed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pre-Donation Screening Passed
                </label>
                <p className="text-sm text-muted-foreground">
                  Confirm that the donor has passed all pre-donation health screening requirements
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about the donation"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/app/blood-bank/donations')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !selectedDonorId}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Start Donation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
