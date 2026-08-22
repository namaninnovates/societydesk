import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rbhlhoyxbfaqkpkashod.supabase.co";
const supabaseKey = "sb_publishable_04Wjw-28fnuucMa7ke6ENA_ygHu_Aha";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const email = "admin@societydesk.com";
  const password = "SocietyDesk@2026!";

  console.log("Checking sign-in for admin@societydesk.com...");
  const s = await supabase.auth.signInWithPassword({ email, password });

  if (s.error) {
    console.log("Sign-in failed:", s.error.message, "- registering admin user...");
    const reg = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: "Society Administrator",
          unit_number: "OFFICE-101",
          block: "Clubhouse",
          phone: "+91 98765 43210",
        },
      },
    });

    console.log("Sign-up result:", reg.data?.user?.id, reg.error?.message);

    if (reg.data?.user) {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", reg.data.user.id);
      console.log("Updated role to admin:", pErr ? pErr.message : "Success");
    }
  } else {
    console.log("Admin user exists! ID:", s.data.user.id);
    const { error: pErr } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", s.data.user.id);
    console.log("Ensured role is admin:", pErr ? pErr.message : "Success");
    const { data: p } = await supabase.from("profiles").select("*").eq("id", s.data.user.id).single();
    console.log("Admin Profile:", p);
  }
}

run().catch(console.error);
