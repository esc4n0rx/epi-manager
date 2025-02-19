// app/api/ficha/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Recupera as variáveis de ambiente do lado do servidor
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas nas variáveis de ambiente.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET: Retorna todas as fichas (fazendo um join opcional com a tabela epi para obter dados como o CA)
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ficha")
      .select("*, epi (ca, nome)");
      
    if (error) {
      console.error("Erro ao buscar fichas:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro inesperado na rota GET de ficha:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Cria uma nova ficha
export async function POST(request: Request) {
    try {
      const body = await request.json();
      const { matricula, epi_id, quantidade, data_entrega } = body;
      
      if (!matricula || !epi_id || !quantidade || !data_entrega) {
        return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
      }
      
      // Use .select() para retornar o registro inserido
      const { data, error } = await supabase
        .from("ficha")
        .insert([{ 
           colaborador_matricula: matricula,
           epi_id,
           quantidade,
           data_entrega
        }])
        .select();
      
      if (error) {
        console.error("Erro ao salvar ficha:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
      console.error("Erro inesperado na rota POST de ficha:", err);
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
  