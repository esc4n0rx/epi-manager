import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

if (process.env.NODE_ENV !== 'production') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas nas variáveis de ambiente.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from("epi").select("*");
    if (error) {
      console.error("Erro ao buscar EPIs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Erro inesperado na rota GET de EPIs:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, ca, validade, estoque } = body;
    console.log("Recebido no POST de EPI:", { nome, ca, validade, estoque });

    if (!nome || !ca || !validade || estoque === undefined) {
      console.error("Campos obrigatórios não informados", { nome, ca, validade, estoque });
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("epi")
      .insert([{ nome, ca, validade, estoque }]);
    console.log("Resultado da inserção:", { data, error });

    if (error) {
      console.error("Erro ao salvar EPI:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    console.error("Erro inesperado na rota POST de EPI:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
