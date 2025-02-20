"use client";
import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
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
  const contentRef = useRef<HTMLDivElement>(null);

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

      const clone = element.cloneNode(true) as HTMLElement;
      
      clone.style.width = "800px";
      clone.style.padding = "20px";
      clone.style.backgroundColor = "white";
      
      document.body.appendChild(clone);
      clone.style.position = "absolute";
      clone.style.left = "-9999px";
      
      const canvas = await html2canvas(clone, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      document.body.removeChild(clone);
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`ficha_epi_${colaborador?.nome_completo || fichaId}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <div id="pdf-content" ref={contentRef} className="bg-white">
          <DialogHeader className="border-b pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Image src="/assets/logo.png" alt="Logo da Empresa" width={80} height={80} />
                <DialogTitle className="ml-4 text-xl font-bold text-black">Detalhes da Ficha</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          <div className="p-4 bg-white border mb-6 rounded-md">
            <p className="text-sm leading-relaxed font-semibold text-black">
              DECLARO QUE RECEBI ORIENTAÇÃO SOBRE O USO CORRETO DOS EPIS DE ACORDO COM OS RISCOS
              OCUPACIONAIS DA MINHA ATIVIDADE, FORNECIDO GRATUITAMENTE PELA EMPRESA E QUE ESTOU CIENTE
              DA LEGISLAÇÃO ABAIXO DISCRIMINADA, COMPROMETENDO-ME A CUMPRIR.
            </p>
          </div>
          
          {loading ? (
            <div className="py-8 text-center">Carregando...</div>
          ) : detalhe ? (
            <div className="py-4">
              <div className="mb-6 border p-5 rounded-md bg-white">
                <h2 className="text-xl font-bold mb-3 text-black">Informações do Colaborador</h2>
                {colaborador ? (
                  <div className="grid grid-cols-2 gap-3 text-black">
                    <div>
                      <p className="mb-2"><span className="font-bold">Nome:</span> {colaborador.nome_completo}</p>
                      <p className="mb-2"><span className="font-bold">Matrícula:</span> {colaborador.matricula}</p>
                    </div>
                    <div>
                      <p className="mb-2"><span className="font-bold">CPF:</span> {colaborador.cpf}</p>
                      <p className="mb-2"><span className="font-bold">Cargo:</span> {colaborador.cargo}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-black">Carregando informações do colaborador...</p>
                )}
              </div>

              <div className="overflow-hidden border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold text-black py-3">EPI Descrição</TableHead>
                      <TableHead className="font-bold text-black py-3">N° do CA</TableHead>
                      <TableHead className="font-bold text-black py-3">Data de Entrega</TableHead>
                      <TableHead className="font-bold text-black py-3">Assinatura do Empregado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="py-4 text-lg font-bold text-black">{detalhe.epi.nome}</TableCell>
                      <TableCell className="py-4 text-lg font-bold text-black">{detalhe.epi.ca}</TableCell>
                      <TableCell className="py-4 text-lg font-bold text-black">{new Date(detalhe.data_entrega).toLocaleDateString()}</TableCell>
                      <TableCell className="bg-white border p-4 min-h-24">
                        {detalhe.assinatura ? (
                          <div className="bg-white p-2 border min-h-24 flex items-center justify-center">
                            <img 
                              src={detalhe.assinatura} 
                              alt="Assinatura" 
                              className="max-w-48 max-h-24 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="bg-white p-2 border min-h-24 flex items-center justify-center">
                            Não assinada
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-8 text-sm text-gray-600">
                <p>A NR-6 preconiza que o equipamento de proteção individual é todo dispositivo ou produto, de uso individual utilizado pelo trabalhador, 
                destinado à proteção de riscos suscetíveis de ameaçar a segurança e a saúde no trabalho.</p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">Nenhum detalhe encontrado.</div>
          )}
        </div>
        <DialogFooter className="flex justify-between mt-6">
          <Button onClick={onClose} variant="outline">Fechar</Button>
          <Button onClick={handleGeneratePDF} className="bg-blue-600 hover:bg-blue-700">Gerar PDF</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}