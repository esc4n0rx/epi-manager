"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, FileCheck, Users } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface DashboardData {
  totalFichas: number;
  percentDiffMonth: string;
  fichasToday: number;
  diffToday: number;
  totalColaboradores: number;
  diffColab: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      }
    }
    fetchDashboard();
  }, []);

  if (!data) {
    return <div>Carregando dados do dashboard...</div>;
  }

  return (
    <div className="h-full px-4 py-6 lg:px-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-3 lg:grid-cols-3"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Fichas
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalFichas}</div>
              <p className="text-xs text-muted-foreground">
                {data.percentDiffMonth}% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fichas Geradas Hoje
              </CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.fichasToday}</div>
              <p className="text-xs text-muted-foreground">
                {data.diffToday > 0 ? `+${data.diffToday}` : data.diffToday} em relação a ontem
              </p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Colaboradores
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalColaboradores}</div>
              <p className="text-xs text-muted-foreground">
                {data.diffColab > 0 ? `+${data.diffColab}` : data.diffColab} novos esta semana
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
