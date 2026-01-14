import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOTRoom, useCreateOTRoom, useUpdateOTRoom } from "@/hooks/useOT";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const otRoomSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  room_name: z.string().min(1, "Room name is required"),
  room_type: z.string().optional(),
  floor: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["available", "occupied", "maintenance", "cleaning"]),
  is_active: z.boolean(),
});

type OTRoomFormValues = z.infer<typeof otRoomSchema>;

export default function OTRoomFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { profile } = useAuth();
  const { data: room, isLoading: roomLoading } = useOTRoom(id || "");
  const createOTRoom = useCreateOTRoom();
  const updateOTRoom = useUpdateOTRoom();
  
  const [equipment, setEquipment] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OTRoomFormValues>({
    resolver: zodResolver(otRoomSchema),
    defaultValues: {
      room_number: "",
      room_name: "",
      room_type: "",
      floor: "",
      description: "",
      status: "available",
      is_active: true,
    },
  });

  useEffect(() => {
    if (room && isEditing) {
      form.reset({
        room_number: room.room_number,
        room_name: room.name || "",
        room_type: room.room_type || "",
        floor: room.floor || "",
        description: room.notes || "",
        status: room.status as "available" | "occupied" | "maintenance" | "cleaning",
        is_active: room.is_active ?? true,
      });
      if (room.equipment && Array.isArray(room.equipment)) {
        setEquipment(room.equipment as string[]);
      }
    }
  }, [room, isEditing, form]);

  const addEquipment = () => {
    if (newEquipment.trim() && !equipment.includes(newEquipment.trim())) {
      setEquipment([...equipment, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (item: string) => {
    setEquipment(equipment.filter((e) => e !== item));
  };

  const onSubmit = async (data: OTRoomFormValues) => {
    if (!profile?.organization_id || !profile?.branch_id) {
      toast.error("Organization or branch not found");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        room_number: data.room_number,
        name: data.room_name,
        room_type: data.room_type,
        floor: data.floor,
        notes: data.description,
        status: data.status,
        is_active: data.is_active,
        equipment,
        organization_id: profile.organization_id,
        branch_id: profile.branch_id,
      };

      if (isEditing && id) {
        await updateOTRoom.mutateAsync({ id, ...payload });
        toast.success("OT room updated successfully");
      } else {
        await createOTRoom.mutateAsync(payload);
        toast.success("OT room created successfully");
      }
      navigate("/app/ot/rooms");
    } catch (error: any) {
      toast.error(error.message || "Failed to save OT room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && roomLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? "Edit OT Room" : "Add OT Room"}
        description={isEditing ? "Update operating room details" : "Create a new operating room"}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Details</CardTitle>
              <CardDescription>
                Basic information about the operating room
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="room_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="OT-1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Operating Room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Surgery</SelectItem>
                        <SelectItem value="cardiac">Cardiac Surgery</SelectItem>
                        <SelectItem value="neuro">Neurosurgery</SelectItem>
                        <SelectItem value="ortho">Orthopedic Surgery</SelectItem>
                        <SelectItem value="ent">ENT Surgery</SelectItem>
                        <SelectItem value="ophthalmic">Ophthalmic Surgery</SelectItem>
                        <SelectItem value="gynec">Gynecological Surgery</SelectItem>
                        <SelectItem value="minor">Minor Procedures</SelectItem>
                        <SelectItem value="emergency">Emergency OT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor</FormLabel>
                    <FormControl>
                      <Input placeholder="2nd Floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>
                        Whether this room is available for scheduling
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details about the room..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
              <CardDescription>
                List of equipment available in this operating room
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add equipment (e.g., C-Arm, Laparoscopy Unit)"
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEquipment();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addEquipment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {equipment.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {equipment.map((item) => (
                    <Badge key={item} variant="secondary" className="pr-1">
                      {item}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                        onClick={() => removeEquipment(item)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              
              {equipment.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No equipment added yet. Add equipment using the field above.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/app/ot/rooms")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update Room" : "Create Room"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
