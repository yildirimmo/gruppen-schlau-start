
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Clock, MapPin, GraduationCap, Mail, Eye } from "lucide-react";
import { useStudentManagement } from "@/hooks/useStudentManagement";
import { StudentDetailModal } from "./StudentDetailModal";

export function StudentsOverview() {
  const { students, isLoadingStudents } = useStudentManagement();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudentId(null);
  };

  if (isLoadingStudents) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Schüler-Übersicht</CardTitle>
          <CardDescription>Wird geladen...</CardDescription>
        </CardHeader>
      </Card>
    );
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Schüler-Übersicht
          </CardTitle>
          <CardDescription>
            Alle registrierten Schüler und ihr Gruppenstatus. Klicken Sie auf einen Schüler für Details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.map((student) => (
              <Card 
                key={student.id} 
                className="border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleStudentClick(student.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold">
                        {student.first_name} {student.last_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {student.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {student.bundesland}
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {student.klassenstufe}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {student.availabilities_count} Zeitslots
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(student.group_status)}
                        <span className="text-sm text-gray-500">
                          Registriert am {new Date(student.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStudentClick(student.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {students.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine Schüler gefunden
                </h3>
                <p className="text-gray-600">
                  Es sind noch keine Schüler registriert.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <StudentDetailModal
        studentId={selectedStudentId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
