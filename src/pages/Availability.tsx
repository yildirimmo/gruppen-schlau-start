
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Availability = () => {
  const { toast } = useToast();
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string[]>>({});

  const weekdays = [
    { key: "monday", label: "Montag" },
    { key: "tuesday", label: "Dienstag" },
    { key: "wednesday", label: "Mittwoch" },
    { key: "thursday", label: "Donnerstag" },
    { key: "friday", label: "Freitag" },
    { key: "saturday", label: "Samstag" },
    { key: "sunday", label: "Sonntag" }
  ];

  const timeSlots = [
    "08:00 - 09:00", "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00",
    "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
    "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"
  ];

  const handleTimeToggle = (day: string, time: string) => {
    setSelectedTimes(prev => {
      const dayTimes = prev[day] || [];
      const isSelected = dayTimes.includes(time);
      
      if (isSelected) {
        return {
          ...prev,
          [day]: dayTimes.filter(t => t !== time)
        };
      } else {
        return {
          ...prev,
          [day]: [...dayTimes, time]
        };
      }
    });
  };

  const handleSubmit = () => {
    const totalSelected = Object.values(selectedTimes).flat().length;
    
    if (totalSelected === 0) {
      toast({
        title: "Keine Zeiten ausgewählt",
        description: "Bitte wählen Sie mindestens einen Zeitslot aus.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Verfügbarkeiten gespeichert!",
      description: `${totalSelected} Zeitslots wurden gespeichert. Wir suchen nach passenden Gruppen.`
    });

    console.log("Selected availability:", selectedTimes);
  };

  const getTotalSelected = () => {
    return Object.values(selectedTimes).flat().length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zum Dashboard
        </Link>
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Clock className="h-6 w-6" />
              Verfügbarkeiten eintragen
            </CardTitle>
            <CardDescription>
              Wählen Sie alle Zeiten aus, zu denen Sie für Nachhilfe verfügbar sind.
              Je mehr Zeiten Sie auswählen, desto schneller finden wir eine passende Gruppe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Status */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Ausgewählte Zeitslots: {getTotalSelected()}</span>
                </div>
                <span className="text-sm text-gray-600">
                  Empfehlung: Mindestens 5-10 Zeitslots für optimale Gruppenfindung
                </span>
              </div>
            </div>

            {/* Zeitslot-Auswahl */}
            <div className="space-y-6">
              {weekdays.map((day) => (
                <Card key={day.key} className="shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">{day.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {timeSlots.map((time) => {
                        const isSelected = selectedTimes[day.key]?.includes(time) || false;
                        return (
                          <div
                            key={time}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleTimeToggle(day.key, time)}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent div click
                              />
                              <Label className="text-sm cursor-pointer">
                                {time}
                              </Label>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <Button onClick={handleSubmit} size="lg" className="px-8">
                Verfügbarkeiten speichern
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Availability;
