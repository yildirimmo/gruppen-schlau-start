
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';

interface GroupMatcherProps {
  userId: string;
}

export const GroupMatcher = ({ userId }: GroupMatcherProps) => {
  const { matchingGroups, userGroups, joinGroup, isJoining } = useGroups(userId);

  return (
    <div className="space-y-6">
      {/* Bestehende Gruppen */}
      {userGroups && userGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Ihre Gruppen
            </CardTitle>
            <CardDescription>
              Gruppen, denen Sie bereits beigetreten sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userGroups.map((membership) => {
                const group = membership.groups as any;
                return (
                  <div
                    key={membership.id}
                    className="p-4 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">{group.bundesland}</span>
                          <Badge variant="outline">{group.klassenstufe}</Badge>
                        </div>
                        <Badge 
                          variant={group.status === 'active' ? 'default' : 'secondary'}
                        >
                          {group.status === 'pending' ? 'In Vorbereitung' : 
                           group.status === 'active' ? 'Aktiv' : 'Abgeschlossen'}
                        </Badge>
                      </div>
                      {group.whatsapp_link && group.status === 'active' && (
                        <Button asChild>
                          <a href={group.whatsapp_link} target="_blank" rel="noopener noreferrer">
                            WhatsApp Gruppe
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Passende Gruppen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Passende Gruppen
          </CardTitle>
          <CardDescription>
            Gruppen, die zu Ihrem Bundesland, Ihrer Klassenstufe und Ihren Verfügbarkeiten passen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matchingGroups && matchingGroups.length > 0 ? (
            <div className="space-y-4">
              {matchingGroups.map((group) => (
                <div
                  key={group.group_id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">{group.bundesland}</span>
                        <Badge variant="outline">{group.klassenstufe}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{group.matching_slots} passende Zeiten</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{group.current_members} von 5 Mitgliedern</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => joinGroup(group.group_id)}
                      disabled={isJoining}
                    >
                      Beitreten
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine passenden Gruppen gefunden
              </h3>
              <p className="text-gray-600 mb-4">
                Momentan gibt es keine Gruppen, die zu Ihren Kriterien passen.
                Fügen Sie mehr Verfügbarkeiten hinzu oder warten Sie, bis sich andere Schüler anmelden.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
