
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GroupNotificationRequest {
  groupId: string;
  whatsappLink: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { groupId, whatsappLink }: GroupNotificationRequest = await req.json();

    // Get group details with members
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .select(`
        id,
        bundesland,
        klassenstufe,
        time_slots,
        group_members (
          profiles (
            id,
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('id', groupId)
      .single();

    if (groupError) {
      console.error('Error fetching group data:', groupError);
      throw new Error('Gruppe nicht gefunden');
    }

    const members = groupData.group_members.map((member: any) => member.profiles);
    
    if (members.length === 0) {
      throw new Error('Keine Gruppenmitglieder gefunden');
    }

    // Send emails to all group members
    const emailPromises = members.map(async (member: any) => {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Deine Nachhilfegruppe ist bereit!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Deine Nachhilfegruppe ist bereit!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2563eb; margin-top: 0;">Hallo ${member.first_name}!</h2>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Großartige Neuigkeiten! Deine Nachhilfegruppe wurde erfolgreich erstellt und ist bereit zu starten.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #059669;">📚 Deine Gruppendetails:</h3>
              <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 8px;"><strong>Bundesland:</strong> ${groupData.bundesland}</li>
                <li style="margin-bottom: 8px;"><strong>Klassenstufe:</strong> ${groupData.klassenstufe}</li>
                <li style="margin-bottom: 8px;"><strong>Termine:</strong> ${groupData.time_slots.join(', ')}</li>
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${whatsappLink}" 
               style="display: inline-block; background: #25d366; color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
              📱 Zur WhatsApp-Gruppe
            </a>
          </div>

          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
            <h3 style="margin-top: 0; color: #856404;">🚀 Nächste Schritte:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Klicke auf den WhatsApp-Link oben</li>
              <li>Stelle dich in der Gruppe vor</li>
              <li>Koordiniert gemeinsam eure ersten Termine</li>
              <li>Viel Erfolg beim Lernen! 🎯</li>
            </ol>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>Bei Fragen oder Problemen kannst du dich jederzeit an unser Support-Team wenden.</p>
            <p style="margin: 0;"><strong>GruppenSchlau Team</strong></p>
          </div>
        </body>
        </html>
      `;

      return resend.emails.send({
        from: "GruppenSchlau <noreply@resend.dev>",
        to: [member.email],
        subject: `🎉 Deine Nachhilfegruppe für ${groupData.klassenstufe} ist bereit!`,
        html: emailHtml,
      });
    });

    const emailResults = await Promise.allSettled(emailPromises);
    
    // Log results
    const successful = emailResults.filter(result => result.status === 'fulfilled').length;
    const failed = emailResults.filter(result => result.status === 'rejected').length;
    
    console.log(`Emails sent: ${successful} successful, ${failed} failed`);

    if (failed > 0) {
      console.error('Some emails failed to send:', 
        emailResults
          .filter(result => result.status === 'rejected')
          .map(result => (result as PromiseRejectedResult).reason)
      );
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent: successful,
      emailsFailed: failed 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-group-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
