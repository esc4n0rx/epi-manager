"use client";

import { useState, useEffect } from "react";
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
import { Search, UserPlus } from "lucide-react";
import { NovoColaboradorModal } from "@/components/modals/novo-colaborador-modal";

interface Colaborador {
  id: number;
  nome_completo: string;
  cpf: string;
  matricula: string;
  cargo: string;
  setor: string;
}

export default function ColaboradoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const fetchColaboradores = async () => {
    const res = await fetch("/api/colaborador");
    const json = await res.json();
    console.log("Resposta da API:", json);
    
    const data = Array.isArray(json) 
      ? json 
      : json.data && Array.isArray(json.data) 
        ? json.data 
        : [];
    
    setColaboradores(data);
  };

  return (
    <div className="h-full p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Colaboradores</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar colaboradores..." className="pl-8" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CPF</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Setor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {colaboradores.map((colaborador) => (
            <TableRow key={colaborador.id}>
              <TableCell>{colaborador.nome_completo}</TableCell>
              <TableCell>{colaborador.cpf}</TableCell>
              <TableCell>{colaborador.matricula}</TableCell>
              <TableCell>{colaborador.cargo}</TableCell>
              <TableCell>{colaborador.setor}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NovoColaboradorModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            // Atualiza a lista ao fechar o modal, caso um novo colaborador tenha sido adicionado
            fetchColaboradores();
          }
        }}
      />
    </div>
  );
}
