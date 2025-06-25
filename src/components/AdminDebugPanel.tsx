
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const AdminDebugPanel = () => {
  const { user } = useAuth();
  const { isAdmin, refetch } = useAdminCheck();
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

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
        
        // Invalidate and refetch admin status
        await queryClient.invalidateQueries({ queryKey: ['is-admin'] });
        await refetch();
        
        alert('Admin-Status erfolgreich gesetzt! Die Berechtigung ist jetzt aktiv.');
      }
    } catch (error) {
      console.error('Exception making user admin:', error);
      alert('Unerwarteter Fehler: ' + error);
    }
    setIsUpdating(false);
  };

  const handleRefreshStatus = async () => {
    setIsUpdating(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['is-admin'] });
      await refetch();
      alert('Admin-Status wurde aktualisiert!');
    } catch (error) {
      console.error('Error refreshing admin status:', error);
      alert('Fehler beim Aktualisieren des Status');
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
        
        <div className="flex gap-2">
          {!isAdmin && (
            <Button 
              onClick={handleMakeAdmin}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Wird gesetzt...' : 'Als Admin setzen'}
            </Button>
          )}
          
          <Button 
            onClick={handleRefreshStatus}
            disabled={isUpdating}
            variant="outline"
            className="flex-1"
          >
            {isUpdating ? 'Aktualisiere...' : 'Status aktualisieren'}
          </Button>
        </div>
        
        {isAdmin ? (
          <div className="p-3 bg-green-100 border border-green-200 rounded">
            <p className="text-green-800">✅ Du bist bereits Admin!</p>
            <p className="text-sm text-green-700 mt-1">
              Das Admin Panel sollte jetzt in der Sidebar zugänglich sein.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-yellow-100 border border-yellow-200 rounded">
            <p className="text-yellow-800">⚠️ Du bist noch kein Admin</p>
            <p className="text-sm text-yellow-700 mt-1">
              Klicke auf "Als Admin setzen" um Admin-Berechtigung zu erhalten.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
