import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Aviso } from './componentes/Aviso'
import { BarraTopo } from './componentes/BarraTopo'
import { CabecalhoPagina } from './componentes/CabecalhoPagina'
import { CADASTRO_PADRAO, DEMANDA_EXEMPLO } from './dominio/cadastroPadrao'
import { gerarFicha, simularMaquinas } from './dominio/calculo'
import type { Cadastros, Demanda, FichaPO } from './dominio/tipos'
import * as POs from './estado/listaPOs'
import { baixarJson } from './exportacao/baixar'
import { lerArquivo, lerConteudoTexto } from './ingestao'
import { itemDaTela, type Tela } from './navegacao'
import { carregarEstado, salvarEstado } from './persistencia/armazenamento'
import { useTema } from './persistencia/tema'
import { TelaAnalise } from './telas/TelaAnalise'
import { TelaCadastros } from './telas/TelaCadastros'
import { TelaFicha } from './telas/TelaFicha'
import { TelaOperacao } from './telas/TelaOperacao'

const FORMATOS_ACEITOS = '.ods,.xlsx,.xls,.txt,.csv,.json'

function App() {
  const [salvoInicial] = useState(carregarEstado)
  const [cadastros, setCadastros] = useState<Cadastros>(salvoInicial.cadastros ?? CADASTRO_PADRAO)
  const [pos, setPOs] = useState<POs.ListaPOs>(salvoInicial.pos ?? { demandas: [DEMANDA_EXEMPLO], ativa: 0 })
  const [salvo, setSalvo] = useState(true)
  const { tema, alternar: alternarTema } = useTema()

  const [tela, setTela] = useState<Tela>('operacao')
  const [resumoImportacao, setResumoImportacao] = useState<string[]>([])
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const inputArquivo = useRef<HTMLInputElement>(null)

  const demanda = POs.poAtiva(pos)
  const ficha = useMemo(() => gerarFicha(demanda, cadastros), [demanda, cadastros])
  const comparativo = useMemo(() => simularMaquinas(demanda, cadastros), [demanda, cadastros])

  useEffect(() => {
    setSalvo(salvarEstado({ cadastros, pos }))
  }, [cadastros, pos])

  function avisar(texto: string) {
    setErro('')
    setMensagem(texto)
  }

  function falhar(texto: string) {
    setMensagem('')
    setErro(texto)
  }

  function atualizar<K extends keyof Demanda>(campo: K, valor: Demanda[K]) {
    setPOs((lista) => POs.atualizarAtiva(lista, { ...POs.poAtiva(lista), [campo]: valor }))
  }

  function abrirPOs(novas: Demanda[]) {
    setPOs((lista) => POs.adicionar(lista, novas))
  }

  async function importar(arquivos: File[]) {
    if (arquivos.length === 0) return
    const resumo: string[] = []
    const novas: Demanda[] = []
    let novoCadastro = cadastros
    let falhas = 0

    for (const arquivo of arquivos) {
      try {
        const leitura = await lerArquivo(arquivo)
        const partes: string[] = []
        if (leitura.elementos.length) {
          novoCadastro = { ...novoCadastro, elementos: leitura.elementos }
          partes.push(`${leitura.elementos.length} elementos MTM`)
        }
        if (leitura.maquinas.length) {
          novoCadastro = { ...novoCadastro, maquinas: leitura.maquinas }
          partes.push(`${leitura.maquinas.length} máquinas`)
        }
        if (leitura.demandas.length) partes.push(`${leitura.demandas.length} PO(s)`)
        novas.push(...leitura.demandas)
        if (partes.length === 0) falhas++
        resumo.push(`${arquivo.name}: ${partes.join(', ') || 'nada reconhecido'}`)
      } catch (e) {
        falhas++
        resumo.push(`${arquivo.name}: ${e instanceof Error ? e.message : 'não foi possível ler'}`)
      }
    }

    setCadastros(novoCadastro)
    abrirPOs(novas)
    setResumoImportacao(resumo)
    const lidos = arquivos.length - falhas
    if (lidos === 0) falhar('Nenhum arquivo foi reconhecido. Confira o formato e os cabeçalhos.')
    else {
      const extra = novas.length ? ` ${novas.length} PO(s) aberta(s).` : ''
      avisar(`${lidos} de ${arquivos.length} arquivo(s) lido(s).${extra}`)
    }
  }

  function aoEscolherArquivos(e: ChangeEvent<HTMLInputElement>) {
    void importar([...(e.target.files ?? [])])
    e.target.value = '' // permite escolher o mesmo arquivo de novo
  }

  function lerTexto(texto: string) {
    try {
      const novas = lerConteudoTexto(texto)
      if (!novas.length) {
        falhar('Não encontrei uma demanda completa. Inclua pelo menos o perímetro ou o roteiro.')
        return
      }
      abrirPOs(novas)
      avisar(`${novas.length} PO(s) lida(s).`)
    } catch (e) {
      falhar(e instanceof Error ? e.message : 'Confira o texto informado.')
    }
  }

  function trocarTela(id: Tela) {
    setTela(id)
    setMensagem('')
    setErro('')
  }

  // exceljs é pesado, só carrega na hora de exportar
  async function exportarExcel(fichas: FichaPO[]) {
    try {
      const { exportarExcel } = await import('./exportacao/excel')
      await exportarExcel(fichas, cadastros)
    } catch {
      falhar('Não foi possível gerar o Excel.')
    }
  }

  const exportarTodas = () => void exportarExcel(pos.demandas.map((d) => gerarFicha(d, cadastros)))
  const selecionarArquivos = () => inputArquivo.current?.click()
  const selecionarPO = (indice: number) => setPOs((lista) => POs.selecionar(lista, indice))
  const itemAtual = itemDaTela(tela)

  const acoesFicha = (
    <>
      <button className="botao" onClick={() => window.print()} title="Salvar como PDF na janela de impressão">
        PDF
      </button>
      <button className="botao" onClick={() => baixarJson(demanda, `${demanda.titulo || 'PO'}.json`)}>
        JSON
      </button>
      <button className="botao primario" onClick={() => void exportarExcel([ficha])}>
        Exportar Excel
      </button>
    </>
  )

  return (
    <>
      <BarraTopo tela={tela} salvo={salvo} tema={tema} onTrocarTela={trocarTela} onAlternarTema={alternarTema} />

      <main className="pagina">
        <CabecalhoPagina
          titulo={itemAtual.titulo}
          descricao={itemAtual.descricao}
          demandas={tela === 'cadastros' ? undefined : pos.demandas}
          ativa={pos.ativa}
          onSelecionarPO={selecionarPO}
          acoes={tela === 'ficha' ? acoesFicha : undefined}
        />

        <Aviso
          mensagem={mensagem}
          erro={erro}
          onFechar={() => {
            setMensagem('')
            setErro('')
          }}
        />
        <input ref={inputArquivo} type="file" accept={FORMATOS_ACEITOS} multiple hidden onChange={aoEscolherArquivos} />

        {tela === 'operacao' && (
          <TelaOperacao
            demandas={pos.demandas}
            ativa={pos.ativa}
            cadastros={cadastros}
            ficha={ficha}
            resumoImportacao={resumoImportacao}
            onAtualizar={atualizar}
            onSelecionarArquivos={selecionarArquivos}
            onSoltarArquivos={(arquivos) => void importar(arquivos)}
            onLerTexto={lerTexto}
            onCarregarExemplo={() => {
              abrirPOs([structuredClone(DEMANDA_EXEMPLO)])
              avisar('PO-SL-001 aberta.')
            }}
            onSelecionarPO={selecionarPO}
            onRemoverPO={(indice) => setPOs((lista) => POs.remover(lista, indice))}
            onNovaPO={() => {
              setPOs(POs.novaPO)
              avisar('Nova PO criada.')
            }}
            onExportarTodas={exportarTodas}
            onGerarFicha={() => trocarTela('ficha')}
            onConsultarCadastros={() => trocarTela('cadastros')}
          />
        )}
        {tela === 'ficha' && (
          <TelaFicha ficha={ficha} onEditar={() => trocarTela('operacao')} onAnalisar={() => trocarTela('analise')} />
        )}
        {tela === 'analise' && (
          <TelaAnalise
            comparativo={comparativo}
            ficha={ficha}
            onTrocarMaquina={(codigo) => atualizar('codigoMaquina', codigo)}
          />
        )}
        {tela === 'cadastros' && (
          <TelaCadastros
            cadastros={cadastros}
            onChange={setCadastros}
            onImportar={selecionarArquivos}
            onRestaurarPadrao={() => {
              setCadastros(CADASTRO_PADRAO)
              avisar('Cadastros restaurados para a planilha de referência do kit.')
            }}
          />
        )}
      </main>
    </>
  )
}

export default App
