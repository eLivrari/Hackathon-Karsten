import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Aviso } from './componentes/Aviso'
import { BarraLateral } from './componentes/BarraLateral'
import { BarraSuperior } from './componentes/BarraSuperior'
import { CabecalhoPagina } from './componentes/CabecalhoPagina'
import { Rodape } from './componentes/Rodape'
import { CADASTRO_PADRAO, DEMANDA_EXEMPLO, DEMANDA_VAZIA } from './dominio/cadastroPadrao'
import { gerarFicha, simularMaquinas } from './dominio/calculo'
import type { Cadastros, Demanda } from './dominio/tipos'
import { exportarExcel } from './exportacao/excel'
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
  const [demanda, setDemanda] = useState<Demanda>(salvoInicial.demanda ?? DEMANDA_EXEMPLO)
  const [salvo, setSalvo] = useState(true)
  const { tema, alternar: alternarTema } = useTema()

  const [tela, setTela] = useState<Tela>('operacao')
  const [arquivo, setArquivo] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const inputArquivo = useRef<HTMLInputElement>(null)

  const ficha = useMemo(() => gerarFicha(demanda, cadastros), [demanda, cadastros])
  const comparativo = useMemo(() => simularMaquinas(demanda, cadastros), [demanda, cadastros])

  // Cada alteração é gravada no navegador; ao recarregar a página, o trabalho volta
  useEffect(() => {
    setSalvo(salvarEstado({ cadastros, demanda }))
  }, [cadastros, demanda])

  function avisar(texto: string) {
    setErro('')
    setMensagem(texto)
  }

  function falhar(e: unknown, padrao: string) {
    setMensagem('')
    setErro(e instanceof Error ? e.message : padrao)
  }

  function atualizar<K extends keyof Demanda>(campo: K, valor: Demanda[K]) {
    setDemanda((atual) => ({ ...atual, [campo]: valor }))
  }

  async function importar(file?: File) {
    if (!file) return
    try {
      const leitura = await lerArquivo(file)
      const temCadastros = leitura.elementos.length > 0 || leitura.maquinas.length > 0
      if (temCadastros) {
        setCadastros((atual) => ({
          elementos: leitura.elementos.length ? leitura.elementos : atual.elementos,
          maquinas: leitura.maquinas.length ? leitura.maquinas : atual.maquinas,
        }))
      }

      if (leitura.demandas.length) {
        setDemanda(leitura.demandas[0])
        avisar(`${leitura.demandas.length} demanda(s) encontrada(s). A primeira foi carregada para edição.`)
      } else if (temCadastros) {
        avisar('Cadastros carregados e prontos para uso.')
      } else {
        falhar(null, 'Não encontrei dados reconhecíveis nesse arquivo. Confira o formato e os cabeçalhos.')
      }
      setArquivo(file.name)
    } catch (e) {
      falhar(e, 'Não foi possível ler o arquivo.')
    }
  }

  function aoEscolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    void importar(e.target.files?.[0])
    e.target.value = '' // permite escolher o mesmo arquivo de novo
  }

  function lerTexto(texto: string) {
    try {
      const demandas = lerConteudoTexto(texto)
      if (!demandas.length) {
        falhar(null, 'Não encontrei uma demanda completa. Inclua pelo menos o perímetro ou o roteiro.')
        return
      }
      setDemanda(demandas[0])
      avisar(`${demandas.length} demanda(s) lida(s). A primeira está pronta para revisar.`)
    } catch (e) {
      falhar(e, 'Confira o texto informado.')
    }
  }

  function trocarTela(id: Tela) {
    setTela(id)
    setMensagem('')
    setErro('')
  }

  const exportar = () => void exportarExcel([ficha], cadastros)
  const selecionarArquivo = () => inputArquivo.current?.click()
  const itemAtual = itemDaTela(tela)

  return (
    <div className="app-shell">
      <BarraLateral tela={tela} onTrocarTela={trocarTela} />

      <main className="main-area">
        <BarraSuperior titulo={itemAtual.label} salvo={salvo} tema={tema} onAlternarTema={alternarTema} />

        <div className="page-content">
          <CabecalhoPagina
            titulo={itemAtual.titulo}
            descricao={itemAtual.descricao}
            tituloPO={demanda.titulo}
            revisao={demanda.revisao}
            onExportar={tela === 'ficha' ? exportar : undefined}
          />

          <Aviso
            mensagem={mensagem}
            erro={erro}
            onFechar={() => {
              setMensagem('')
              setErro('')
            }}
          />
          <input ref={inputArquivo} type="file" accept={FORMATOS_ACEITOS} hidden onChange={aoEscolherArquivo} />

          {tela === 'operacao' && (
            <TelaOperacao
              demanda={demanda}
              cadastros={cadastros}
              ficha={ficha}
              arquivo={arquivo}
              onAtualizar={atualizar}
              onSelecionarArquivo={selecionarArquivo}
              onSoltarArquivo={(file) => void importar(file)}
              onLerTexto={lerTexto}
              onNovaOperacao={() => {
                setDemanda(structuredClone(DEMANDA_VAZIA))
                avisar('Nova operação iniciada.')
              }}
              onGerarFicha={() => trocarTela('ficha')}
              onConsultarCadastros={() => trocarTela('cadastros')}
            />
          )}
          {tela === 'ficha' && (
            <TelaFicha
              ficha={ficha}
              onExportar={exportar}
              onEditar={() => trocarTela('operacao')}
              onAnalisar={() => trocarTela('analise')}
            />
          )}
          {tela === 'analise' && <TelaAnalise comparativo={comparativo} ficha={ficha} />}
          {tela === 'cadastros' && (
            <TelaCadastros
              cadastros={cadastros}
              onImportar={selecionarArquivo}
              onRestaurarPadrao={() => {
                setCadastros(CADASTRO_PADRAO)
                avisar('Cadastros restaurados para a planilha de referência do kit.')
              }}
            />
          )}

          <Rodape />
        </div>
      </main>
    </div>
  )
}

export default App
