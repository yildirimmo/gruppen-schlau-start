
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGroups } from "@/hooks/useGroups";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, LogOut, Settings, Calendar, Users2 } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { userGroups, matchingGroups, isLoadingUserGroups, isLoadingMatching } = useGroups(user?.id);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Hallo, {profile?.first_name || user?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Verwalten Sie Ihre Gruppennachhilfe</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Profil
              </CardTitle>
              <CardDescription>Ihre persönlichen Daten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {profile?.first_name} {profile?.last_name}</p>
                <p><strong>Bundesland:</strong> {profile?.bundesland}</p>
                <p><strong>Klassenstufe:</strong> {profile?.klassenstufe}</p>
                <p><strong>Sessions/Monat:</strong> {profile?.sessions_per_month}</p>
              </div>
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Verfügbarkeiten
              </CardTitle>
              <CardDescription>Ihre Zeitfenster verwalten</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/availability">
                <Button className="w-full">
                  Verfügbarkeiten bearbeiten
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Groups Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users2 className="h-5 w-5 mr-2" />
                Meine Gruppen
              </CardTitle>
              <CardDescription>
                {userGroups?.length || 0} Gruppe(n)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingUserGroups ? (
                <p className="text-gray-500">Wird geladen...</p>
              ) : userGroups?.length ? (
                <div className="space-y-2">
                  {userGroups.map((membership) => (
                    <div key={membership.id} className="p-2 bg-blue-50 rounded text-sm">
                      <p><strong>{membership.groups?.klassenstufe}</strong></p>
                      <p className="text-gray-600">{membership.groups?.bundesland}</p>
                      {membership.groups?.whatsapp_link && (
                        <a 
                          href={membership.groups.whatsapp_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          WhatsApp-Gruppe
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Noch keine Gruppen</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Matching Groups */}
        {matchingGroups && matchingGroups.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Passende Gruppen</CardTitle>
              <CardDescription>
                Gruppen, die zu Ihrem Profil und Ihren Verfügbarkeiten passen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMatching ? (
                <p className="text-gray-500">Wird geladen...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchingGroups.map((group) => (
                    <div key={group.group_id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold">{group.klassenstufe}</h4>
                      <p className="text-gray-600 text-sm">{group.bundesland}</p>
                      <p className="text-sm mt-2">
                        <strong>Übereinstimmende Zeiten:</strong> {group.matching_slots}
                      </p>
                      <p className="text-sm">
                        <strong>Mitglieder:</strong> {group.current_members}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
