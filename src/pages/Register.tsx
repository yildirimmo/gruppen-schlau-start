
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bundesland: "",
    klassenstufe: "",
    sessionsPerMonth: "",
    acceptTerms: false
  });

  const bundeslaender = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen",
    "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen",
    "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen",
    "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
  ];

  const klassenstufen = [
    "5. Klasse", "6. Klasse", "7. Klasse", "8. Klasse", "9. Klasse",
    "10. Klasse", "11. Klasse", "12. Klasse", "13. Klasse"
  ];

  const sessionsOptions = [
    { value: "1", label: "1x pro Monat" },
    { value: "2", label: "2x pro Monat" },
    { value: "4", label: "4x pro Monat" },
    { value: "8", label: "8x pro Monat" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    if (!formData.acceptTerms) {
      return;
    }

    const { data, error } = await signUp(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      bundesland: formData.bundesland,
      klassenstufe: formData.klassenstufe,
      sessionsPerMonth: parseInt(formData.sessionsPerMonth) || 1,
    });

    if (data && !error) {
      navigate("/availability");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zur Startseite
        </Link>
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>
            Registrieren Sie sich für die Gruppennachhilfe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Persönliche Daten */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Persönliche Daten</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schulinformationen */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Schulinformationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bundesland">Bundesland</Label>
                  <Select onValueChange={(value) => setFormData({...formData, bundesland: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Bundesland wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {bundeslaender.map((land) => (
                        <SelectItem key={land} value={land}>{land}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="klassenstufe">Klassenstufe</Label>
                  <Select onValueChange={(value) => setFormData({...formData, klassenstufe: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Klassenstufe wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {klassenstufen.map((stufe) => (
                        <SelectItem key={stufe} value={stufe}>{stufe}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Teilnahme-Häufigkeit */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Teilnahme</h3>
              <div>
                <Label htmlFor="sessions">Wie oft möchten Sie pro Monat teilnehmen?</Label>
                <Select onValueChange={(value) => setFormData({...formData, sessionsPerMonth: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Häufigkeit wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Zustimmung */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => setFormData({...formData, acceptTerms: checked as boolean})}
              />
              <Label htmlFor="terms" className="text-sm">
                Ich akzeptiere die{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Nutzungsbedingungen
                </a>{" "}
                und{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Datenschutzerklärung
                </a>
              </Label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Wird erstellt..." : "Konto erstellen"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Bereits ein Konto?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Hier anmelden
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
