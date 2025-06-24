
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    bundesland: "",
    klassenstufe: "",
    sessionsPerMonth: 1
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

  useEffect(() => {
    if (user) {
      navigate("/availability");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await signUp(
      formData.email, 
      formData.password, 
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bundesland: formData.bundesland,
        klassenstufe: formData.klassenstufe,
        sessionsPerMonth: formData.sessionsPerMonth
      }
    );
    
    if (data && !error) {
      // User will be redirected to availability page via useEffect when user state updates
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-700 transition-colors mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Startseite
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Registrieren</CardTitle>
            <CardDescription>
              Erstellen Sie Ihr Konto für Gruppennachhilfe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
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
                <Label htmlFor="bundesland">Bundesland</Label>
                <Select value={formData.bundesland} onValueChange={(value) => setFormData({...formData, bundesland: value})}>
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
                <Select value={formData.klassenstufe} onValueChange={(value) => setFormData({...formData, klassenstufe: value})}>
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

              <div>
                <Label htmlFor="sessions">Gewünschte Sessions pro Monat</Label>
                <Select value={formData.sessionsPerMonth.toString()} onValueChange={(value) => setFormData({...formData, sessionsPerMonth: parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Session</SelectItem>
                    <SelectItem value="2">2 Sessions</SelectItem>
                    <SelectItem value="3">3 Sessions</SelectItem>
                    <SelectItem value="4">4 Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Wird registriert..." : "Registrieren"}
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
    </div>
  );
};

export default Register;
