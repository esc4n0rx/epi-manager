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
import { ClipboardCopy } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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
  const [success, setSuccess] = useState(false);
  const [fichaLink, setFichaLink] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleMatriculaKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && matricula) {
      e.preventDefault();
      try {
        const res = await fetch("/api/colaborador");
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (colab: any) => colab.matricula === matricula
          );
          if (filtered.length > 0) {
            setColaboradorNome(filtered[0].nome_completo);
          } else {
            setColaboradorNome("Colaborador não encontrado");
          }
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
          const link = `${window.location.origin}/fichas/${fichaCriada[0].id}`;
          setFichaLink(link);
          setSuccess(true);
          // Opcional: deixar a mensagem exibida por alguns segundos
          setTimeout(() => {
            onOpenChange(false);
            setSuccess(false);
          }, 3000);
        } else {
          console.error("Nenhuma ficha foi retornada.");
        }
        // Limpa os campos
        setMatricula("");
        setColaboradorNome("");
        setEpiId("");
        setQuantidade("");
        setDataEntrega("");
      } else {
        console.error("Erro ao gerar ficha");
      }
    } catch (error) {
      console.error("Erro ao gerar ficha:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fichaLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar para a área de transferência:", error);
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
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <div className="text-2xl font-bold text-green-600 mb-4">
              Ficha gerada com sucesso!
            </div>
            <div className="w-full flex items-center space-x-2">
              <Input readOnly value={fichaLink} className="w-full" />
              <Button onClick={copyToClipboard} variant="outline">
                <ClipboardCopy className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <div className="text-sm text-green-600 mt-2">
                Link copiado para a área de transferência!
              </div>
            )}
          </motion.div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
