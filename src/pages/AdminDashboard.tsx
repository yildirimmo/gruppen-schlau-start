
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MapPin, BookOpen, MessageCircle, Plus, Edit, Eye, ArrowLeft } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { isAdmin, isLoading: isCheckingAdmin } = useAdminCheck();
  const { pendingGroups, activeGroups, stats, isLoading, createGroup, isCreatingGroup } = useAdminData();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState("");

  const handleCreateGroup = (groupId: string) => {
    if (!whatsappLink.trim()) {
      return;
    }

    createGroup({ groupId, whatsappLink });
    setSelectedGroup(null);
    setWhatsappLink("");
  };

  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Berechtigung wird überprüft...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Zugriff verweigert</h2>
            <p className="text-gray-600 mb-6">
              Sie haben keine Berechtigung, auf das Admin-Dashboard zuzugreifen.
            </p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zum Dashboard
          </Link>
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">GruppenSchlau Admin</span>
          </div>
          <p className="text-gray-600">Verwalten Sie Schülergruppen und Buchungen</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalStudents}</p>
                  <p className="text-gray-600">Registrierte Schüler</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.pendingGroups}</p>
                  <p className="text-gray-600">Wartende Gruppen</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.activeGroups}</p>
                  <p className="text-gray-600">Aktive Gruppen</p>
                </div>
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.completedBookings}</p>
                  <p className="text-gray-600">Abgeschlossen</p>
                </div>
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wartende Gruppen */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Wartende Gruppen (Bereit für Erstellung)
            </CardTitle>
            <CardDescription>
              Diese Gruppen haben genügend Schüler mit übereinstimmenden Verfügbarkeiten
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingGroups.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine wartenden Gruppen
                </h3>
                <p className="text-gray-600">
                  Es gibt derzeit keine Gruppen, die bereit zur Erstellung sind.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingGroups.map((group) => (
                  <Card key={group.group_id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {group.bundesland} - {group.klassenstufe}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {group.student_count} Schüler
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {group.bundesland}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {group.time_slots.map((time, index) => (
                              <Badge key={index} variant="secondary">
                                {time}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          onClick={() => setSelectedGroup(selectedGroup === group.group_id ? null : group.group_id)}
                          variant={selectedGroup === group.group_id ? "secondary" : "default"}
                          disabled={isCreatingGroup}
                        >
                          {selectedGroup === group.group_id ? "Schließen" : "Gruppe erstellen"}
                        </Button>
                      </div>

                      {/* Schülerliste */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-3">Schüler in dieser Gruppe:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.students.map((student, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-gray-600">{student.email}</p>
                              </div>
                              <Badge variant="outline">
                                {new Date(student.registered).toLocaleDateString('de-DE')}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp-Link Eingabe */}
                      {selectedGroup === group.group_id && (
                        <div className="space-y-4 border-t pt-4">
                          <div>
                            <Label htmlFor="whatsapp-link">WhatsApp-Gruppenlink</Label>
                            <Input
                              id="whatsapp-link"
                              placeholder="https://chat.whatsapp.com/..."
                              value={whatsappLink}
                              onChange={(e) => setWhatsappLink(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleCreateGroup(group.group_id)} 
                              className="flex-1"
                              disabled={!whatsappLink.trim() || isCreatingGroup}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {isCreatingGroup ? "Wird erstellt..." : "Gruppe erstellen & Links versenden"}
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedGroup(null)}>
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aktive Gruppen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Aktive Gruppen
            </CardTitle>
            <CardDescription>
              Bereits erstellte und laufende Nachhilfegruppen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeGroups.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine aktiven Gruppen
                </h3>
                <p className="text-gray-600">
                  Es gibt derzeit keine aktiven Gruppen.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeGroups.map((group) => (
                  <Card key={group.group_id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {group.bundesland} - {group.klassenstufe}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {group.student_count} Schüler
                            </div>
                            <Badge variant="default">Aktiv</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {group.time_slots.map((time, index) => (
                              <Badge key={index} variant="secondary">
                                {time}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            Erstellt am: {new Date(group.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Bearbeiten
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
