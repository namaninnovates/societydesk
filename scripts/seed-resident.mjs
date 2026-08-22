import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rbhlhoyxbfaqkpkashod.supabase.co";
const supabaseKey = "sb_publishable_04Wjw-28fnuucMa7ke6ENA_ygHu_Aha";
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // 1. Seed Resident
  const resEmail = "resident@societydesk.com";
  const resPass = "Resident@2026!";
  console.log("Checking resident user...");
  const sRes = await supabase.auth.signUp({
    email: resEmail,
    password: resPass,
    options: {
      data: {
        full_name: "Rahul Sharma",
        unit_number: "B-1204",
        block: "Tower B",
        phone: "+91 98765 12345",
      },
    },
  });
  console.log("Resident signup:", sRes.data?.user?.id, sRes.error?.message);
}

seed().catch(console.error);
