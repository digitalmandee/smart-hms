import React from "react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format } from "date-fns";
import { ArrowLeft, Printer, Baby, Calendar, Weight, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBirthRecords, useIssueBirthCertificate } from "@/hooks/useBirthRecords";
import { PrintableBirthCertificate } from "@/components/ipd/PrintableBirthCertificate";
import { BirthRecordForm } from "@/components/ipd/BirthRecordForm";
import { useCreateBirthRecord } from "@/hooks/useBirthRecords";
import { useDoctors } from "@/hooks/useDoctors";

export default function BirthRecordsPage() {
  const { data: birthRecords, isLoading } = useBirthRecords();
  const { data: doctors } = useDoctors();
  const createBirthRecord = useCreateBirthRecord();
  const issueCertificate = useIssueBirthCertificate();
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
            <h1 className="text-2xl font-bold">Birth Records</h1>
            <p className="text-muted-foreground">
              Manage birth registrations and certificates
            </p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "View Records" : "New Birth Record"}
        </Button>
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Register New Birth</CardTitle>
          </CardHeader>
          <CardContent>
            <BirthRecordForm
              onSubmit={(data) => {
                createBirthRecord.mutate(data, {
                  onSuccess: () => setShowForm(false),
                });
              }}
              isLoading={createBirthRecord.isPending}
              doctors={doctors || []}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : birthRecords?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Baby className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Birth Records</h3>
                <p className="text-muted-foreground mb-4">
                  Start by registering a new birth
                </p>
                <Button onClick={() => setShowForm(true)}>
                  Register New Birth
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {birthRecords?.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-pink-100">
                          <Baby className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {record.baby 
                              ? `${record.baby.first_name} ${record.baby.last_name}`
                              : `Baby of ${record.mother?.first_name} ${record.mother?.last_name}`}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Certificate: {record.certificate_number || "Not Issued"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {record.certificate_issued_at ? (
                          <Badge variant="default">Certified</Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        {record.nicu_admission && (
                          <Badge variant="destructive">NICU</Badge>
                        )}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Birth Date</p>
                          <p className="font-medium">
                            {format(new Date(record.birth_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Weight className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Weight</p>
                          <p className="font-medium">
                            {record.birth_weight_grams 
                              ? `${(record.birth_weight_grams / 1000).toFixed(2)} kg`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Gender</p>
                          <p className="font-medium capitalize">{record.gender || "N/A"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Delivery</p>
                          <p className="font-medium capitalize">
                            {record.delivery_type?.replace("_", " ") || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

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
          <PrintableBirthCertificate
            ref={printRef}
            birthRecord={selectedRecord}
          />
        )}
      </div>
    </div>
  );
}
