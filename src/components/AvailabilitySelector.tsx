
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useAvailabilities } from '@/hooks/useAvailabilities';

interface AvailabilitySelectorProps {
  userId: string;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Montag' },
  { value: 'tuesday', label: 'Dienstag' },
  { value: 'wednesday', label: 'Mittwoch' },
  { value: 'thursday', label: 'Donnerstag' },
  { value: 'friday', label: 'Freitag' },
  { value: 'saturday', label: 'Samstag' },
  { value: 'sunday', label: 'Sonntag' },
] as const;

const TIME_SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
];

export const AvailabilitySelector = ({ userId }: AvailabilitySelectorProps) => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { availabilities, addAvailability, removeAvailability, isAdding } = useAvailabilities(userId);

  const handleAddAvailability = () => {
    if (selectedDay && selectedTime) {
      addAvailability({
        day_of_week: selectedDay as any,
        time_slot: selectedTime,
      });
      setSelectedDay('');
      setSelectedTime('');
    }
  };

  const getDayLabel = (dayValue: string) => {
    return DAYS_OF_WEEK.find(day => day.value === dayValue)?.label || dayValue;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ihre Verfügbarkeiten</CardTitle>
        <CardDescription>
          Wählen Sie die Zeiten aus, an denen Sie für Nachhilfe verfügbar sind.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Wochentag wählen" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Uhrzeit wählen" />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleAddAvailability}
            disabled={!selectedDay || !selectedTime || isAdding}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Aktuelle Verfügbarkeiten:</h4>
          <div className="flex flex-wrap gap-2">
            {availabilities?.map((availability) => (
              <Badge
                key={availability.id}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {getDayLabel(availability.day_of_week)} {availability.time_slot}
                <button
                  onClick={() => removeAvailability(availability.id)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {availabilities?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Noch keine Verfügbarkeiten hinzugefügt.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
