import ExcelJS from 'exceljs'
import type { Cadastros, FichaPO } from '../dominio/tipos'
import { baixar } from './baixar'

const AZUL = 'FF1D2F4E'
const CINZA = 'FFD9D9D9' // mesmo cinza do gabarito
const TURQUESA = 'FFCDEDEA'
const FORMATO_TEMPO = '0.0000'

const ABA_MTM = 'MATRIZ_DE_ELEMENTOS'
const ABA_CM = 'TEMPO-CM'

// Código "1" vira número 1 (igual ao kit), "2.1" continua texto — assim o CORRESP funciona
const codigoCelula = (codigo: string) => (/^\d+$/.test(codigo) ? Number(codigo) : codigo)

function preencher(celula: ExcelJS.Cell, cor: string, fonteBranca = false) {
  celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: cor } }
  celula.font = { bold: true, color: { argb: fonteBranca ? 'FFFFFFFF' : 'FF000000' } }
}

function abaCadastros(pasta: ExcelJS.Workbook, cadastros: Cadastros) {
  const mtm = pasta.addWorksheet(ABA_MTM)
  mtm.addRow(['Descrição do elemento', 'Código do agrupador', 'Código do elemento', 'elemento + agrupador', 'Tempo'])
  for (const e of cadastros.elementos) {
    const [agrupador, elemento] = e.codigo.split('.')
    mtm.addRow([e.descricao, Number(agrupador), Number(elemento), e.codigo, e.tempo])
  }
  mtm.columns = [{ width: 50 }, { width: 20 }, { width: 18 }, { width: 20 }, { width: 10 }]
  mtm.getRow(1).eachCell((c) => preencher(c, CINZA))

  const cm = pasta.addWorksheet(ABA_CM)
  cm.addRow(['Código de máquina', 'Tipo Máquina', 'Descrição', 'RPM', 'Tempo (tempo/metro)'])
  for (const m of cadastros.maquinas) {
    cm.addRow([codigoCelula(m.codigo), m.tipo, m.modelo, m.rpm, m.tempoPorMetro])
  }
  cm.columns = [{ width: 20 }, { width: 16 }, { width: 16 }, { width: 10 }, { width: 22 }]
  cm.getRow(1).eachCell((c) => preencher(c, CINZA))
}

/**
 * Monta a aba da PO no mesmo layout do gabarito (A1:E…).
 * Os tempos saem como FÓRMULAS apontando para as abas de cadastro:
 * se a engenharia mudar um tempo MTM no Excel, a ficha recalcula sozinha.
 */
function abaFicha(pasta: ExcelJS.Workbook, ficha: FichaPO, nomeAba: string) {
  const { demanda, maquina } = ficha
  const aba = pasta.addWorksheet(nomeAba)
  aba.columns = [{ width: 20 }, { width: 34 }, { width: 22 }, { width: 14 }, { width: 24 }]
  aba.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }

  aba.addRow([demanda.titulo, '', '', '', `Rev. ${demanda.revisao}`])
  aba.addRow(['Operação', demanda.operacao])
  aba.addRow(['Agrupamento família', 'Tamanho', 'Medidas da peça (em m)', 'Pontos/cm', 'Perímetro costura(em m)'])
  aba.addRow([demanda.familia, demanda.tamanho, demanda.medidas, demanda.pontosPorCm, demanda.perimetro])
  aba.addRow(['Cód. Eqp.', 'Equipamento', 'RPM - limite inferior', 'RPM - padrão', 'RPM - limite superior'])
  aba.addRow([codigoCelula(demanda.codigoMaquina), maquina?.tipo ?? '—', null, null, null])
  aba.addRow(['Código do elemento', 'Elementos', '', 'Frequência', 'Tempos (em minutos)'])

  const procurarMaquina = (coluna: string) => `INDEX('${ABA_CM}'!$${coluna}:$${coluna},MATCH($A$6,'${ABA_CM}'!$A:$A,0))`
  aba.getCell('D6').value = { formula: procurarMaquina('D'), result: ficha.rpm.padrao }
  aba.getCell('C6').value = { formula: 'D6*0.9', result: ficha.rpm.inferior }
  aba.getCell('E6').value = { formula: 'D6*1.1', result: ficha.rpm.superior }

  const primeira = 8
  ficha.linhas.forEach((linha, i) => {
    const n = primeira + i
    const row = aba.addRow([linha.origem === 'fixo' ? 'FIXO' : linha.codigo, linha.descricao, '', linha.frequencia])
    aba.mergeCells(`B${n}:C${n}`)

    let formula: string | undefined
    if (linha.origem === 'fixo' && maquina) formula = `E4*${procurarMaquina('E')}`
    if (linha.origem === 'mtm' && linha.encontrado) {
      formula = `INDEX('${ABA_MTM}'!$E:$E,MATCH(A${n},'${ABA_MTM}'!$D:$D,0))*D${n}`
    }
    row.getCell(5).value = formula ? { formula, result: linha.tempo } : linha.tempo
    row.getCell(5).numFmt = FORMATO_TEMPO
  })

  const ultima = primeira + ficha.linhas.length - 1
  const total = aba.addRow([
    'TP',
    'Tempo total da operação',
    '',
    '',
    { formula: `SUM(E${primeira}:E${ultima})`, result: ficha.tempoTotal },
  ])
  aba.mergeCells(`B${total.number}:D${total.number}`)
  total.getCell(5).numFmt = FORMATO_TEMPO

  const producao = aba.addRow([
    '',
    'Produção estimada (peças/hora)',
    '',
    '',
    { formula: `60/E${total.number}`, result: ficha.pecasPorHora },
  ])
  aba.mergeCells(`B${producao.number}:D${producao.number}`)
  producao.getCell(5).numFmt = '0.0'

  aba.mergeCells('A1:D1')
  aba.mergeCells('B2:E2')
  aba.mergeCells('B7:C7')

  // Estilo
  aba.eachRow((row) =>
    row.eachCell({ includeEmpty: true }, (c) => {
      c.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      }
      c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    }),
  )
  ;['A1', 'E1'].forEach((ref) => preencher(aba.getCell(ref), AZUL, true))
  aba.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } }
  ;[2, 3, 5, 7].forEach((r) => aba.getRow(r).eachCell((c, col) => (r !== 2 || col === 1) && preencher(c, CINZA)))
  aba.getRow(total.number).eachCell((c) => preencher(c, TURQUESA))
  aba.getCell('B2').alignment = { horizontal: 'left', vertical: 'middle' }
  for (let r = primeira; r <= ultima; r++) aba.getCell(`B${r}`).alignment = { horizontal: 'left', vertical: 'middle' }
}

function nomeDeAba(titulo: string, usados: Set<string>) {
  const base = (titulo || 'PO').replace(/[\\/*?:[\]]/g, '-').slice(0, 28)
  let nome = base
  for (let i = 2; usados.has(nome); i++) nome = `${base}-${i}`
  usados.add(nome)
  return nome
}

/** Uma aba por PO + as duas abas de cadastro que alimentam as fórmulas */
export function montarPasta(fichas: FichaPO[], cadastros: Cadastros) {
  const pasta = new ExcelJS.Workbook()
  pasta.creator = 'Auto-T&M'

  const usados = new Set<string>()
  fichas.forEach((f) => abaFicha(pasta, f, nomeDeAba(f.demanda.titulo, usados)))
  abaCadastros(pasta, cadastros)
  return pasta
}

export async function exportarExcel(fichas: FichaPO[], cadastros: Cadastros) {
  const buffer = await montarPasta(fichas, cadastros).xlsx.writeBuffer()
  const nome = fichas.length === 1 ? `${fichas[0].demanda.titulo}.xlsx` : `POs-lote-${fichas.length}.xlsx`
  baixar(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), nome)
}
