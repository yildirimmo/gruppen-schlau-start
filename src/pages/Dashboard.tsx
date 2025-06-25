
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGroups } from "@/hooks/useGroups";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, MessageCircle, Settings, LogOut, ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { userGroups } = useGroups(user?.id);
  const { isAdmin } = useAdminCheck();

  if (!user) {
    return null;
  }

  const activeGroups = userGroups?.filter(group => 
    group.groups?.status === 'active' && group.groups?.whatsapp_link
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
            </div>
            <h1 className="text-xl text-gray-700">
              Willkommen, {profile?.first_name || 'Schüler'}!
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Info */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Ihr Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-Mail</p>
                  <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bundesland</p>
                  <p className="font-medium">{profile.bundesland}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Klassenstufe</p>
                  <p className="font-medium">{profile.klassenstufe}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Groups */}
        {activeGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Ihre aktiven Gruppen
              </CardTitle>
              <CardDescription>
                Gruppen, in denen Sie Mitglied sind
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeGroups.map((groupMember) => (
                  <div key={groupMember.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">
                        {groupMember.groups?.bundesland} - {groupMember.groups?.klassenstufe}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Beigetreten am: {new Date(groupMember.joined_at).toLocaleDateString('de-DE')}
                      </p>
                      <Badge variant="default" className="mt-2">Aktiv</Badge>
                    </div>
                    {groupMember.groups?.whatsapp_link && (
                      <Button asChild>
                        <a href={groupMember.groups.whatsapp_link} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          WhatsApp öffnen
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Verfügbarkeiten
              </CardTitle>
              <CardDescription>
                Verwalten Sie Ihre verfügbaren Zeiten für Gruppennachhilfe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/availability">
                <Button className="w-full">
                  Verfügbarkeiten verwalten
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gruppenstatus
              </CardTitle>
              <CardDescription>
                {activeGroups.length > 0 
                  ? `Sie sind in ${activeGroups.length} aktiven Gruppe${activeGroups.length > 1 ? 'n' : ''}`
                  : "Sie sind noch in keiner Gruppe"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeGroups.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Fügen Sie Verfügbarkeiten hinzu, damit wir eine passende Gruppe für Sie finden können.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Nutzen Sie WhatsApp, um mit Ihren Gruppenmitgliedern zu kommunizieren.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
