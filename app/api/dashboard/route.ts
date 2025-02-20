
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
    const now = new Date();

    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);

    const startYesterday = new Date(startToday);
    startYesterday.setDate(startYesterday.getDate() - 1);
    const endYesterday = new Date(startToday);

    const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dayOfWeek = now.getDay();
    const startCurrentWeek = new Date(now);
    startCurrentWeek.setDate(now.getDate() - dayOfWeek);
    startCurrentWeek.setHours(0, 0, 0, 0);
    const endCurrentWeek = new Date(startCurrentWeek);
    endCurrentWeek.setDate(endCurrentWeek.getDate() + 7);
    const startLastWeek = new Date(startCurrentWeek);
    startLastWeek.setDate(startLastWeek.getDate() - 7);
    const endLastWeek = new Date(startCurrentWeek);

    const { count: totalFichas, error: totalFichasError } = await supabase
      .from("ficha")
      .select("*", { count: "exact", head: true });
    if (totalFichasError) throw totalFichasError;

    const { count: currentMonthFichas, error: currentMonthError } = await supabase
      .from("ficha")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startCurrentMonth.toISOString())
      .lt("created_at", endCurrentMonth.toISOString());
    if (currentMonthError) throw currentMonthError;

    const { count: previousMonthFichas, error: previousMonthError } = await supabase
      .from("ficha")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startPreviousMonth.toISOString())
      .lt("created_at", endPreviousMonth.toISOString());
    if (previousMonthError) throw previousMonthError;

    const { count: fichasToday, error: fichasTodayError } = await supabase
      .from("ficha")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startToday.toISOString())
      .lt("created_at", endToday.toISOString());
    if (fichasTodayError) throw fichasTodayError;

    const { count: fichasYesterday, error: fichasYesterdayError } = await supabase
      .from("ficha")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startYesterday.toISOString())
      .lt("created_at", endYesterday.toISOString());
    if (fichasYesterdayError) throw fichasYesterdayError;

    const { count: totalColaboradores, error: totalColaboradoresError } = await supabase
      .from("epi_colaborador")
      .select("*", { count: "exact", head: true });
    if (totalColaboradoresError) throw totalColaboradoresError;

    const { count: colabThisWeek, error: colabThisWeekError } = await supabase
      .from("epi_colaborador")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startCurrentWeek.toISOString())
      .lt("created_at", endCurrentWeek.toISOString());
    if (colabThisWeekError) throw colabThisWeekError;

    const { count: colabLastWeek, error: colabLastWeekError } = await supabase
      .from("epi_colaborador")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startLastWeek.toISOString())
      .lt("created_at", endLastWeek.toISOString());
    if (colabLastWeekError) throw colabLastWeekError;

    const totalFichasNum = totalFichas ?? 0;
    const currentMonthFichasNum = currentMonthFichas ?? 0;
    const previousMonthFichasNum = previousMonthFichas ?? 0;
    const fichasTodayNum = fichasToday ?? 0;
    const fichasYesterdayNum = fichasYesterday ?? 0;
    const totalColaboradoresNum = totalColaboradores ?? 0;
    const colabThisWeekNum = colabThisWeek ?? 0;
    const colabLastWeekNum = colabLastWeek ?? 0;

    const percentDiffMonth =
      previousMonthFichasNum > 0
        ? (((currentMonthFichasNum - previousMonthFichasNum) / previousMonthFichasNum) * 100).toFixed(0)
        : "0";
    const diffToday = fichasTodayNum - fichasYesterdayNum;
    const diffColab = colabThisWeekNum - colabLastWeekNum;

    return NextResponse.json({
      totalFichas: totalFichasNum,
      currentMonthFichas: currentMonthFichasNum,
      previousMonthFichas: previousMonthFichasNum,
      percentDiffMonth,
      fichasToday: fichasTodayNum,
      fichasYesterday: fichasYesterdayNum,
      diffToday,
      totalColaboradores: totalColaboradoresNum,
      colabThisWeek: colabThisWeekNum,
      colabLastWeek: colabLastWeekNum,
      diffColab,
    });
  } catch (error: any) {
    console.error("Erro no dashboard:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
