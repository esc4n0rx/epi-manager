"use client";

import { useState } from "react";
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

interface NovoEPIModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoEPIModal({ open, onOpenChange }: NovoEPIModalProps) {
  const [nome, setNome] = useState("");
  const [ca, setCa] = useState("");
  const [validade, setValidade] = useState("");
  const [estoque, setEstoque] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome || !ca || !validade || estoque === "") {
      console.error("Todos os campos são obrigatórios.");
      return;
    }

    const payload = {
      nome,
      ca,
      validade: Number(validade),
      estoque: Number(estoque),
    };

    try {
      const res = await fetch("/api/epi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Limpa os campos e fecha o modal
        setNome("");
        setCa("");
        setValidade("");
        setEstoque("");
        onOpenChange(false);
      } else {
        console.error("Erro ao salvar EPI");
      }
    } catch (error) {
      console.error("Erro ao salvar EPI:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo EPI</DialogTitle>
          <DialogDescription>
            Cadastre um novo Equipamento de Proteção Individual
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nome do EPI</Label>
              <Input
                placeholder="Nome do EPI"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Número do CA</Label>
              <Input
                placeholder="Certificado de Aprovação"
                value={ca}
                onChange={(e) => setCa(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Validade</Label>
              <Select value={validade} onValueChange={setValidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a validade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                  <SelectItem value="24">24 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantidade em Estoque</Label>
              <Input
                type="number"
                placeholder="0"
                value={estoque}
                onChange={(e) => setEstoque(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
