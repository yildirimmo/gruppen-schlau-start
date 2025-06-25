
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useState } from "react";

export const AdminDebugPanel = () => {
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleMakeAdmin = async () => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    try {
      console.log('Making user admin:', user.id);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating admin status:', error);
        alert('Fehler beim Setzen des Admin-Status: ' + error.message);
      } else {
        console.log('Successfully made user admin');
        alert('Admin-Status erfolgreich gesetzt! Bitte lade die Seite neu.');
        // Force page reload to refresh admin status
        window.location.reload();
      }
    } catch (error) {
      console.error('Exception making user admin:', error);
      alert('Unerwarteter Fehler: ' + error);
    }
    setIsUpdating(false);
  };

  if (!user) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p>Nicht eingeloggt</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle>Admin Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Ist Admin:</strong> {isAdmin ? 'Ja' : 'Nein'}</p>
        </div>
        
        {!isAdmin && (
          <Button 
            onClick={handleMakeAdmin}
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? 'Wird gesetzt...' : 'Als Admin setzen'}
          </Button>
        )}
        
        {isAdmin && (
          <div className="p-3 bg-green-100 border border-green-200 rounded">
            <p className="text-green-800">✅ Du bist bereits Admin!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
