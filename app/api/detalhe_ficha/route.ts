// app/api/detalhe_ficha/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas.");
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "ID da ficha não fornecido." },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("ficha")
      .select(
        "*, epi (nome, ca, validade, estoque), epi_colaborador (nome_completo, cpf, cargo, matricula)"
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar detalhe da ficha:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro inesperado na rota GET de detalhe da ficha:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
