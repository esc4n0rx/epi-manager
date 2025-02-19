// app/api/ficha/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Recupera as variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas.");
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: Retorna a ficha específica, com dados do EPI (faz join com tabela epi)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("ficha")
      .select("*, epi (nome, ca, validade, estoque)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Erro ao buscar ficha:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro inesperado na rota GET de ficha:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Atualiza a ficha com a assinatura e altera o status para "Concluido"
// Além disso, atualiza a assinatura na tabela epi_colaborador do colaborador correspondente (usando a matrícula)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { assinatura } = body;
    if (!assinatura) {
      return NextResponse.json({ error: "Assinatura é obrigatória." }, { status: 400 });
    }

    // Atualiza a ficha: define a assinatura e altera o status para "Concluido"
    const { data: fichaData, error: fichaError } = await supabase
      .from("ficha")
      .update({ assinatura, status: "Concluido" })
      .eq("id", id)
      .select()
      .single();

    if (fichaError) {
      console.error("Erro ao atualizar ficha:", fichaError);
      return NextResponse.json({ error: fichaError.message }, { status: 500 });
    }

    // Atualiza a assinatura do colaborador na tabela epi_colaborador, usando a matrícula registrada na ficha
    const { colaborador_matricula } = fichaData;
    const { error: colabError } = await supabase
      .from("epi_colaborador")
      .update({ assinatura })
      .eq("matricula", colaborador_matricula);

    if (colabError) {
      console.error("Erro ao atualizar colaborador:", colabError);
      return NextResponse.json({ error: colabError.message }, { status: 500 });
    }

    return NextResponse.json(fichaData, { status: 200 });
  } catch (err: any) {
    console.error("Erro inesperado na rota PUT de ficha:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
