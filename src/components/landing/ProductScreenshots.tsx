import { Users, Calendar, Stethoscope, Pill, Receipt, BarChart3, FlaskConical, UserCog, Store, Calculator, TrendingUp, FileSpreadsheet, Package, AlertTriangle, HeartPulse, Activity, Syringe, BedDouble, ScanLine, Bone, Waves, FileSearch, Warehouse, ClipboardPen, PackageCheck, Shield, Globe, Barcode, ShieldCheck, MessageSquare, Hotel, Bed, DoorOpen, ClipboardCheck, Timer, Siren, Gauge, Ambulance, Zap, Scissors, Clipboard, MonitorDot, Thermometer, CircleCheck, AlarmClock, Clock, Droplet, Droplets, Heart, UserCheck, RefreshCw, Wallet, BadgePercent, Truck, FileText, CreditCard } from 'lucide-react';

// Mock screenshot components for landing page
export const PatientRegistrationScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Users className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Patient Registration</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">First Name</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">Ahmed</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Last Name</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">Khan</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">CNIC</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">35201-1234567-1</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Phone</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">+92 300 1234567</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="h-3 w-3" /> Insurance Provider
          </div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">State Life</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Policy Number</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">SL-2024-78901</div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 bg-primary text-primary-foreground rounded px-4 flex items-center text-sm">Register</div>
        <div className="h-8 border rounded px-4 flex items-center text-sm">Cancel</div>
      </div>
    </div>
  </div>
);

export const DoctorDashboardScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Stethoscope className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Doctor Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-muted-foreground">Today's Queue</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-success">8</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Current Patient</div>
        <div className="bg-accent/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Fatima Malik</div>
              <div className="text-xs text-muted-foreground">Token #5 • Fever, Headache</div>
            </div>
            <div className="h-7 bg-primary text-primary-foreground rounded px-3 flex items-center text-xs">Start</div>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Penicillin Allergy
            </span>
            <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">Diabetic</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LabScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <FlaskConical className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Laboratory Queue</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 bg-warning/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-warning">8</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-primary">3</div>
          <div className="text-xs text-muted-foreground">Processing</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-success">15</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { order: 'LO-260113-0042', patient: 'Ahmed Khan', tests: 'CBC, LFT, RFT', doctor: 'Dr. Ali Ahmed', priority: 'Urgent', action: 'Enter Results', barcode: 'BC-78901' },
          { order: 'LO-260113-0041', patient: 'Fatima Malik', tests: 'Thyroid Panel', doctor: 'Dr. Sara Khan', priority: 'Normal', action: 'View Report', barcode: 'BC-78900' },
        ].map((lab, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Barcode className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">{lab.order}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${lab.priority === 'Urgent' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                {lab.priority}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">{lab.patient}</div>
              <div className="text-xs text-muted-foreground">{lab.tests} • {lab.doctor}</div>
            </div>
            <div className={`h-7 rounded flex items-center justify-center text-xs ${i === 0 ? 'bg-primary text-primary-foreground' : 'border'}`}>
              {lab.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PharmacyScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Pill className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Pharmacy Dispensing</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between bg-warning/10 rounded-lg p-2">
        <span className="text-xs">Prescription #RX-2024-0892</span>
        <span className="text-xs bg-warning/20 text-warning-foreground px-2 py-0.5 rounded">Pending</span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'Paracetamol 500mg', qty: '20 tablets', stock: 'In Stock', interaction: false },
          { name: 'Amoxicillin 250mg', qty: '14 capsules', stock: 'In Stock', interaction: true },
        ].map((med, i) => (
          <div key={i} className="bg-muted/50 rounded p-2 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{med.name}</div>
                <div className="text-xs text-muted-foreground">{med.qty}</div>
              </div>
              <span className="text-xs text-success">{med.stock}</span>
            </div>
            {med.interaction && (
              <div className="flex items-center gap-1 text-xs text-destructive bg-destructive/10 rounded px-2 py-1">
                <AlertTriangle className="h-3 w-3" />
                Check: Patient has Penicillin allergy
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm">Dispense All</div>
    </div>
  </div>
);

export const BillingScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Receipt className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Invoice #INV-2024-1234</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="space-y-2 text-sm">
        {[
          { item: 'Consultation Fee', amount: 'Rs. 1,500' },
          { item: 'Lab Tests (CBC, LFT)', amount: 'Rs. 1,200' },
          { item: 'Medications', amount: 'Rs. 650' },
        ].map((line, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-muted-foreground">{line.item}</span>
            <span>{line.amount}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-primary">Rs. 3,350</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-success/10 rounded-lg p-2">
        <ShieldCheck className="h-4 w-4 text-success" />
        <div className="flex-1">
          <div className="text-xs font-medium">Insurance: State Life</div>
          <div className="text-xs text-muted-foreground">Coverage: 80% • Claim: Rs. 2,680</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-8 border rounded flex items-center justify-center text-xs">Cash</div>
        <div className="h-8 bg-primary/10 border-primary border rounded flex items-center justify-center text-xs text-primary">JazzCash</div>
        <div className="h-8 border rounded flex items-center justify-center text-xs">Card</div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <MessageSquare className="h-3 w-3" />
        <span>Auto-reminder for Rs. 670 patient due</span>
      </div>
    </div>
  </div>
);

export const AppointmentScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Calendar className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Appointments</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
          <div key={day} className={`flex-1 text-center py-2 rounded text-xs ${i === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {day}
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { time: '09:00 AM', patient: 'Ali Hassan', type: 'Follow-up', source: 'Scheduled' },
          { time: '09:30 AM', patient: 'Sana Riaz', type: 'New', source: 'Online' },
          { time: '10:00 AM', patient: 'Usman Ahmed', type: 'Walk-in', source: 'Walk-in' },
        ].map((apt, i) => (
          <div key={i} className="flex items-center gap-3 bg-muted/50 rounded p-2">
            <div className="text-xs text-muted-foreground w-16">{apt.time}</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{apt.patient}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {apt.source === 'Online' && <Globe className="h-3 w-3 text-primary" />}
                {apt.source}
              </div>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{apt.type}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between bg-muted/50 rounded p-2">
        <span className="text-xs text-muted-foreground">Waitlist</span>
        <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">2 waiting</span>
      </div>
    </div>
  </div>
);

export const ReportsScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <BarChart3 className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Revenue Reports</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/10 rounded-lg p-3">
          <div className="text-lg font-bold text-success">Rs. 2.4M</div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
        <div className="bg-primary/10 rounded-lg p-3">
          <div className="text-lg font-bold text-primary">+18%</div>
          <div className="text-xs text-muted-foreground">Growth</div>
        </div>
      </div>
      <div className="h-24 bg-muted/50 rounded-lg flex items-end justify-around px-2 pb-2">
        {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
          <div key={i} className="w-6 bg-primary/60 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>
    </div>
  </div>
);

export const HRScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <UserCog className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">HR Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xl font-bold text-primary">45</div>
          <div className="text-xs text-muted-foreground">Staff</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xl font-bold text-success">42</div>
          <div className="text-xs text-muted-foreground">Present</div>
        </div>
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-xl font-bold text-warning">3</div>
          <div className="text-xs text-muted-foreground">Leave</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center gap-1">
          <FileSpreadsheet className="h-3 w-3" /> Today's Roster
        </div>
        {[
          { name: 'Dr. Ali Ahmed', shift: '9AM - 2PM', role: 'Doctor' },
          { name: 'Nurse Fatima', shift: '2PM - 9PM', role: 'Nurse' },
        ].map((staff, i) => (
          <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2">
            <div>
              <div className="text-sm font-medium">{staff.name}</div>
              <div className="text-xs text-muted-foreground">{staff.role}</div>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{staff.shift}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Pending Leaves</div>
          <div className="text-sm font-bold text-warning">3</div>
        </div>
        <div className="bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Payroll Status</div>
          <div className="text-sm font-bold text-success flex items-center justify-center gap-1">
            <TrendingUp className="h-3 w-3" /> Processed
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const POSScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Store className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Pharmacy POS</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-muted rounded px-2 flex items-center text-sm text-muted-foreground">
          Scan barcode or search...
        </div>
        <div className="h-8 bg-primary text-primary-foreground rounded px-3 flex items-center text-sm">Add</div>
      </div>
      <div className="space-y-2">
        {[
          { name: 'Paracetamol 500mg', qty: 2, price: 40, stock: 248 },
          { name: 'Vitamin C Tablets', qty: 1, price: 150, stock: 89 },
          { name: 'Bandage Roll', qty: 3, price: 90, stock: 12 },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2">
            <div>
              <div className="text-sm">{item.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Package className="h-3 w-3" />
                Stock: {item.stock}
                {item.stock < 20 && <AlertTriangle className="h-3 w-3 text-warning ml-1" />}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">x{item.qty}</span>
              <div className="text-sm font-medium">Rs. {item.price}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-2 space-y-1 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal:</span>
          <span>Rs. 280</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax (5%):</span>
          <span>Rs. 14</span>
        </div>
        <div className="flex justify-between font-bold text-primary">
          <span>Total:</span>
          <span>Rs. 294</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="h-8 bg-primary/10 border-primary border rounded flex items-center justify-center text-xs text-primary">Cash</div>
        <div className="h-8 border rounded flex items-center justify-center text-xs">Card</div>
        <div className="h-8 border rounded flex items-center justify-center text-xs">JazzCash</div>
      </div>
      <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium">Complete Sale</div>
    </div>
  </div>
);

export const AccountsScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Calculator className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Accounts Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Receivables</div>
          <div className="text-lg font-bold text-success">Rs. 1.2M</div>
        </div>
        <div className="flex-1 bg-destructive/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Payables</div>
          <div className="text-lg font-bold text-destructive">Rs. 450K</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Cash</div>
          <div className="text-lg font-bold text-primary">Rs. 890K</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Recent Transactions</div>
        {[
          { type: '+', desc: 'Patient Payment', ref: 'INV-1234', amount: '5,500', color: 'text-success' },
          { type: '-', desc: 'Supplier Payment', ref: 'PO-0892', amount: '12,000', color: 'text-destructive' },
          { type: '+', desc: 'Insurance Claim', ref: 'CLM-456', amount: '25,000', color: 'text-success' },
        ].map((txn, i) => (
          <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${txn.color}`}>{txn.type}</span>
              <div>
                <div className="text-sm">{txn.desc}</div>
                <div className="text-xs text-muted-foreground">{txn.ref}</div>
              </div>
            </div>
            <span className={`text-sm font-medium ${txn.color}`}>Rs. {txn.amount}</span>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="text-xs font-medium mb-2">This Month Summary</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Revenue</div>
            <div className="text-sm font-bold">Rs. 3.2M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Expenses</div>
            <div className="text-sm font-bold">Rs. 1.8M</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Net Profit</div>
            <div className="text-sm font-bold text-success flex items-center justify-center gap-1">
              Rs. 1.4M <TrendingUp className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const NursingScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <HeartPulse className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Nursing Station</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Ward A</div>
          <div className="text-lg font-bold text-primary">12 beds</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Occupied</div>
          <div className="text-lg font-bold text-success">10</div>
        </div>
        <div className="flex-1 bg-muted rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Empty</div>
          <div className="text-lg font-bold">2</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Current Tasks - Bed 101 (Ahmed Khan)</div>
        <div className="space-y-1.5">
          {[
            { task: 'Vitals check', time: '8:00 AM', done: true },
            { task: 'Medication: Insulin', time: '10:00 AM', done: false },
            { task: 'Wound dressing', time: '11:00 AM', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center text-xs ${item.done ? 'bg-success text-success-foreground' : 'border'}`}>
                  {item.done && '✓'}
                </div>
                <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : ''}`}>{item.task}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-destructive/10 rounded-lg p-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-destructive" />
        <div>
          <div className="text-xs font-medium text-destructive">Vital Alert - Bed 105</div>
          <div className="text-xs text-muted-foreground">High BP: 160/100 mmHg</div>
        </div>
        <div className="ml-auto h-6 bg-destructive text-destructive-foreground rounded px-2 flex items-center text-xs">View</div>
      </div>
    </div>
  </div>
);

export const RadiologyScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <ScanLine className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Radiology Worklist</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Pending</div>
          <div className="text-lg font-bold text-warning">6</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">In Progress</div>
          <div className="text-lg font-bold text-primary">2</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Done</div>
          <div className="text-lg font-bold text-success">18</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { id: 'RAD-260113-0023', patient: 'Ahmed Khan', test: 'Chest X-Ray', doctor: 'Dr. Ali Ahmed', priority: 'STAT', action: 'Acquire Image', icon: Bone },
          { id: 'RAD-260113-0022', patient: 'Fatima Malik', test: 'Abdominal Ultrasound', doctor: 'Dr. Sara Khan', priority: 'Routine', action: 'View Report', icon: Waves },
        ].map((item, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${item.priority === 'STAT' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                {item.priority}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">{item.patient}</div>
              <div className="text-xs text-muted-foreground">{item.test} • {item.doctor}</div>
            </div>
            <div className={`h-7 rounded flex items-center justify-center text-xs ${i === 0 ? 'bg-primary text-primary-foreground' : 'border'}`}>
              {item.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const InventoryScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Warehouse className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Inventory Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Total Items</div>
          <div className="text-lg font-bold text-primary">1,250</div>
        </div>
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Low Stock</div>
          <div className="text-lg font-bold text-warning">18</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Orders</div>
          <div className="text-lg font-bold text-success">5</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center gap-1">
          <ClipboardPen className="h-3 w-3" /> Recent Purchase Orders
        </div>
        {[
          { po: 'PO-2024-0145', vendor: 'Medical Supplies Ltd', amount: '125,000', status: 'Approved' },
          { po: 'PO-2024-0144', vendor: 'Pharma Distributors', amount: '85,000', status: 'Pending' },
        ].map((order, i) => (
          <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2">
            <div>
              <div className="text-sm font-medium">{order.po}</div>
              <div className="text-xs text-muted-foreground">{order.vendor}</div>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-0.5 rounded ${order.status === 'Approved' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {order.status}
              </span>
              <div className="text-sm font-medium">Rs. {order.amount}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/50 rounded-lg p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs">Stock Requisitions</span>
        </div>
        <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded">3 pending</span>
      </div>
    </div>
  </div>
);

export const IPDScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Hotel className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">IPD Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Total Beds</div>
          <div className="text-lg font-bold text-primary">48</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Occupied</div>
          <div className="text-lg font-bold text-success">36</div>
        </div>
        <div className="flex-1 bg-muted rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Available</div>
          <div className="text-lg font-bold">12</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center gap-1">
          <ClipboardCheck className="h-3 w-3" /> Today's Rounds
        </div>
        {[
          { room: 'Room 201', patient: 'Ahmed Khan', doctor: 'Dr. Ali Ahmed', days: 3, status: 'Pending' },
          { room: 'Room 105', patient: 'Fatima Malik', doctor: 'Dr. Sara Khan', days: 5, status: 'Completed' },
        ].map((round, i) => (
          <div key={i} className="flex items-center justify-between bg-muted/50 rounded p-2">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{round.patient}</div>
                <div className="text-xs text-muted-foreground">{round.room} • {round.doctor}</div>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs px-2 py-0.5 rounded ${round.status === 'Completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                {round.status}
              </span>
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                <Timer className="h-3 w-3" /> Day {round.days}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-primary/10 rounded-lg p-2 flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Admissions Today</div>
            <div className="text-sm font-bold">4</div>
          </div>
        </div>
        <div className="bg-success/10 rounded-lg p-2 flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-success" />
          <div>
            <div className="text-xs text-muted-foreground">Discharges Today</div>
            <div className="text-sm font-bold">3</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const EmergencyScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-destructive/10 px-4 py-2 border-b flex items-center gap-2">
      <Siren className="h-4 w-4 text-destructive" />
      <span className="text-sm font-medium">Emergency Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-destructive/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Critical</div>
          <div className="text-lg font-bold text-destructive">3</div>
        </div>
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Urgent</div>
          <div className="text-lg font-bold text-warning">7</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Stable</div>
          <div className="text-lg font-bold text-success">12</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center gap-1">
          <Gauge className="h-3 w-3" /> Active Cases
        </div>
        {[
          { id: 'ER-0045', patient: 'Unknown Male', triage: 'Red', complaint: 'Road accident - Multiple trauma', time: '5 min ago' },
          { id: 'ER-0044', patient: 'Fatima Bibi', triage: 'Yellow', complaint: 'Chest pain, shortness of breath', time: '18 min ago' },
        ].map((cas, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${cas.triage === 'Red' ? 'bg-destructive' : 'bg-warning'}`} />
                <span className="text-xs font-mono text-muted-foreground">{cas.id}</span>
              </div>
              <span className="text-xs text-muted-foreground">{cas.time}</span>
            </div>
            <div>
              <div className="text-sm font-medium">{cas.patient}</div>
              <div className="text-xs text-muted-foreground">{cas.complaint}</div>
            </div>
            <div className={`h-7 rounded flex items-center justify-center text-xs ${i === 0 ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'}`}>
              {i === 0 ? 'Attend Now' : 'View Details'}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-primary/10 rounded-lg p-2 flex items-center gap-2">
        <Ambulance className="h-4 w-4 text-primary" />
        <div className="flex-1">
          <div className="text-xs font-medium">Incoming Ambulance</div>
          <div className="text-xs text-muted-foreground">ETA: 3 mins • Cardiac arrest</div>
        </div>
        <Zap className="h-4 w-4 text-warning" />
      </div>
    </div>
  </div>
);

export const OTScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Scissors className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Operation Theatre</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">OT Rooms</div>
          <div className="text-lg font-bold text-primary">4</div>
        </div>
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">In Use</div>
          <div className="text-lg font-bold text-warning">2</div>
        </div>
        <div className="flex-1 bg-success/10 rounded-lg p-2 text-center">
          <div className="text-xs text-muted-foreground">Available</div>
          <div className="text-lg font-bold text-success">2</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center gap-1">
          <Calendar className="h-3 w-3" /> Today's Surgeries
        </div>
        {[
          { ot: 'OT-1', patient: 'Ahmed Khan', surgery: 'Appendectomy', surgeon: 'Dr. Ali Ahmed', time: '10:00 AM', status: 'In Progress', duration: '45 min' },
          { ot: 'OT-2', patient: 'Fatima Malik', surgery: 'Cataract Surgery', surgeon: 'Dr. Sara Khan', time: '2:00 PM', status: 'Pre-Op', duration: '-' },
        ].map((surg, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{surg.ot}</span>
                <span className="text-xs text-muted-foreground">{surg.time}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${surg.status === 'In Progress' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                {surg.status}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium">{surg.patient}</div>
              <div className="text-xs text-muted-foreground">{surg.surgery} • {surg.surgeon}</div>
            </div>
            {surg.status === 'In Progress' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Duration: {surg.duration}</span>
                <MonitorDot className="h-3 w-3 text-success ml-2" />
                <span>Vitals stable</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-success/10 rounded-lg p-2 flex items-center gap-2">
          <CircleCheck className="h-4 w-4 text-success" />
          <div>
            <div className="text-xs text-muted-foreground">Pre-Op Ready</div>
            <div className="text-sm font-bold">3</div>
          </div>
        </div>
        <div className="bg-primary/10 rounded-lg p-2 flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">Recovery</div>
            <div className="text-sm font-bold">2</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const BloodBankScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-rose-500/10 px-4 py-2 border-b flex items-center gap-2">
      <Droplet className="h-4 w-4 text-rose-600" />
      <span className="text-sm font-medium">Blood Bank Dashboard</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {[
          { group: 'A+', units: 24, color: 'bg-success/10 text-success' },
          { group: 'B+', units: 18, color: 'bg-success/10 text-success' },
          { group: 'O+', units: 8, color: 'bg-warning/10 text-warning' },
          { group: 'AB+', units: 12, color: 'bg-success/10 text-success' },
        ].map((blood) => (
          <div key={blood.group} className={`rounded-lg p-2 text-center ${blood.color.split(' ')[0]}`}>
            <div className={`text-lg font-bold ${blood.color.split(' ')[1]}`}>{blood.units}</div>
            <div className="text-xs text-muted-foreground">{blood.group}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium flex items-center gap-1">
          <UserCheck className="h-3 w-3" /> Today's Donors
        </div>
        {[
          { donor: 'Ahmed Hassan', group: 'O+', status: 'Collected', time: '10:30 AM' },
          { donor: 'Sara Khan', group: 'A+', status: 'Screening', time: '11:00 AM' },
        ].map((donor, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{donor.donor}</div>
              <div className="text-xs text-muted-foreground">Blood Group: {donor.group} • {donor.time}</div>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${donor.status === 'Collected' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
              {donor.status}
            </span>
          </div>
        ))}
      </div>
      <div className="bg-warning/10 rounded-lg p-2 space-y-1">
        <div className="text-xs font-medium flex items-center gap-1">
          <RefreshCw className="h-3 w-3" /> Pending Requests
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm">OT-1 • Appendectomy</div>
            <div className="text-xs text-muted-foreground">2 units O+ • Cross-match required</div>
          </div>
          <div className="h-7 bg-primary text-primary-foreground rounded px-3 flex items-center text-xs">Process</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-rose-500/10 rounded-lg p-2 flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-600" />
          <div>
            <div className="text-xs text-muted-foreground">Transfusions Today</div>
            <div className="text-sm font-bold">5</div>
          </div>
        </div>
        <div className="bg-warning/10 rounded-lg p-2 flex items-center gap-2">
          <Droplets className="h-4 w-4 text-warning" />
          <div>
            <div className="text-xs text-muted-foreground">Expiring Soon</div>
            <div className="text-sm font-bold">3 units</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const DoctorWalletScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Wallet className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">My Wallet - Dr. Ali Ahmed</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-success/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-success">Rs. 125,000</div>
          <div className="text-xs text-muted-foreground">Available Balance</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-primary">Rs. 45,000</div>
          <div className="text-xs text-muted-foreground">This Month</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Recent Earnings</div>
        {[
          { type: 'OPD Consultation', patient: 'Ahmed Khan', amount: '1,500', share: '60%' },
          { type: 'Surgery - Appendectomy', patient: 'Fatima Malik', amount: '25,000', share: '40%' },
          { type: 'IPD Visit', patient: 'Usman Ali', amount: '800', share: '50%' },
        ].map((earning, i) => (
          <div key={i} className="bg-muted/50 rounded p-2 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">{earning.type}</div>
              <div className="text-xs text-muted-foreground">{earning.patient}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-success">+Rs. {earning.amount}</div>
              <div className="text-xs text-muted-foreground">{earning.share}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm">Request Payout</div>
        <div className="h-8 border rounded flex items-center justify-center text-sm">View History</div>
      </div>
    </div>
  </div>
);

export const DoctorCompensationScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <BadgePercent className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Compensation Plan - Dr. Ali Ahmed</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Plan Type</div>
          <div className="h-8 bg-primary/10 rounded px-2 flex items-center text-sm font-medium text-primary">Hybrid</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Base Salary</div>
          <div className="h-8 bg-muted rounded px-2 flex items-center text-sm">Rs. 150,000</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Fee & Share Configuration</div>
        {[
          { service: 'OPD Consultation', fee: '2,500', share: '60%', earning: '1,500' },
          { service: 'IPD Visit', fee: '1,500', share: '50%', earning: '750' },
          { service: 'Surgery', fee: '50,000', share: '40%', earning: '20,000' },
        ].map((item, i) => (
          <div key={i} className="bg-muted/50 rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{item.service}</span>
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                Earns Rs. {item.earning}
              </span>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Patient Fee: Rs. {item.fee}</span>
              <span>Doctor Share: {item.share}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-success/10 rounded-lg p-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-success" />
        <div>
          <div className="text-xs font-medium">Last Month Total</div>
          <div className="text-sm font-bold text-success">Rs. 285,000</div>
        </div>
      </div>
    </div>
  </div>
);

export const ProcurementScreen = () => (
  <div className="bg-card rounded-lg border shadow-soft overflow-hidden">
    <div className="bg-primary/10 px-4 py-2 border-b flex items-center gap-2">
      <Truck className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">Procurement Workflow</span>
    </div>
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 bg-warning/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-warning">5</div>
          <div className="text-xs text-muted-foreground">Pending POs</div>
        </div>
        <div className="flex-1 bg-primary/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-primary">3</div>
          <div className="text-xs text-muted-foreground">Awaiting GRN</div>
        </div>
        <div className="flex-1 bg-destructive/10 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-destructive">Rs. 450K</div>
          <div className="text-xs text-muted-foreground">Unpaid AP</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium">Procurement Pipeline</div>
        {[
          { po: 'PO-2024-0156', vendor: 'Medical Supplies Ltd', items: 'Syringes, Gloves, Masks', amount: '85,000', stage: 'GRN Pending' },
          { po: 'PO-2024-0155', vendor: 'Pharma Distributors', items: 'Paracetamol, Amoxicillin', amount: '125,000', stage: 'Payment Due' },
        ].map((order, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{order.po}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${i === 0 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                {order.stage}
              </span>
            </div>
            <div className="text-sm font-medium">{order.vendor}</div>
            <div className="text-xs text-muted-foreground">{order.items}</div>
            <div className="text-sm font-bold text-right">Rs. {order.amount}</div>
          </div>
        ))}
      </div>
      <div className="h-8 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm">Create Purchase Order</div>
    </div>
  </div>
);
