
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  GraduationCap,
  ExternalLink,
  Zap
} from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { StudentsOverview } from "@/components/StudentsOverview";
import { AutoMatchingPanel } from "@/components/AutoMatchingPanel";
import { useState } from "react";

const AdminDashboard = () => {
  const { 
    pendingGroups, 
    activeGroups, 
    stats, 
    isLoading, 
    createGroup, 
    isCreatingGroup 
  } = useAdminData();

  const [whatsappLinks, setWhatsappLinks] = useState<Record<string, string>>({});

  // Debug logging
  useEffect(() => {
    console.log('AdminDashboard - Pending Groups:', pendingGroups);
    console.log('AdminDashboard - Active Groups:', activeGroups);
    console.log('AdminDashboard - Stats:', stats);
  }, [pendingGroups, activeGroups, stats]);

  const handleCreateGroup = (groupId: string) => {
    const whatsappLink = whatsappLinks[groupId];
    if (!whatsappLink) {
      alert('Bitte geben Sie einen WhatsApp-Link ein');
      return;
    }
    createGroup({ groupId, whatsappLink });
  };

  const handleWhatsappLinkChange = (groupId: string, link: string) => {
    setWhatsappLinks(prev => ({
      ...prev,
      [groupId]: link
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Admin-Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Admin Dashboard</span>
          </div>
          <p className="text-gray-600">
            Verwaltung und Übersicht aller Nachhilfegruppen
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamte Schüler</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wartende Gruppen</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingGroups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Gruppen</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGroups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abgeschlossene Gruppen</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedBookings}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="auto-matching" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auto-matching" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Auto-Matching
            </TabsTrigger>
            <TabsTrigger value="pending">Wartende Gruppen</TabsTrigger>
            <TabsTrigger value="active">Aktive Gruppen</TabsTrigger>
            <TabsTrigger value="students">Schüler</TabsTrigger>
          </TabsList>

          <TabsContent value="auto-matching">
            <AutoMatchingPanel />
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Wartende Gruppen</CardTitle>
                <CardDescription>
                  Gruppen die bereit sind, aktiviert zu werden
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
                      Alle Gruppen sind bereits aktiv oder es wurden noch keine Gruppen erstellt.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingGroups.map((group) => (
                      <Card key={group.group_id} className="border-l-4 border-l-orange-500">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-medium">{group.bundesland}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  <span className="font-medium">{group.klassenstufe}</span>
                                </div>
                                <Badge variant="secondary">
                                  <Users className="h-3 w-3 mr-1" />
                                  {group.student_count} Schüler
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-sm font-medium">Zeitslots:</div>
                                <div className="flex flex-wrap gap-1">
                                  {group.time_slots?.map((slot, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {slot}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="text-sm font-medium">Teilnehmer:</div>
                                <div className="space-y-1">
                                  {group.students?.map((student: any, index: number) => (
                                    <div key={index} className="text-sm text-gray-600">
                                      {student.name} ({student.email})
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`whatsapp-${group.group_id}`}>
                                  WhatsApp Gruppen-Link
                                </Label>
                                <Input
                                  id={`whatsapp-${group.group_id}`}
                                  placeholder="https://chat.whatsapp.com/..."
                                  value={whatsappLinks[group.group_id] || ''}
                                  onChange={(e) => handleWhatsappLinkChange(group.group_id, e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                            <Button 
                              onClick={() => handleCreateGroup(group.group_id)}
                              disabled={isCreatingGroup || !whatsappLinks[group.group_id]}
                              className="w-full"
                            >
                              {isCreatingGroup ? 'Wird erstellt...' : 'Gruppe aktivieren'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Aktive Gruppen</CardTitle>
                <CardDescription>
                  Laufende Nachhilfegruppen mit WhatsApp-Links
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Keine aktiven Gruppen
                    </h3>
                    <p className="text-gray-600">
                      Es sind noch keine Gruppen aktiv.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeGroups.map((group) => (
                      <Card key={group.group_id} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-medium">{group.bundesland}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-4 w-4" />
                                  <span className="font-medium">{group.klassenstufe}</span>
                                </div>
                                <Badge variant="default">
                                  <Users className="h-3 w-3 mr-1" />
                                  {group.student_count} Schüler
                                </Badge>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="text-sm font-medium">Zeitslots:</div>
                                <div className="flex flex-wrap gap-1">
                                  {group.time_slots?.map((slot, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {slot}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="text-sm text-gray-600">
                                Erstellt am {new Date(group.created_at).toLocaleDateString('de-DE')}
                              </div>
                              
                              {group.whatsapp_link && (
                                <div className="mt-3">
                                  <a 
                                    href={group.whatsapp_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    WhatsApp Gruppe öffnen
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <StudentsOverview />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
