"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NovaFichaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaFichaModal({ open, onOpenChange }: NovaFichaModalProps) {
  const [matricula, setMatricula] = useState("");
  const [colaboradorNome, setColaboradorNome] = useState("");
  const [epiId, setEpiId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [epiOptions, setEpiOptions] = useState<any[]>([]);

  // Busca os EPIs disponíveis
  useEffect(() => {
    const fetchEPIs = async () => {
      try {
        const res = await fetch("/api/epi");
        const data = await res.json();
        if (Array.isArray(data)) {
          setEpiOptions(data);
        }
      } catch (error) {
        console.error("Erro ao buscar EPIs:", error);
      }
    };

    fetchEPIs();
  }, []);

  // Ao pressionar Enter na matrícula, busca o nome do colaborador via API
  const handleMatriculaKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matricula) {
      e.preventDefault(); // Evita o submit do formulário
      try {
        const res = await fetch(`/api/colaborador?matricula=${matricula}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setColaboradorNome(data[0].nome_completo);
        } else {
          setColaboradorNome("Colaborador não encontrado");
        }
      } catch (error) {
        console.error("Erro ao buscar colaborador:", error);
        setColaboradorNome("Erro ao buscar colaborador");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula || !epiId || !quantidade || !dataEntrega) {
      console.error("Todos os campos são obrigatórios.");
      return;
    }
    const payload = {
      matricula,
      epi_id: Number(epiId),
      quantidade: Number(quantidade),
      data_entrega: dataEntrega,
    };
  
    try {
      const res = await fetch("/api/ficha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const fichaCriada = await res.json();
        if (Array.isArray(fichaCriada) && fichaCriada.length > 0) {
          const fichaLink = `${window.location.origin}/fichas/${fichaCriada[0].id}`;
          alert(`Ficha gerada com sucesso! Acesse: ${fichaLink}`);
        } else {
          console.error("Nenhuma ficha foi retornada.");
        }
        setMatricula("");
        setColaboradorNome("");
        setEpiId("");
        setQuantidade("");
        setDataEntrega("");
        onOpenChange(false);
      } else {
        console.error("Erro ao gerar ficha");
      }
    } catch (error) {
      console.error("Erro ao gerar ficha:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Ficha de EPI</DialogTitle>
          <DialogDescription>
            Preencha os dados para gerar uma nova ficha de EPI
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Matrícula do Colaborador</Label>
              <Input
                placeholder="Digite a matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                onKeyDown={handleMatriculaKeyDown}
              />
            </div>
            {colaboradorNome && (
              <div className="space-y-2">
                <Label>Nome do Colaborador</Label>
                <Input value={colaboradorNome} readOnly />
              </div>
            )}
            <div className="space-y-2">
              <Label>EPIs</Label>
              <Select value={epiId} onValueChange={setEpiId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o EPI" />
                </SelectTrigger>
                <SelectContent>
                  {epiOptions.map((epi) => (
                    <SelectItem key={epi.id} value={epi.id.toString()}>
                      {epi.nome} (CA: {epi.ca}) - {epi.validade} meses - Estoque: {epi.estoque}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade</Label>
              <Input
                type="number"
                placeholder="Quantidade"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Entrega</Label>
              <Input
                type="date"
                value={dataEntrega}
                onChange={(e) => setDataEntrega(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Gerar Ficha</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
