"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

interface FichaDetalheModalProps {
  open: boolean;
  onClose: () => void;
  fichaId: number | null;
}

interface FichaDetalhe {
  id: number;
  colaborador_matricula: string;
  data_entrega: string;
  assinatura?: string;
  epi: {
    nome: string;
    ca: string;
  };
}

export default function FichaDetalheModal({ open, onClose, fichaId }: FichaDetalheModalProps) {
  const [detalhe, setDetalhe] = useState<FichaDetalhe | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDetalhe = async () => {
    if (!fichaId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/detalhe_ficha?id=${fichaId}`);
      const data = await res.json();
      setDetalhe(data);
    } catch (error) {
      console.error("Erro ao buscar detalhe da ficha:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && fichaId) {
      fetchDetalhe();
    }
  }, [open, fichaId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image src="/assets/logo.png" alt="Logo da Empresa" width={50} height={50} />
              <DialogTitle className="ml-4">Detalhes da Ficha</DialogTitle>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="text-sm text-gray-700">
                Por favor, verifique os dados abaixo e solicite a assinatura digital do colaborador.
              </p>
            </div>
          </div>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center">Carregando...</div>
        ) : detalhe ? (
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>EPI Descrição</TableHead>
                  <TableHead>N° do CA</TableHead>
                  <TableHead>Data de Entrega</TableHead>
                  <TableHead>Assinatura do Empregado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{detalhe.epi.nome}</TableCell>
                  <TableCell>{detalhe.epi.ca}</TableCell>
                  <TableCell>{new Date(detalhe.data_entrega).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {detalhe.assinatura ? (
                      <img src={detalhe.assinatura} alt="Assinatura" className="w-32" />
                    ) : (
                      "Não assinada"
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center">Nenhum detalhe encontrado.</div>
        )}
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
