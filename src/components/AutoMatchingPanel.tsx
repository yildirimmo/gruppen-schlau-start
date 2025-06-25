
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, Clock, MapPin, GraduationCap } from "lucide-react";
import { useAutoMatching } from "@/hooks/useAutoMatching";

export function AutoMatchingPanel() {
  const { compatibleGroups, isLoadingCompatible, processAutoMatching, isProcessing } = useAutoMatching();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-Matching System
          </CardTitle>
          <CardDescription>
            Automatische Gruppenerstellung basierend auf Verfügbarkeiten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => processAutoMatching()}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isProcessing ? 'Verarbeitung läuft...' : 'Automatisches Matching starten'}
            </Button>
            <div className="text-sm text-gray-600">
              Sucht nach kompatiblen Schülern und erstellt automatisch Gruppen
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kompatible Schülergruppen</CardTitle>
          <CardDescription>
            Gefundene Schülergruppen die für automatische Gruppierung bereit sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingCompatible ? (
            <div className="text-center py-4">Lade kompatible Gruppen...</div>
          ) : compatibleGroups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine kompatiblen Gruppen gefunden
              </h3>
              <p className="text-gray-600">
                Derzeit sind nicht genügend Schüler mit übereinstimmenden Verfügbarkeiten registriert.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {compatibleGroups.map((group, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
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
                          <div className="text-sm font-medium">Gemeinsame Zeitslots:</div>
                          <div className="flex flex-wrap gap-1">
                            {group.common_time_slots.map((slot, slotIndex) => (
                              <Badge key={slotIndex} variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {slot}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm font-medium">Teilnehmer:</div>
                          <div className="space-y-1">
                            {group.matching_students.map((student: any, studentIndex: number) => (
                              <div key={studentIndex} className="text-sm text-gray-600">
                                {student.name} ({student.email})
                              </div>
                            ))}
                          </div>
                        </div>
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
  );
}
