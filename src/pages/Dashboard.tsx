
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Clock, BookOpen, Settings, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useGroups } from "@/hooks/useGroups";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);
  const { userGroups, isLoadingUserGroups } = useGroups(user?.id);
  const { isAdmin } = useAdminCheck();

  // Ensure userGroups is always an array
  const safeUserGroups = userGroups || [];

  if (isLoadingProfile || isLoadingUserGroups) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
            </div>
            <p className="text-gray-600">
              Willkommen zurück, {profile?.first_name}!
            </p>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Button>
              </Link>
            )}
            <Button variant="outline" onClick={signOut}>
              Abmelden
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ihr Profil</CardTitle>
            <CardDescription>Ihre Lerninformationen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{profile?.first_name} {profile?.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bundesland</p>
                <p className="font-medium">{profile?.bundesland}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Klassenstufe</p>
                <p className="font-medium">{profile?.klassenstufe}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link to="/availability">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Verfügbarkeit bearbeiten
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Groups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ihre Gruppen
            </CardTitle>
            <CardDescription>
              Überblick über Ihre Nachhilfegruppen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {safeUserGroups.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Noch keine Gruppen
                </h3>
                <p className="text-gray-600 mb-4">
                  Sobald genügend Schüler mit ähnlichen Verfügbarkeiten registriert sind, 
                  werden Sie automatisch einer Gruppe zugeordnet.
                </p>
                <Link to="/availability">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Verfügbarkeit angeben
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {safeUserGroups.map((membership) => (
                  <Card key={membership.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold mb-2">
                            {membership.groups?.bundesland} - {membership.groups?.klassenstufe}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={
                              membership.groups?.status === 'active' ? 'default' :
                              membership.groups?.status === 'pending' ? 'secondary' : 'outline'
                            }>
                              {membership.groups?.status === 'active' ? 'Aktiv' :
                               membership.groups?.status === 'pending' ? 'Wartend' : 'Abgeschlossen'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Beigetreten am {new Date(membership.joined_at).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          {membership.groups?.status === 'active' && membership.groups?.whatsapp_link && (
                            <div className="mt-3">
                              <a 
                                href={membership.groups.whatsapp_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                              >
                                <Users className="h-4 w-4" />
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
      </div>
    </div>
  );
};

export default Dashboard;
