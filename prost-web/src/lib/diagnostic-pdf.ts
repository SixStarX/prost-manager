import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DiagnosticoResultado, Veiculo } from './diagnostic-types';

/**
 * Gera o PDF do laudo de diagnóstico (formato coluna estreita, ideal para mobile).
 * Portado do app original "Prost - Diagnóstico".
 */
export function buildDiagnosticPDF(
  resultado: DiagnosticoResultado,
  veiculo: Veiculo,
  queixa: string,
): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [105, 350] });
  const margin = 8;
  const contentWidth = 105 - margin * 2;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('PROST', margin, 16);

  doc.setFontSize(10);
  doc.setTextColor(110, 110, 110);
  doc.setFont('helvetica', 'normal');
  doc.text('Diagnóstico Automotivo', margin, 26);

  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')} | ID: ${Date.now()}`, margin, 31);

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, 34, 105 - margin, 34);

  let section = 1;
  let y = 42;

  // Veículo
  doc.setFontSize(11); doc.setTextColor(0, 0, 0); doc.setFont('helvetica', 'bold');
  doc.text(`${section++}. Dados do Veículo`, margin, y);
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  const vehInfo = doc.splitTextToSize(
    `Veículo: ${veiculo.marca} ${veiculo.modelo} ${veiculo.sub_modelo} ${veiculo.versao}`, contentWidth);
  y += 5; doc.text(vehInfo, margin, y); y += vehInfo.length * 4;
  doc.text(`Chassis: ${veiculo.chassis || 'Não informado'}`, margin, y); y += 4;
  doc.text(`Ano: ${veiculo.ano_fabricacao}/${veiculo.ano_modelo} | Motor: ${veiculo.motor}`, margin, y); y += 4;
  doc.text(`Combustível: ${veiculo.combustivel} | Câmbio: ${veiculo.cambio}`, margin, y); y += 4;
  doc.text(`KM: ${veiculo.quilometragem}`, margin, y); y += 6;

  // Queixa e diagnóstico
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(`${section++}. Queixa e Diagnóstico`, margin, y); y += 6;
  doc.setFontSize(8); doc.setFont('helvetica', 'normal');
  doc.text('Queixa do Cliente:', margin, y); y += 4;
  const splitQueixa = doc.splitTextToSize(queixa, contentWidth);
  doc.text(splitQueixa, margin, y); y += splitQueixa.length * 4 + 4;

  if (resultado.sintomas_identificados?.length) {
    doc.setFont('helvetica', 'bold'); doc.text('Sintomas Detectados:', margin, y); y += 4;
    doc.setFont('helvetica', 'normal');
    const ss = doc.splitTextToSize(`- ${resultado.sintomas_identificados.join(', ')}`, contentWidth);
    doc.text(ss, margin, y); y += ss.length * 4 + 4;
  }

  doc.setFont('helvetica', 'bold'); doc.text('Resumo do Diagnóstico:', margin, y); y += 4;
  doc.setFont('helvetica', 'normal');
  const sr = doc.splitTextToSize(resultado.diagnostico_resumo || '', contentWidth);
  doc.text(sr, margin, y); y += sr.length * 4 + 6;

  // Histórico do modelo
  if (resultado.resumo_modelo) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(`${section++}. Histórico do Modelo`, margin, y); y += 6;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(`Lançamento: ${resultado.resumo_modelo.lancamento}`, margin, y); y += 4;
    doc.text(`Encerramento: ${resultado.resumo_modelo.encerramento}`, margin, y); y += 4;
    if (resultado.resumo_modelo.recalls?.length) {
      const rc = doc.splitTextToSize(`Recalls: ${resultado.resumo_modelo.recalls.join(', ')}`, contentWidth);
      doc.text(rc, margin, y); y += rc.length * 4;
    }
    const cr = doc.splitTextToSize(`Defeitos Crônicos: ${resultado.resumo_modelo.defeitos_cronicos}`, contentWidth);
    doc.text(cr, margin, y); y += cr.length * 4 + 6;
  }

  // Peças
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(`${section++}. Peças Suspeitas`, margin, y); y += 4;
  autoTable(doc, {
    startY: y,
    head: [['Peça', 'Prob.', 'Razão']],
    body: (resultado.pecas || []).map((p) => [p.nome, `${p.probabilidade}%`, p.razao]),
    theme: 'grid',
    headStyles: { fillColor: [110, 110, 110], fontSize: 7 },
    styles: { font: 'helvetica', fontSize: 6, cellPadding: 1 },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // Checklist
  if (resultado.checklist_sugerido?.length) {
    doc.setFontSize(11); doc.setFont('helvetica', 'bold');
    doc.text(`${section++}. CheckList Sugerido`, margin, y); y += 6;
    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    resultado.checklist_sugerido.forEach((item, i) => {
      const si = doc.splitTextToSize(`${i + 1}. ${item}`, contentWidth);
      doc.text(si, margin, y); y += si.length * 4 + 2;
    });
    y += 4;
  }

  // Cotações recomendadas
  doc.setFontSize(11); doc.setFont('helvetica', 'bold');
  doc.text(`${section++}. Melhores Cotações`, margin, y); y += 4;
  const cotBody: any[] = [];
  (resultado.cotacoes || []).forEach((c) =>
    c.resultados.forEach((r) => { if (r.recomendado) cotBody.push([c.peca, r.produto, r.canal, r.preco]); }),
  );
  autoTable(doc, {
    startY: y,
    head: [['Peça', 'Produto', 'Canal', 'Preço']],
    body: cotBody,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], fontSize: 7 },
    styles: { font: 'helvetica', fontSize: 6, cellPadding: 1 },
    margin: { left: margin, right: margin },
    tableWidth: contentWidth,
  });

  return doc;
}

export function downloadPDF(resultado: DiagnosticoResultado, veiculo: Veiculo, queixa: string) {
  const doc = buildDiagnosticPDF(resultado, veiculo, queixa);
  doc.save(`diagnostico_${(veiculo.modelo || 'veiculo').toLowerCase()}_${Date.now()}.pdf`);
}

export async function shareWhatsApp(
  resultado: DiagnosticoResultado, veiculo: Veiculo, queixa: string, phone: string,
) {
  const doc = buildDiagnosticPDF(resultado, veiculo, queixa);
  const pdfFile = new File([doc.output('blob')], `diagnostico_${veiculo.modelo}.pdf`, { type: 'application/pdf' });

  const sintomas = resultado.sintomas_identificados?.length
    ? `*Sintomas:* ${resultado.sintomas_identificados.join(', ')}\n` : '';
  const msg =
    `*PROST - DIAGNÓSTICO AUTOMOTIVO*\n\n` +
    `*Veículo:* ${veiculo.marca} ${veiculo.modelo} ${veiculo.sub_modelo ? `${veiculo.sub_modelo} ` : ''}${veiculo.versao}\n` +
    `*Chassis:* ${veiculo.chassis || '—'}\n` +
    sintomas +
    `*Diagnóstico:* ${resultado.diagnostico_resumo}\n\n` +
    `*Peça Prioritária:* ${resultado.peca_prioritaria}\n` +
    `*Custo Estimado:* ${resultado.custo_min} - ${resultado.custo_max}\n\n` +
    `*Ação:* ${resultado.acao_comprador}\n\n_Gerado por Prost - Diagnóstico_`;

  if (navigator.share && (navigator as any).canShare?.({ files: [pdfFile] })) {
    try {
      await navigator.share({ files: [pdfFile], title: 'Diagnóstico Automotivo', text: msg });
      return;
    } catch { /* usuário cancelou — cai no fallback */ }
  }
  const cleanPhone = phone.replace(/\D/g, '');
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
}

export async function shareEmail(
  resultado: DiagnosticoResultado, veiculo: Veiculo, queixa: string, email: string,
) {
  const doc = buildDiagnosticPDF(resultado, veiculo, queixa);
  const pdfFile = new File([doc.output('blob')], `diagnostico_${veiculo.modelo}.pdf`, { type: 'application/pdf' });

  const subject = `Diagnóstico Automotivo - ${veiculo.marca} ${veiculo.modelo}`;
  const sintomasText = resultado.sintomas_identificados?.length
    ? `Sintomas Detectados: ${resultado.sintomas_identificados.join(', ')}\n` : '';
  const body =
    `Olá,\n\nSegue o diagnóstico do veículo ${veiculo.marca} ${veiculo.modelo} (${veiculo.ano_fabricacao}).\n\n` +
    `${sintomasText}Resumo: ${resultado.diagnostico_resumo}\n\n` +
    `Peça Prioritária: ${resultado.peca_prioritaria}\n` +
    `Custo Estimado: ${resultado.custo_min} - ${resultado.custo_max}\n\nGerado por Prost - Diagnóstico`;

  if (navigator.share && (navigator as any).canShare?.({ files: [pdfFile] })) {
    try {
      await navigator.share({ files: [pdfFile], title: subject, text: body });
      return;
    } catch { /* fallback mailto */ }
  }
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
