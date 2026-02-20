import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { ModernPageHeader } from '@/components/ModernPageHeader';
import { ModernStatsCard } from '@/components/ModernStatsCard';
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
  AlertTriangle,
  Scan
} from 'lucide-react';
import { format } from 'date-fns';

export default function RadiologyDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const quickActionItems = [
    { title: "Technician Worklist", subtitle: `${stats.pendingOrders + stats.inProgress} studies`, icon: Radio, color: "bg-blue-100 text-blue-600", path: "/app/radiology/worklist" },
    { title: "Reporting Worklist", subtitle: `${stats.awaitingReport} pending`, icon: FileText, color: "bg-purple-100 text-purple-600", path: "/app/radiology/reporting" },
    { title: "PACS Studies", subtitle: "View DICOM images", icon: Scan, color: "bg-indigo-100 text-indigo-600", path: "/app/radiology/pacs" },
    { title: "Schedule", subtitle: "View calendar", icon: Calendar, color: "bg-green-100 text-green-600", path: "/app/radiology/schedule" },
    { title: "All Orders", subtitle: `${orders?.length || 0} total`, icon: Activity, color: "bg-orange-100 text-orange-600", path: "/app/radiology/orders" },
  ];

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title={t('radiology.radiologyImaging' as any)}
        subtitle={t('radiology.radiologyImagingDesc' as any)}
        icon={Scan}
        iconColor="text-primary"
        actions={
          <Button onClick={() => navigate('/app/radiology/orders/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('radiology.newOrder' as any)}
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <ModernStatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          variant="warning"
          onClick={() => setActiveTab('pending')}
        />
        <ModernStatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Activity}
          variant="info"
          onClick={() => setActiveTab('inProgress')}
        />
        <ModernStatsCard
          title="Awaiting Report"
          value={stats.awaitingReport}
          icon={FileText}
          variant="primary"
          onClick={() => setActiveTab('awaitingReport')}
        />
        <ModernStatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          variant="success"
        />
        {stats.statOrders > 0 && (
          <ModernStatsCard
            title="STAT Orders"
            value={stats.statOrders}
            icon={AlertTriangle}
            variant="accent"
            className="border-l-4 border-l-destructive animate-pulse"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-5">
        {quickActionItems.map((item, idx) => (
          <Card 
            key={item.title}
            className="cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 animate-fade-in" 
            style={{ animationDelay: `${idx * 50}ms` }}
            onClick={() => navigate(item.path)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingOrders.length})
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="gap-2">
            <Activity className="h-4 w-4" />
            In Progress ({inProgressOrders.length})
          </TabsTrigger>
          <TabsTrigger value="awaitingReport" className="gap-2">
            <FileText className="h-4 w-4" />
            Awaiting Report ({awaitingReportOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : pendingOrders.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Clock className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No pending orders</p>
                <p className="text-sm">All imaging orders have been processed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.slice(0, 6).map((order, idx) => (
                <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <ImagingOrderCard order={order} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-4">
          {inProgressOrders.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <Activity className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No studies in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressOrders.map((order, idx) => (
                <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <ImagingOrderCard order={order} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="awaitingReport" className="mt-4">
          {awaitingReportOrders.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="text-center py-12 text-muted-foreground">
                <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                  <FileText className="h-8 w-8 opacity-50" />
                </div>
                <p className="font-medium">No studies awaiting report</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {awaitingReportOrders.map((order, idx) => (
                <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <ImagingOrderCard order={order} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}