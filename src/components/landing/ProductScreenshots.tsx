import { Users, Calendar, Stethoscope, Pill, Receipt, BarChart3, FlaskConical, UserCog, Store, Calculator, TrendingUp, FileSpreadsheet, Package, AlertTriangle, HeartPulse, Activity, Syringe, BedDouble, ScanLine, Bone, Waves, FileSearch, Warehouse, ClipboardPen, PackageCheck, Shield, Globe, Barcode, ShieldCheck, MessageSquare } from 'lucide-react';

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
