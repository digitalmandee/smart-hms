import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { StatsCard } from '@/components/StatsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useImagingOrders } from '@/hooks/useImaging';
import { ImagingOrderCard } from '@/components/radiology/ImagingOrderCard';
import { 
  Activity, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileText, 
  Plus, 
  Radio, 
  AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';

export default function RadiologyDashboard() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useImagingOrders();
  const [activeTab, setActiveTab] = useState('pending');

  const today = format(new Date(), 'yyyy-MM-dd');

  const stats = {
    pendingOrders: orders?.filter(o => o.status === 'ordered').length || 0,
    inProgress: orders?.filter(o => o.status === 'in_progress').length || 0,
    awaitingReport: orders?.filter(o => o.status === 'completed').length || 0,
    completedToday: orders?.filter(o => 
      o.status === 'verified' && 
      o.performed_at?.startsWith(today)
    ).length || 0,
    statOrders: orders?.filter(o => o.priority === 'stat' && o.status !== 'verified' && o.status !== 'cancelled').length || 0,
  };

  const pendingOrders = orders?.filter(o => ['ordered', 'scheduled'].includes(o.status)) || [];
  const inProgressOrders = orders?.filter(o => o.status === 'in_progress') || [];
  const awaitingReportOrders = orders?.filter(o => o.status === 'completed') || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Radiology & Imaging"
        description="Manage imaging orders, reports, and workflows"
        actions={
          <Button onClick={() => navigate('/app/radiology/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Activity}
        />
        <StatsCard
          title="Awaiting Report"
          value={stats.awaitingReport}
          icon={FileText}
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          variant="success"
        />
        {stats.statOrders > 0 && (
          <StatsCard
            title="STAT Orders"
            value={stats.statOrders}
            icon={AlertTriangle}
            variant="warning"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/app/radiology/worklist')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-blue-100">
              <Radio className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Technician Worklist</p>
              <p className="text-sm text-muted-foreground">{stats.pendingOrders + stats.inProgress} studies</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/app/radiology/reporting')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">Reporting Worklist</p>
              <p className="text-sm text-muted-foreground">{stats.awaitingReport} pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/app/radiology/schedule')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-green-100">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Schedule</p>
              <p className="text-sm text-muted-foreground">View calendar</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate('/app/radiology/orders')}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="p-3 rounded-full bg-orange-100">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="font-medium">All Orders</p>
              <p className="text-sm text-muted-foreground">{orders?.length || 0} total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress">
            In Progress ({inProgressOrders.length})
          </TabsTrigger>
          <TabsTrigger value="awaitingReport">
            Awaiting Report ({awaitingReportOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.slice(0, 6).map(order => (
                <ImagingOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-4">
          {inProgressOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No studies in progress
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressOrders.map(order => (
                <ImagingOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="awaitingReport" className="mt-4">
          {awaitingReportOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 text-muted-foreground">
                No studies awaiting report
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {awaitingReportOrders.map(order => (
                <ImagingOrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
