import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useImagingOrders, IMAGING_MODALITIES } from '@/hooks/useImaging';
import { ImagingOrderCard } from '@/components/radiology/ImagingOrderCard';
import { format, isSameDay } from 'date-fns';
import { Plus, CalendarDays } from 'lucide-react';

export default function ImagingSchedulePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: orders, isLoading } = useImagingOrders();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [modalityFilter, setModalityFilter] = useState<string>('all');

  // Filter scheduled orders
  const scheduledOrders = orders?.filter(o => o.scheduled_date) || [];

  // Get orders for selected date
  const ordersForDate = scheduledOrders.filter(o => {
    if (!selectedDate || !o.scheduled_date) return false;
    const orderDate = new Date(o.scheduled_date);
    return isSameDay(orderDate, selectedDate);
  }).filter(o => modalityFilter === 'all' || o.modality === modalityFilter);

  // Get dates with scheduled orders for calendar highlighting
  const datesWithOrders = scheduledOrders.map(o => new Date(o.scheduled_date!));

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('radiology.imagingSchedule' as any)}
        description={t('radiology.imagingScheduleDesc' as any)}
        actions={
          <Button onClick={() => navigate('/app/radiology/orders/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasOrders: datesWithOrders,
              }}
              modifiersStyles={{
                hasOrders: {
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                },
              }}
            />
            <div className="mt-4">
              <Select value={modalityFilter} onValueChange={setModalityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by modality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modalities</SelectItem>
                  {IMAGING_MODALITIES.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders for Selected Date */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedDate 
                ? `Schedule for ${format(selectedDate, 'EEEE, MMMM d, yyyy')}`
                : 'Select a date'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a date to view scheduled orders
              </div>
            ) : ordersForDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No scheduled orders for this date
              </div>
            ) : (
              <div className="space-y-4">
                {ordersForDate
                  .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime())
                  .map(order => (
                    <div key={order.id} className="flex items-center gap-4">
                      <div className="text-sm font-medium w-16">
                        {order.scheduled_time || format(new Date(order.scheduled_date!), 'HH:mm')}
                      </div>
                      <div className="flex-1">
                        <ImagingOrderCard order={order} />
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
