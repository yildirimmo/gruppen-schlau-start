
import { useAuth } from "@/hooks/useAuth";
import { useAvailabilities } from "@/hooks/useAvailabilities";
import { AvailabilitySelector } from "@/components/AvailabilitySelector";
import { GroupMatcher } from "@/components/GroupMatcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowLeft, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Availability = () => {
  const { user } = useAuth();
  const { availabilities } = useAvailabilities(user?.id || '');

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/dashboard" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Link>
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Clock className="h-6 w-6" />
              Verfügbarkeiten verwalten
            </CardTitle>
            <CardDescription>
              Wählen Sie Ihre verfügbaren Zeiten aus. Je mehr Zeiten Sie auswählen, 
              desto schneller finden wir eine passende Gruppe für Sie.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailabilitySelector userId={user.id} />
          </CardContent>
        </Card>

        {/* Show group matching only if user has availability */}
        {availabilities && availabilities.length > 0 && (
          <GroupMatcher userId={user.id} />
        )}

        {/* Help text when no availability */}
        {(!availabilities || availabilities.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Keine Verfügbarkeiten eingetragen
              </h3>
              <p className="text-gray-600">
                Fügen Sie mindestens eine Verfügbarkeit hinzu, um passende Gruppen zu finden.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Availability;
