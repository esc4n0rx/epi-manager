"use client";

import { useEffect, useState } from "react";
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
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LogEntry {
  data: string;
  tipo: string;
  usuario: string;
  descricao: string;
  status: string;
}

export default function RegistrosPage() {
  const [registros, setRegistros] = useState<LogEntry[]>([]);
  const [search, setSearch] = useState("");

  const fetchRegistros = async () => {
    try {
      const res = await fetch("/api/registros");
      const data = await res.json();
      setRegistros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar registros:", error);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const filteredRegistros = registros.filter(
    (reg) =>
      reg.descricao.toLowerCase().includes(search.toLowerCase()) ||
      reg.tipo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registros</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar registros..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRegistros.map((reg) => (
            <TableRow key={`${reg.tipo}-${reg.data}`}>
              <TableCell>{new Date(reg.data).toLocaleString()}</TableCell>
              <TableCell>
                <Badge>{reg.tipo}</Badge>
              </TableCell>
              <TableCell>{reg.usuario}</TableCell>
              <TableCell>{reg.descricao}</TableCell>
              <TableCell>
                <Badge variant="secondary">{reg.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
