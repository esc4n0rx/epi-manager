import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

  
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas nas variáveis de ambiente.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from("epi_colaborador").select("*");

    if (error) {
      console.error("Erro ao buscar colaboradores:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro inesperado na rota GET de colaborador:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome_completo, cpf, matricula, cargo, setor } = body;

    if (!nome_completo || !cpf || !matricula || !cargo || !setor) {
      console.error("Campos obrigatórios não informados", { nome_completo, cpf, matricula, cargo, setor });
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("epi_colaborador")
      .insert([{ nome_completo, cpf, matricula, cargo, setor }]);

    if (error) {
      console.error("Erro ao salvar colaborador:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Erro inesperado na rota POST de colaborador:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
