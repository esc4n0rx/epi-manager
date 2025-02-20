import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas.");
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("epi_perfil")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Erro ao buscar perfil:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro inesperado na rota GET de perfil:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, email, cargo, avatar } = body;

    if (!nome || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from("epi_perfil")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Erro ao buscar perfil:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    let response;
    if (existing) {

      const { data, error } = await supabase
        .from("epi_perfil")
        .update({ nome, cargo, avatar })
        .eq("email", email)
        .select()
        .single();
      response = { data, action: "updated" };
      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {

      const { data, error } = await supabase
        .from("epi_perfil")
        .insert([{ nome, email, cargo, avatar }])
        .select()
        .single();
      response = { data, action: "created" };
      if (error) {
        console.error("Erro ao criar perfil:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json(response.data, { status: 201 });
  } catch (err: any) {
    console.error("Erro inesperado na rota POST de perfil:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
