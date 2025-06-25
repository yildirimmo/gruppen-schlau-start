
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  GraduationCap,
  ExternalLink 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGroups } from "@/hooks/useGroups";
import { GroupMatcher } from "@/components/GroupMatcher";
import { AdminDebugPanel } from "@/components/AdminDebugPanel";

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useProfile();
  const { userGroups, isLoading: isLoadingGroups } = useGroups();

  useEffect(() => {
    console.log('Dashboard - User:', user?.id);
    console.log('Dashboard - Profile:', profile);
    console.log('Dashboard - Groups:', userGroups);
  }, [user, profile, userGroups]);

  if (isLoadingProfile || isLoadingGroups) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  const getGroupStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktive Gruppe</Badge>;
      case 'pending':
        return <Badge variant="secondary">Wartende Gruppe</Badge>;
      case 'completed':
        return <Badge variant="outline">Abgeschlossen</Badge>;
      default:
        return <Badge variant="destructive">Nicht zugewiesen</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Debug Panel - nur für Entwicklung */}
        <AdminDebugPanel />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              Willkommen, {profile?.first_name}!
            </span>
          </div>
          <p className="text-gray-600">
            Hier ist deine Übersicht über deine Nachhilfegruppen und Aktivitäten.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dein Profil</CardTitle>
            <CardDescription>Deine grundlegenden Informationen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{profile?.bundesland}</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-gray-500" />
                <span>{profile?.klassenstufe}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span>{profile?.sessions_per_month} Sessions/Monat</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Groups Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Current Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Deine aktuellen Gruppen
              </CardTitle>
              <CardDescription>
                Übersicht über alle deine Gruppen-Mitgliedschaften
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userGroups.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Keine Gruppen gefunden
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Du bist noch keiner Nachhilfegruppe beigetreten.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userGroups.map((group, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
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
                            </div>
                            
                            <div className="space-y-1">
                              <div className="text-sm font-medium">Zeitslots:</div>
                              <div className="flex flex-wrap gap-1">
                                {group.time_slots?.map((slot, slotIndex) => (
                                  <Badge key={slotIndex} variant="outline" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {slot}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {getGroupStatusBadge(group.status)}
                              <span className="text-sm text-gray-500">
                                Beigetreten am {new Date(group.joined_at).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                            
                            {group.whatsapp_link && group.status === 'active' && (
                              <div className="mt-3">
                                <a 
                                  href={group.whatsapp_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  WhatsApp Gruppe beitreten
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

          {/* Group Matching */}
          <GroupMatcher />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
