import { createClient }
from "@supabase/supabase-js";

const supabaseUrl =
"https://ashhsxsibghgnnnbviyb.supabase.co";

const supabaseKey =
"sb_publishable_ac521Cn1G8o4WPMp1itl5A_Ui1JWwuj";

export const supabase =
createClient(
  supabaseUrl,
  supabaseKey
);