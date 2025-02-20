"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { NovoEPIModal } from "@/components/modals/novo-epi-modal";
import { useState, useEffect } from "react";

interface EPI {
  id: number;
  nome: string;
  ca: string;
  validade: number;
  estoque: number;
}

export default function EPIsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [epis, setEpis] = useState<EPI[]>([]);

  const fetchEPIs = async () => {
    try {
      const res = await fetch("/api/epi");
      const data = await res.json();
      setEpis(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar EPIs:", error);
    }
  };

  useEffect(() => {
    fetchEPIs();
  }, []);

  return (
    <div className="h-full p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EPIs</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo EPI
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar EPIs..." className="pl-8" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CA</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {epis.map((epi) => (
            <TableRow key={epi.id}>
              <TableCell>{epi.nome}</TableCell>
              <TableCell>{epi.ca}</TableCell>
              <TableCell>{epi.validade} meses</TableCell>
              <TableCell>{epi.estoque}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NovoEPIModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            fetchEPIs();
          }
        }}
      />
    </div>
  );
}
