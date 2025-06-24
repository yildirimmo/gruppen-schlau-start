
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Users, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data, error } = await signIn(formData.email, formData.password);
    
    if (data && !error) {
      navigate("/");
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
            <CardTitle className="text-2xl">Anmelden</CardTitle>
            <CardDescription>
              Melden Sie sich in Ihr Konto an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <div className="flex items-center justify-between">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  Passwort vergessen?
                </a>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Wird angemeldet..." : "Anmelden"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Noch kein Konto?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Hier registrieren
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
