"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SignaturePad from "@/components/SignaturePad";
import SignatureCanvas from "react-signature-canvas";

interface Ficha {
  colaborador_matricula: string;
  epi?: {
    nome: string;
    ca: string;
  };
  quantidade: number;
  data_entrega: string;
  status: string;
  assinatura?: string;
}

export default function FichaPage() {
  const { id } = useParams();
  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [assinatura, setAssinatura] = useState("");
  const [loading, setLoading] = useState(false);
  const signaturePadRef = useRef<SignatureCanvas>(null);

  // Busca os dados da ficha
  const fetchFicha = async () => {
    try {
      const res = await fetch(`/api/ficha/${id}`);
      const data = await res.json();
      setFicha(data);
    } catch (error) {
      console.error("Erro ao buscar a ficha:", error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFicha();
    }
  }, [id]);

  const handleAssinar = async () => {
    if (signaturePadRef.current) {
      const dataURL = signaturePadRef.current.toDataURL("image/png");
      setAssinatura(dataURL);
      setLoading(true);
      try {
        const res = await fetch(`/api/ficha/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assinatura: dataURL }),
        });
        if (res.ok) {
          alert("Ficha assinada com sucesso!");
          fetchFicha();
        } else {
          alert("Erro ao salvar a assinatura.");
        }
      } catch (error) {
        console.error("Erro na assinatura:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const limparAssinatura = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  if (!ficha) {
    return <div>Carregando ficha...</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ficha de EPI</h1>
      <div className="border p-4 rounded mb-4">
        <p>
          <strong>Colaborador:</strong> {ficha.colaborador_matricula}
        </p>
        <p>
          <strong>EPI:</strong> {ficha.epi?.nome} (CA: {ficha.epi?.ca})
        </p>
        <p>
          <strong>Quantidade:</strong> {ficha.quantidade}
        </p>
        <p>
          <strong>Data de Entrega:</strong>{" "}
          {new Date(ficha.data_entrega).toLocaleDateString()}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <Badge variant="secondary">{ficha.status}</Badge>
        </p>
      </div>

      {ficha.status !== "Concluido" && (
        <>
          <h2 className="text-xl font-semibold mb-2">Assine aqui:</h2>
          <div className="border p-2 mb-4">
            <SignaturePad
              ref={signaturePadRef}
              canvasProps={{
                className: "w-full h-64 sm:h-80",
                style: { backgroundColor: "white" },
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAssinar} disabled={loading}>
              {loading ? "Salvando assinatura..." : "Assinar"}
            </Button>
            <Button variant="outline" onClick={limparAssinatura}>
              Limpar
            </Button>
          </div>
        </>
      )}

      {ficha.status === "Concluido" && (
        <p className="text-green-600 font-bold mt-4">
          Ficha concluída e assinada.
        </p>
      )}
    </div>
  );
}