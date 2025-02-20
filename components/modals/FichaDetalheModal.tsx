"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
    validade: number;
    estoque: number;
  };
}

interface Colaborador {
  nome_completo: string;
  cpf: string;
  cargo: string;
  matricula: string;
}

export default function FichaDetalheModal({ open, onClose, fichaId }: FichaDetalheModalProps) {
  const [detalhe, setDetalhe] = useState<FichaDetalhe | null>(null);
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
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

  const fetchColaborador = async (matricula: string) => {
    try {
      const res = await fetch("/api/colaborador");
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter((col: any) => col.matricula === matricula);
        if (filtered.length > 0) {
          setColaborador({
            nome_completo: filtered[0].nome_completo,
            cpf: filtered[0].cpf,
            cargo: filtered[0].cargo,
            matricula: filtered[0].matricula,
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar colaborador:", error);
    }
  };

  useEffect(() => {
    if (open && fichaId) {
      fetchDetalhe();
    }
  }, [open, fichaId]);

  useEffect(() => {
    if (detalhe && detalhe.colaborador_matricula) {
      fetchColaborador(detalhe.colaborador_matricula);
    }
  }, [detalhe]);

  const handleGeneratePDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ficha_${fichaId}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <div id="pdf-content">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Image src="/assets/logo.png" alt="Logo da Empresa" width={50} height={50} />
                <DialogTitle className="ml-4">Detalhes da Ficha</DialogTitle>
              </div>
              <div className="bg-gray-100 p-2 rounded max-w-md">
                <p className="text-sm text-gray-700">
                  DECLARO QUE RECEBI ORIENTAÇÃO SOBRE O USO CORRETO DOS EPIS DE ACORDO COM OS RISCOS OCUPACIONAIS DA MINHA ATIVIDADE, FORNECIDO GRATUITAMENTE PELA EMPRESA E QUE ESTOU CIENTE DA LEGISLAÇÃO ABAIXO DISCRIMINADA, COMPROMETENDO-ME A CUMPRIR.
                  {/* Insira aqui os detalhes da legislação */}
                </p>
              </div>
            </div>
          </DialogHeader>
          {loading ? (
            <div className="py-8 text-center">Carregando...</div>
          ) : detalhe ? (
            <div className="py-4">
              {/* Informações do Colaborador */}
              <div className="mb-4 border p-4 rounded bg-white">
                <h2 className="text-lg font-bold mb-2">Informações do Colaborador</h2>
                {colaborador ? (
                  <div className="space-y-1">
                    <p><strong>Nome:</strong> {colaborador.nome_completo}</p>
                    <p><strong>Matrícula:</strong> {colaborador.matricula}</p>
                    <p><strong>CPF:</strong> {colaborador.cpf}</p>
                    <p><strong>Cargo:</strong> {colaborador.cargo}</p>
                  </div>
                ) : (
                  <p>Carregando informações do colaborador...</p>
                )}
              </div>
              {/* Tabela com dados da ficha */}
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
                    <TableCell className="bg-white">
                      {detalhe.assinatura ? (
                        <img src={detalhe.assinatura} alt="Assinatura" className="w-32 bg-white" />
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
        </div>
        <DialogFooter className="flex justify-between">
          <Button onClick={onClose}>Fechar</Button>
          <Button onClick={handleGeneratePDF}>Gerar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
