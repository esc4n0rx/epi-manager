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
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { NovaFichaModal } from "@/components/modals/nova-ficha-modal";
import { useState, useEffect } from "react";
import FichaDetalheModal from "@/components/modals/FichaDetalheModal";

export default function FichasPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fichas, setFichas] = useState<any[]>([]);
  const [selectedFichaId, setSelectedFichaId] = useState<number | null>(null);
  const [isDetalheOpen, setIsDetalheOpen] = useState(false);

  const fetchFichas = async () => {
    try {
      const res = await fetch("/api/ficha");
      const data = await res.json();
      setFichas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar fichas:", error);
    }
  };

  useEffect(() => {
    fetchFichas();
  }, []);

  const handleVisualizar = (id: number) => {
    setSelectedFichaId(id);
    setIsDetalheOpen(true);
  };

  return (
    <div className="h-full p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Fichas de EPI</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ficha
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar fichas..." className="pl-8" />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Colaborador</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fichas.map((ficha) => (
            <TableRow key={ficha.id}>
              <TableCell>{`F00${ficha.id}`}</TableCell>
              <TableCell>{ficha.colaborador_matricula}</TableCell>
              <TableCell>{new Date(ficha.data_entrega).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="secondary">{ficha.status}</Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVisualizar(ficha.id)}
                >
                  Visualizar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <NovaFichaModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            fetchFichas();
          }
        }}
      />

      {selectedFichaId !== null && (
        <FichaDetalheModal
          open={isDetalheOpen}
          onClose={() => setIsDetalheOpen(false)}
          fichaId={selectedFichaId}
        />
      )}
    </div>
  );
}
