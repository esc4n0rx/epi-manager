
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

interface LogEntry {
  data: string;
  tipo: string;
  usuario: string;
  descricao: string;
  status: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("As credenciais do Supabase não estão definidas.");
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function GET() {
  try {
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);

    const logs: LogEntry[] = [];

    const { data: colabData, error: colabError } = await supabase
      .from("epi_colaborador")
      .select("nome_completo, cpf, matricula, cargo, created_at")
      .gte("created_at", startToday.toISOString())
      .lt("created_at", endToday.toISOString());
    if (colabError) throw colabError;
    if (colabData && Array.isArray(colabData)) {
      const colabLogs = colabData.map((colab) => ({
        data: colab.created_at,
        tipo: "Novo Usuário Adicionado",
        usuario: colab.nome_completo,
        descricao: `CPF: ${colab.cpf}, Matrícula: ${colab.matricula}, Cargo: ${colab.cargo}`,
        status: "Concluído",
      }));
      logs.push(...colabLogs);
    }

    const { data: fichaData, error: fichaError } = await supabase
      .from("ficha")
      .select("colaborador_matricula, quantidade, status, created_at")
      .gte("created_at", startToday.toISOString())
      .lt("created_at", endToday.toISOString());
    if (fichaError) throw fichaError;
    if (fichaData && Array.isArray(fichaData)) {
      const fichaLogs = fichaData.map((ficha) => ({
        data: ficha.created_at,
        tipo: "Nova Ficha Gerada",
        usuario: ficha.colaborador_matricula,
        descricao: `Ficha criada com quantidade: ${ficha.quantidade}, Status: ${ficha.status}`,
        status: ficha.status || "Pendente",
      }));
      logs.push(...fichaLogs);
    }

    const { data: epiData, error: epiError } = await supabase
      .from("epi")
      .select("nome, ca, validade, estoque, created_at")
      .gte("created_at", startToday.toISOString())
      .lt("created_at", endToday.toISOString());
    if (epiError) throw epiError;
    if (epiData && Array.isArray(epiData)) {
      const epiLogs = epiData.map((epi) => ({
        data: epi.created_at,
        tipo: "Novo EPI Cadastrado",
        usuario: "Admin",
        descricao: `EPI: ${epi.nome} (CA: ${epi.ca}) - Validade: ${epi.validade} meses, Estoque: ${epi.estoque}`,
        status: "Concluído",
      }));
      logs.push(...epiLogs);
    }

    logs.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("Erro no endpoint de registros:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
