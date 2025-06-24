
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { Users, Calendar, MessageCircle, UserCheck, ArrowRight } from "lucide-react";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: UserCheck,
      title: "Einfache Registrierung",
      description: "Erstellen Sie Ihr Profil mit Bundesland und Klassenstufe"
    },
    {
      icon: Calendar,
      title: "Verfügbarkeiten eintragen",
      description: "Teilen Sie uns mit, wann Sie Zeit für Nachhilfe haben"
    },
    {
      icon: Users,
      title: "Automatisches Matching",
      description: "Wir finden passende Gruppen basierend auf Ihren Kriterien"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Integration",
      description: "Kommunizieren Sie direkt mit Ihrer Lerngruppe"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">GruppenSchlau</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Anmelden</Button>
              </Link>
              <Link to="/register">
                <Button>Registrieren</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Finden Sie Ihre perfekte Lerngruppe
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            GruppenSchlau verbindet Schüler derselben Klassenstufe und Region 
            für effektive Gruppennachhilfe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="flex items-center gap-2">
                Jetzt starten
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                Bereits registriert? Anmelden
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How it works */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">So funktioniert's</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Registrieren</h3>
              <p className="text-gray-600">
                Erstellen Sie Ihr Profil mit Ihren Daten und Präferenzen
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Verfügbarkeiten angeben</h3>
              <p className="text-gray-600">
                Teilen Sie uns mit, wann Sie Zeit für Gruppennachhilfe haben
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Gruppe finden</h3>
              <p className="text-gray-600">
                Wir matchen Sie mit passenden Schülern und erstellen Ihre Gruppe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
