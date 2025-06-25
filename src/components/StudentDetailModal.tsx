
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Mail, MapPin, GraduationCap, Calendar, CreditCard, Users } from "lucide-react";
import { useStudentDetails } from "@/hooks/useStudentDetails";

interface StudentDetailModalProps {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StudentDetailModal({ studentId, isOpen, onClose }: StudentDetailModalProps) {
  const { studentDetails, isLoading } = useStudentDetails(studentId);

  if (!studentId || !studentDetails) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktive Gruppe</Badge>;
      case 'pending':
        return <Badge variant="secondary">Wartende Gruppe</Badge>;
      case 'completed':
        return <Badge variant="outline">Abgeschlossen</Badge>;
      default:
        return <Badge variant="destructive">Nicht zugewiesen</Badge>;
    }
  };

  const getPaymentStatusBadge = (hasPendingPayments: boolean) => {
    return hasPendingPayments ? 
      <Badge variant="destructive">Offene Zahlungen</Badge> : 
      <Badge variant="default">Alle Zahlungen aktuell</Badge>;
  };

  const formatTimeSlot = (dayOfWeek: string, timeSlot: string) => {
    const days = {
      'monday': 'Montag',
      'tuesday': 'Dienstag', 
      'wednesday': 'Mittwoch',
      'thursday': 'Donnerstag',
      'friday': 'Freitag',
      'saturday': 'Samstag',
      'sunday': 'Sonntag'
    };
    return `${days[dayOfWeek as keyof typeof days] || dayOfWeek} ${timeSlot}`;
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schüler-Details werden geladen...</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {studentDetails.first_name} {studentDetails.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Grundinformationen */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grundinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">E-Mail:</span>
                  <span>{studentDetails.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Bundesland:</span>
                  <span>{studentDetails.bundesland}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Klassenstufe:</span>
                  <span>{studentDetails.klassenstufe}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Registriert:</span>
                  <span>{new Date(studentDetails.created_at).toLocaleDateString('de-DE')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="font-medium">Status:</span>
                {getStatusBadge(studentDetails.group_status)}
                {getPaymentStatusBadge(studentDetails.has_pending_payments)}
              </div>
            </CardContent>
          </Card>

          {/* Verfügbarkeiten */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Verfügbarkeiten ({studentDetails.availabilities.length} Zeitslots)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {studentDetails.availabilities.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tag</TableHead>
                      <TableHead>Uhrzeit</TableHead>
                      <TableHead>Hinzugefügt am</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentDetails.availabilities.map((availability) => (
                      <TableRow key={availability.id}>
                        <TableCell>
                          {formatTimeSlot(availability.day_of_week, '').split(' ')[0]}
                        </TableCell>
                        <TableCell>{availability.time_slot}</TableCell>
                        <TableCell>
                          {new Date(availability.created_at).toLocaleDateString('de-DE')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Keine Verfügbarkeiten angegeben
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gruppenmitgliedschaften */}
          {studentDetails.group_memberships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Gruppenmitgliedschaften
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studentDetails.group_memberships.map((membership) => (
                    <div key={membership.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {membership.groups.bundesland} - {membership.groups.klassenstufe}
                            </span>
                            {getStatusBadge(membership.groups.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Beigetreten am: {new Date(membership.joined_at).toLocaleDateString('de-DE')}
                          </div>
                          {membership.groups.time_slots && (
                            <div className="flex flex-wrap gap-1">
                              {membership.groups.time_slots.map((slot, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {slot}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Zahlungen */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Zahlungsstatus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Sessions pro Monat:</span>
                  <Badge variant="outline">{studentDetails.sessions_per_month}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Zahlungsstatus:</span>
                  {getPaymentStatusBadge(studentDetails.has_pending_payments)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
