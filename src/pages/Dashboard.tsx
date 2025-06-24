
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGroups } from "@/hooks/useGroups";
import { useAvailabilities } from "@/hooks/useAvailabilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, LogOut, Settings, Calendar, Users2, AlertCircle, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const { userGroups, matchingGroups, isLoadingUserGroups, isLoadingMatching } = useGroups(user?.id);
  const { availabilities } = useAvailabilities(user?.id || '');

  const handleSignOut = async () => {
    await signOut();
  };

  // Check user setup status
  const hasProfile = profile?.first_name && profile?.last_name && profile?.bundesland && profile?.klassenstufe;
  const hasAvailabilities = availabilities && availabilities.length > 0;
  const hasGroups = userGroups && userGroups.length > 0;

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

        {/* Setup Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ihr Fortschritt</CardTitle>
            <CardDescription>Vervollständigen Sie Ihr Profil, um die beste Gruppenfindung zu erhalten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hasProfile ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <span>Profil vervollständigt</span>
                </div>
                {hasProfile ? (
                  <span className="text-green-600 text-sm">✓ Abgeschlossen</span>
                ) : (
                  <span className="text-orange-500 text-sm">Ausstehend</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hasAvailabilities ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <span>Verfügbarkeiten eingetragen</span>
                </div>
                {hasAvailabilities ? (
                  <span className="text-green-600 text-sm">✓ {availabilities?.length} Zeitslots</span>
                ) : (
                  <Link to="/availability">
                    <Button size="sm">Jetzt eintragen</Button>
                  </Link>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {hasGroups ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span>Einer Gruppe beigetreten</span>
                </div>
                {hasGroups ? (
                  <span className="text-green-600 text-sm">✓ {userGroups?.length} Gruppe(n)</span>
                ) : (
                  <span className="text-gray-500 text-sm">
                    {hasAvailabilities ? "Suche läuft..." : "Verfügbarkeiten benötigt"}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
              <CardDescription>
                {availabilities?.length || 0} Zeitslot{(availabilities?.length || 0) !== 1 ? 's' : ''} eingetragen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/availability">
                <Button className="w-full">
                  Verfügbarkeiten {hasAvailabilities ? 'bearbeiten' : 'eintragen'}
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

        {/* Matching Groups - Only show if user has availabilities but no groups yet */}
        {hasAvailabilities && (!userGroups || userGroups.length === 0) && (
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
              ) : matchingGroups && matchingGroups.length > 0 ? (
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
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">
                    Momentan keine passenden Gruppen verfügbar. 
                    Wir benachrichtigen Sie, sobald eine passende Gruppe gefunden wird.
                  </p>
                  <Link to="/availability" className="mt-4 inline-block">
                    <Button variant="outline">Mehr Verfügbarkeiten hinzufügen</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call to action for users without availabilities */}
        {!hasAvailabilities && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bereit für Gruppennachhilfe?
              </h3>
              <p className="text-gray-600 mb-4">
                Tragen Sie Ihre Verfügbarkeiten ein, um mit anderen Schülern in Kontakt zu kommen.
              </p>
              <Link to="/availability">
                <Button size="lg">
                  Verfügbarkeiten eintragen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
