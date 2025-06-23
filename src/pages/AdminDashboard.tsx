
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, Clock, MapPin, BookOpen, MessageCircle, Plus, Edit, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [whatsappLink, setWhatsappLink] = useState("");

  // Mock-Daten für Demo
  const pendingGroups = [
    {
      id: 1,
      bundesland: "Bayern",
      klassenstufe: "10. Klasse",
      students: 4,
      commonTimes: ["Montag 16:00-17:00", "Mittwoch 17:00-18:00"],
      studentsData: [
        { name: "Max Mustermann", email: "max@example.com", registered: "2024-01-15" },
        { name: "Anna Schmidt", email: "anna@example.com", registered: "2024-01-16" },
        { name: "Tom Weber", email: "tom@example.com", registered: "2024-01-17" },
        { name: "Lisa Klein", email: "lisa@example.com", registered: "2024-01-18" }
      ]
    },
    {
      id: 2,
      bundesland: "Nordrhein-Westfalen",
      klassenstufe: "9. Klasse",
      students: 3,
      commonTimes: ["Dienstag 15:00-16:00", "Donnerstag 16:00-17:00"],
      studentsData: [
        { name: "Jan Müller", email: "jan@example.com", registered: "2024-01-20" },
        { name: "Sarah Bauer", email: "sarah@example.com", registered: "2024-01-21" },
        { name: "Leon Fischer", email: "leon@example.com", registered: "2024-01-22" }
      ]
    }
  ];

  const activeGroups = [
    {
      id: 3,
      bundesland: "Baden-Württemberg",
      klassenstufe: "11. Klasse",
      students: 5,
      whatsappLink: "https://chat.whatsapp.com/xyz123",
      createdAt: "2024-01-10",
      status: "Aktiv"
    }
  ];

  const stats = {
    totalStudents: 45,
    pendingGroups: pendingGroups.length,
    activeGroups: activeGroups.length,
    completedBookings: 12
  };

  const handleCreateGroup = (groupId: number) => {
    if (!whatsappLink.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen WhatsApp-Link ein.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Gruppe erstellt!",
      description: "Die Schüler wurden per E-Mail benachrichtigt und erhalten den WhatsApp-Link."
    });

    setSelectedGroup(null);
    setWhatsappLink("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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
            <div className="space-y-6">
              {pendingGroups.map((group) => (
                <Card key={group.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {group.bundesland} - {group.klassenstufe}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {group.students} Schüler
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {group.bundesland}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {group.commonTimes.map((time, index) => (
                            <Badge key={index} variant="secondary">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedGroup(selectedGroup === group.id ? null : group.id)}
                        variant={selectedGroup === group.id ? "secondary" : "default"}
                      >
                        {selectedGroup === group.id ? "Schließen" : "Gruppe erstellen"}
                      </Button>
                    </div>

                    {/* Schülerliste */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium mb-3">Schüler in dieser Gruppe:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.studentsData.map((student, index) => (
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
                    {selectedGroup === group.id && (
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
                          <Button onClick={() => handleCreateGroup(group.id)} className="flex-1">
                            <Plus className="h-4 w-4 mr-2" />
                            Gruppe erstellen & Links versenden
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
            <div className="space-y-4">
              {activeGroups.map((group) => (
                <Card key={group.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {group.bundesland} - {group.klassenstufe}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {group.students} Schüler
                          </div>
                          <Badge variant="default">{group.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Erstellt am: {new Date(group.createdAt).toLocaleDateString('de-DE')}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
