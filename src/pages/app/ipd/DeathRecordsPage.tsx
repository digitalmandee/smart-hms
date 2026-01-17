import React from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { ArrowLeft, Printer, Skull, Calendar, User, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDeathRecords, useIssueCertificate } from "@/hooks/useDeathRecords";
import { PrintableDeathCertificate } from "@/components/ipd/PrintableDeathCertificate";
import { DeathRecordForm } from "@/components/ipd/DeathRecordForm";
import { useCreateDeathRecord } from "@/hooks/useDeathRecords";
import { useDoctors } from "@/hooks/useDoctors";

export default function DeathRecordsPage() {
  const { data: deathRecords, isLoading } = useDeathRecords();
  const { data: doctors } = useDoctors();
  const createDeathRecord = useCreateDeathRecord();
  const issueCertificate = useIssueCertificate();
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedRecord, setSelectedRecord] = React.useState<any>(null);
  const [showForm, setShowForm] = React.useState(false);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/app/ipd">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Death Records</h1>
            <p className="text-muted-foreground">
              Manage death documentation and certificates
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "View Records" : "New Death Record"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Document Death</CardTitle>
          </CardHeader>
          <CardContent>
            <DeathRecordForm
              onSubmit={(data) => {
                createDeathRecord.mutate(data, {
                  onSuccess: () => setShowForm(false),
                });
              }}
              isLoading={createDeathRecord.isPending}
              doctors={doctors || []}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : deathRecords?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Death Records</h3>
                <p className="text-muted-foreground">
                  No death records have been documented
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {deathRecords?.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-gray-100">
                          <Skull className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {record.patient?.first_name} {record.patient?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {record.patient?.patient_number} | Certificate: {record.certificate_number || "Not Issued"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.certificate_issued_at ? (
                          <Badge variant="default">Certified</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {record.is_mlc && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            MLC
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Date of Death</p>
                          <p className="font-medium">
                            {format(new Date(record.death_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Time</p>
                          <p className="font-medium">{record.death_time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Manner</p>
                          <p className="font-medium capitalize">
                            {record.manner_of_death || "Natural"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Cause</p>
                          <p className="font-medium truncate max-w-[150px]">
                            {record.immediate_cause || "Not specified"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {record.body_released_to && (
                      <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                        <p>
                          <span className="text-muted-foreground">Body Released To:</span>{" "}
                          <span className="font-medium">{record.body_released_to}</span>{" "}
                          ({record.body_released_relation})
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {!record.certificate_issued_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => issueCertificate.mutate(record.id)}
                          disabled={issueCertificate.isPending}
                        >
                          Issue Certificate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setTimeout(() => handlePrint(), 100);
                        }}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Hidden print component */}
      <div className="hidden">
        {selectedRecord && (
          <PrintableDeathCertificate
            ref={printRef}
            deathRecord={selectedRecord}
          />
        )}
      </div>
    </div>
  );
}
