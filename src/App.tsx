import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { CADASTRO_PADRAO, DEMANDA_EXEMPLO, DEMANDA_VAZIA } from './dominio/cadastroPadrao'
import { gerarFicha, pontosNaCostura, simularMaquinas } from './dominio/calculo'
import type { Cadastros, Demanda } from './dominio/tipos'
import { exportarExcel } from './exportacao/excel'
import { lerArquivo, lerConteudoTexto } from './ingestao'
import { lerRoteiro } from './ingestao/texto'
import { decimal, minutos, percentual } from './formato'

type Tela = 'operacao' | 'ficha' | 'analise' | 'cadastros'
const nav = [
  { id: 'operacao' as const, label: 'Operação', number: '01', icon: '⌁' },
  { id: 'ficha' as const, label: 'Ficha PO', number: '02', icon: '▤' },
  { id: 'analise' as const, label: 'Análise', number: '03', icon: '↗' },
  { id: 'cadastros' as const, label: 'Cadastros', number: '04', icon: '▦' },
]

function App() {
  const [tela, setTela] = useState<Tela>('operacao')
  const [cadastros, setCadastros] = useState<Cadastros>(CADASTRO_PADRAO)
  const [demanda, setDemanda] = useState<Demanda>(DEMANDA_EXEMPLO)
  const [arquivo, setArquivo] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [textoColado, setTextoColado] = useState('')
  const [arrastando, setArrastando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const ficha = useMemo(() => gerarFicha(demanda, cadastros), [demanda, cadastros])
  const comparativo = useMemo(() => simularMaquinas(demanda, cadastros), [demanda, cadastros])
  const maisRapida = comparativo.length ? Math.min(...comparativo.map((m) => m.tempoTotal)) : 0

  function atualizar<K extends keyof Demanda>(campo: K, valor: Demanda[K]) {
    setDemanda((atual) => ({ ...atual, [campo]: valor }))
  }

  async function importar(file?: File) {
    if (!file) return
    setErro('')
    try {
      const leitura = await lerArquivo(file)
      if (leitura.elementos.length || leitura.maquinas.length) {
        setCadastros({
          elementos: leitura.elementos.length ? leitura.elementos : cadastros.elementos,
          maquinas: leitura.maquinas.length ? leitura.maquinas : cadastros.maquinas,
        })
      }
      if (leitura.demandas.length) {
        setDemanda(leitura.demandas[0])
        setMensagem(`${leitura.demandas.length} demanda(s) encontrada(s). A primeira foi carregada para edição.`)
      } else if (leitura.elementos.length || leitura.maquinas.length) {
        setMensagem('Cadastros carregados e prontos para uso.')
      } else {
        setErro('Não encontrei dados reconhecíveis nesse arquivo. Confira o formato e os cabeçalhos.')
      }
      setArquivo(file.name)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível ler o arquivo.')
    }
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    void importar(file)
    e.target.value = ''
  }
  function drop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setArrastando(false); void importar(e.dataTransfer.files?.[0])
  }
  function aplicarTexto() {
    setErro('')
    try {
      const demandas = lerConteudoTexto(textoColado)
      if (!demandas.length) { setErro('Não encontrei uma demanda completa. Inclua pelo menos o perímetro ou o roteiro.'); return }
      setDemanda(demandas[0]); setMensagem(`${demandas.length} demanda(s) lida(s). A primeira está pronta para revisar.`)
    } catch (e) { setErro(e instanceof Error ? e.message : 'Confira o texto informado.') }
  }

  function trocarTela(id: Tela) { setTela(id); setMensagem(''); setErro('') }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span>K</span><i /></div><div><b>karsten</b><small>ENGENHARIA · T&M</small></div></div>
      <div className="side-caption">ESPAÇO DE TRABALHO</div>
      <div className="workspace"><span className="workspace-icon">⌂</span><span><b>Auto-T&amp;M</b><small>Projeto de tempos e métodos</small></span><span className="chevron">⌄</span></div>
      <div className="side-caption menu-caption">MENU PRINCIPAL</div>
      <nav>{nav.map((item) => <button key={item.id} className={`nav-item ${tela === item.id ? 'active' : ''}`} onClick={() => trocarTela(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span><span className="nav-number">{item.number}</span></button>)}</nav>
      <div className="sidebar-bottom"><div className="status-dot" /><span>Motor de cálculo ativo</span><span className="version">v1.0</span></div>
      <div className="user-card"><div className="avatar">TM</div><div><b>Engenharia</b><small>Tempos &amp; Métodos</small></div><span className="more">···</span></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Auto-T&amp;M <span>/</span> <b>{nav.find((n) => n.id === tela)?.label}</b></div><div className="top-actions"><span className="saved"><i /> Alterações salvas localmente</span><button className="help-button" title="Ajuda">?</button></div></header>

      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">KARSTEN <span>·</span> TEMPOS E MÉTODOS</div><h1>{tela === 'operacao' ? 'Nova operação' : tela === 'ficha' ? 'Ficha operacional' : tela === 'analise' ? 'Análise de eficiência' : 'Base de cadastros'}</h1><p>{tela === 'operacao' ? 'Configure a operação e confira os parâmetros antes de calcular.' : tela === 'ficha' ? 'Resumo calculado da operação, pronto para revisar e exportar.' : tela === 'analise' ? 'Compare o desempenho estimado entre as máquinas disponíveis.' : 'Consulte os elementos MTM e os equipamentos usados nos cálculos.'}</p></div><div className="heading-actions"><span className="revision-tag">{demanda.titulo || 'PO-NOVA'} <b>REV. {demanda.revisao || '00'}</b></span>{tela === 'ficha' && <button className="button primary" onClick={() => void exportarExcel([ficha], cadastros)}><span>↓</span> Exportar Excel</button>}</div></div>

        {(mensagem || erro) && <div className={`notice ${erro ? 'error' : ''}`}><span>{erro ? '!' : '✓'}</span>{erro || mensagem}<button onClick={() => { setMensagem(''); setErro('') }}>×</button></div>}
        <input ref={inputRef} type="file" accept=".ods,.xlsx,.xls,.txt,.csv,.json" hidden onChange={onFile} />

        {tela === 'operacao' && <>
          <div className="section-label"><span className="step">01</span><div><b>Entrada de dados</b><small>Importe um arquivo ou informe os dados manualmente</small></div><span className="optional">ENTRADA FLEXÍVEL</span></div>
          <div className="import-grid">
            <div className={`upload-card ${arrastando ? 'dragging' : ''}`} onDragOver={(e) => { e.preventDefault(); setArrastando(true) }} onDragLeave={() => setArrastando(false)} onDrop={drop}>
              <div className="upload-icon">↑</div><div className="upload-copy"><b>Importar arquivo</b><p>Arraste aqui ou <button className="text-button" onClick={() => inputRef.current?.click()}>selecione do computador</button></p><small>Planilha de cadastros ou demanda · XLS, XLSX, ODS, TXT, CSV, JSON</small></div><button className="button secondary" onClick={() => inputRef.current?.click()}>Selecionar arquivo</button>
              {arquivo && <div className="file-chip"><span>▤</span>{arquivo}<b>✓</b></div>}
            </div>
            <div className="paste-card"><div className="paste-title"><span className="paste-icon">⌘</span><div><b>Colar dados</b><small>Use o formato chave: valor ou JSON</small></div></div><textarea value={textoColado} onChange={(e) => setTextoColado(e.target.value)} placeholder={'Título: PO-SL-001\nPerímetro: 6,96\nCód. Eqp: 1\nElementos: 2.1, 1.1, 3.1'} /><button className="button secondary compact" onClick={aplicarTexto}>Ler dados <span>→</span></button></div>
          </div>

          <div className="section-label operation-label"><span className="step">02</span><div><b>Parâmetros da operação</b><small>Os campos podem ser ajustados antes de gerar a ficha</small></div><button className="text-button reset-button" onClick={() => { setDemanda(structuredClone(DEMANDA_VAZIA)); setMensagem('Nova operação iniciada.') }}>+ Nova operação</button></div>
          <div className="form-card">
            <div className="form-section-title"><span className="mini-icon">▣</span><b>Identificação do produto</b><span>INFORMAÇÕES GERAIS</span></div>
            <div className="form-grid four"><Field label="Título da PO" value={demanda.titulo} onChange={(v) => atualizar('titulo', v)} /><Field label="Revisão" value={demanda.revisao} onChange={(v) => atualizar('revisao', v)} /><Field label="Agrupamento / família" value={demanda.familia} onChange={(v) => atualizar('familia', v)} /><Field label="Tamanho" value={demanda.tamanho} onChange={(v) => atualizar('tamanho', v)} /></div>
            <div className="form-grid product-grid"><Field label="Operação" value={demanda.operacao} onChange={(v) => atualizar('operacao', v)} /><Field label="Medidas da peça" value={demanda.medidas} onChange={(v) => atualizar('medidas', v)} /><NumberField label="Perímetro de costura" suffix="m" value={demanda.perimetro} onChange={(v) => atualizar('perimetro', v)} /><NumberField label="Pontos por centímetro" suffix="pt/cm" value={demanda.pontosPorCm} onChange={(v) => atualizar('pontosPorCm', v)} /></div>
            <div className="divider" />
            <div className="form-section-title"><span className="mini-icon machine-icon">⚙</span><b>Equipamento e roteiro</b><span>PROCESSO PRODUTIVO</span></div>
            <div className="form-grid equipment-grid"><label className="field"><span>Máquina selecionada</span><select value={demanda.codigoMaquina} onChange={(e) => atualizar('codigoMaquina', e.target.value)}>{cadastros.maquinas.map((m) => <option key={m.codigo} value={m.codigo}>{m.codigo} · {m.tipo} — {m.modelo}</option>)}</select></label><div className="machine-facts"><span><small>RPM padrão</small><b>{ficha.rpm.padrao.toLocaleString('pt-BR')}</b></span><span><small>Tempo / metro</small><b>{minutos(ficha.maquina?.tempoPorMetro ?? 0, 4)} <em>min/m</em></b></span></div></div>
            <label className="field route-field"><span>Sequência de elementos MTM <i>Ordem de execução</i></span><input value={demanda.roteiro.map((p) => p.frequencia === 1 ? p.codigo : `${p.codigo} x${p.frequencia}`).join(', ')} onChange={(e) => atualizar('roteiro', lerRoteiro(e.target.value))} placeholder="Ex.: 2.1, 1.1, 3.1 x2" /><small className="field-hint">Separe os códigos por vírgula. Use x2 para indicar frequência. <button className="text-button" onClick={() => setTela('cadastros')}>Consultar elementos disponíveis →</button></small></label>
            <div className="form-footer"><span><span className="check-icon">✓</span> Cálculo atualizado automaticamente</span><button className="button primary" onClick={() => setTela('ficha')}>Gerar ficha PO <span>→</span></button></div>
          </div>
        </>}

        {tela === 'ficha' && <FichaView demanda={demanda} ficha={ficha} onExport={() => void exportarExcel([ficha], cadastros)} onEdit={() => setTela('operacao')} onAnalysis={() => setTela('analise')} />}
        {tela === 'analise' && <AnalysisView comparativo={comparativo} maisRapida={maisRapida} ficha={ficha} />}
        {tela === 'cadastros' && <CatalogView cadastros={cadastros} onImport={() => inputRef.current?.click()} />}
        <footer className="page-footer"><span><b>Auto-T&amp;M</b> · Ferramenta de apoio à Engenharia de Tempos e Métodos</span><span>Karsten <i>●</i> Dados da operação são mantidos nesta sessão</span></footer>
      </div>
    </main>
  </div>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} /></label>
}
function NumberField({ label, suffix, value, onChange }: { label: string; suffix: string; value: number; onChange: (v: number) => void }) {
  return <label className="field"><span>{label}</span><div className="input-suffix"><input type="number" min="0" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value))} /><i>{suffix}</i></div></label>
}

function FichaView({ demanda, ficha, onExport, onEdit, onAnalysis }: { demanda: Demanda; ficha: ReturnType<typeof gerarFicha>; onExport: () => void; onEdit: () => void; onAnalysis: () => void }) {
  return <div className="content-grid">
    <div className="primary-column">
      <section className="po-card"><div className="po-top"><div><div className="eyebrow">PROCESSO OPERACIONAL</div><h2>{demanda.titulo || 'PO-NOVA'} <span>REV. {demanda.revisao}</span></h2><p>{demanda.operacao || 'Operação sem descrição'}</p></div><span className="approved"><i /> PRONTA PARA REVISÃO</span></div>
        <div className="po-meta"><div><small>AGRUPAMENTO / FAMÍLIA</small><b>{demanda.familia || '—'}</b></div><div><small>TAMANHO</small><b>{demanda.tamanho || '—'}</b></div><div><small>MEDIDAS DA PEÇA</small><b>{demanda.medidas || '—'}</b></div><div><small>PERÍMETRO DE COSTURA</small><b>{decimal(demanda.perimetro, 2)} <em>m</em></b></div></div>
        <div className="machine-strip"><span className="machine-badge">⚙</span><div><small>EQUIPAMENTO</small><b>{ficha.maquina ? `${ficha.maquina.tipo} · ${ficha.maquina.modelo}` : 'Máquina não cadastrada'}</b></div><div><small>CÓDIGO</small><b>{demanda.codigoMaquina}</b></div><div><small>RPM · PADRÃO</small><b>{ficha.rpm.padrao.toLocaleString('pt-BR')}</b></div><div><small>FAIXA DE RPM</small><b>{ficha.rpm.inferior.toLocaleString('pt-BR')} — {ficha.rpm.superior.toLocaleString('pt-BR')}</b></div></div>
        <div className="table-heading"><div><b>Elementos da operação</b><small>Tempos unitários em minutos</small></div><span>{ficha.linhas.length} ETAPAS</span></div>
        <div className="table-wrap"><table><thead><tr><th>CÓDIGO</th><th>ELEMENTO / DESCRIÇÃO</th><th>FREQUÊNCIA</th><th>TEMPO (MIN)</th></tr></thead><tbody>{ficha.linhas.map((l, i) => <tr key={`${l.codigo}-${i}`}><td><span className={`code-pill ${l.origem === 'fixo' ? 'fixed' : ''}`}>{l.codigo}</span></td><td>{l.descricao}{!l.encontrado && <small className="missing">Não cadastrado</small>}</td><td>{l.frequencia.toLocaleString('pt-BR')}</td><td className="numeric">{minutos(l.tempo)}</td></tr>)}</tbody><tfoot><tr><td colSpan={3}><b>TP</b> Tempo total da operação</td><td className="numeric">{minutos(ficha.tempoTotal)}</td></tr></tfoot></table></div>
        <div className="po-bottom"><span>Pontos estimados na costura <b>{pontosNaCostura(demanda).toLocaleString('pt-BR')} <small>pts</small></b></span><span>Produção estimada <b>{decimal(ficha.pecasPorHora, 1)} <small>peças/h</small></b></span></div>
        {ficha.avisos.length > 0 && <div className="warning-box"><b>Confira os cadastros</b>{ficha.avisos.map((a) => <span key={a}>{a}</span>)}</div>}
      </section>
      <div className="action-row"><button className="button secondary" onClick={onEdit}>← Editar operação</button><button className="button primary" onClick={onExport}>↓ Exportar ficha Excel</button></div>
    </div>
    <aside className="summary-column"><div className="summary-card"><div className="summary-label">TEMPO TOTAL</div><div className="big-metric">{minutos(ficha.tempoTotal)}<small>min</small></div><div className="metric-caption">por peça produzida</div><div className="metric-divider"/><div className="metric-row"><span>Costura da máquina</span><b>{minutos(ficha.tempoFixo)} min</b></div><div className="metric-row"><span>Movimentos manuais</span><b>{minutos(ficha.tempoManual)} min</b></div><div className="stacked-bar"><i style={{ width: `${percentual(ficha.tempoFixo, ficha.tempoTotal)}%` }} /><b style={{ width: `${percentual(ficha.tempoManual, ficha.tempoTotal)}%` }} /></div><div className="legend"><span><i className="legend-fixed"/> Fixo</span><span><i className="legend-manual"/> MTM</span></div></div><div className="info-card"><span className="info-icon">i</span><div><b>Como é calculado?</b><p>Tempo fixo = perímetro × tempo por metro. O tempo manual soma os elementos MTM multiplicados por suas frequências.</p></div></div><div className="mini-callout"><span>↗</span><div><b>Quer comparar equipamentos?</b><button onClick={onAnalysis}>Ver análise de máquinas →</button></div></div></aside>
  </div>
}

function AnalysisView({ comparativo, maisRapida, ficha }: { comparativo: ReturnType<typeof simularMaquinas>; maisRapida: number; ficha: ReturnType<typeof gerarFicha> }) {
  const base = Math.max(...comparativo.map((m) => m.tempoTotal), 0.01)
  return <><div className="analysis-summary"><div className="analysis-summary-icon">↗</div><div><b>Simulação por equipamento</b><p>Mesmo produto e roteiro, calculados com o tempo por metro de cada máquina cadastrada.</p></div><div className="analysis-kpi"><small>ROTEIRO ANALISADO</small><b>{ficha.linhas.length - 1} <em>elementos MTM</em></b></div><div className="analysis-kpi"><small>PERÍMETRO</small><b>{decimal(ficha.demanda.perimetro, 2)} <em>m</em></b></div></div><div className="analysis-grid">{comparativo.map(({ maquina, tempoTotal, pecasPorHora }) => { const fastest = tempoTotal === maisRapida; return <article key={maquina.codigo} className={`machine-card ${fastest ? 'best' : ''}`}><div className="machine-card-top"><div className="machine-symbol">⚙</div>{fastest && <span className="best-tag">MAIS RÁPIDA</span>}</div><div className="machine-kind">{maquina.tipo} · CÓD. {maquina.codigo}</div><h2>{maquina.modelo}</h2><div className="machine-rpm"><span>RPM padrão</span><b>{maquina.rpm.toLocaleString('pt-BR')}</b></div><div className="machine-result"><small>TEMPO TOTAL / PEÇA</small><b>{minutos(tempoTotal)} <em>min</em></b><div className="bar-track"><i style={{ width: `${(tempoTotal / base) * 100}%` }} /></div></div><div className="machine-result production"><small>PRODUÇÃO ESTIMADA</small><b>{decimal(pecasPorHora, 1)} <em>peças/h</em></b></div><div className="machine-foot"><span>Tempo de costura</span><b>{minutos(ficha.demanda.perimetro * maquina.tempoPorMetro)} min</b></div></article> })}</div><div className="analysis-note"><span>i</span><p>A simulação considera o tempo de costura fixo de cada máquina e mantém iguais os tempos dos movimentos manuais. A produção é uma estimativa matemática por hora.</p></div></>
}

function CatalogView({ cadastros, onImport }: { cadastros: Cadastros; onImport: () => void }) {
  return <><div className="catalog-toolbar"><div className="catalog-tabs"><span className="selected">Elementos MTM <b>{cadastros.elementos.length}</b></span><span>Máquinas <b>{cadastros.maquinas.length}</b></span></div><button className="button secondary" onClick={onImport}>↑ Importar planilha</button></div><div className="catalog-grid"><section className="catalog-card"><div className="catalog-heading"><div><span className="catalog-icon">⌁</span><div><b>Matriz de elementos MTM</b><small>Procedimentos manuais e seus tempos padrão</small></div></div><span className="catalog-count">{cadastros.elementos.length} ELEMENTOS</span></div><div className="table-wrap"><table><thead><tr><th>CÓDIGO</th><th>DESCRIÇÃO DO ELEMENTO</th><th>TEMPO UNITÁRIO</th></tr></thead><tbody>{cadastros.elementos.map((e) => <tr key={e.codigo}><td><span className="code-pill">{e.codigo}</span></td><td>{e.descricao}</td><td className="numeric">{minutos(e.tempo)} <small>min</small></td></tr>)}</tbody></table></div></section><section className="catalog-card machine-catalog"><div className="catalog-heading"><div><span className="catalog-icon">⚙</span><div><b>Cadastro de máquinas</b><small>Parâmetros de costura por equipamento</small></div></div><span className="catalog-count">{cadastros.maquinas.length} MÁQUINAS</span></div><div className="machine-list">{cadastros.maquinas.map((m) => <div className="machine-list-item" key={m.codigo}><span className="machine-list-icon">⚙</span><div className="machine-list-copy"><b>{m.modelo}</b><small>{m.tipo} · Código {m.codigo}</small></div><div className="machine-data"><small>RPM</small><b>{m.rpm.toLocaleString('pt-BR')}</b></div><div className="machine-data"><small>TEMPO / M</small><b>{minutos(m.tempoPorMetro, 4)} <em>min</em></b></div></div>)}</div></section></div><div className="catalog-footnote"><span>i</span> Estes dados são carregados da planilha de referência. Importe um novo arquivo para atualizar os cadastros nesta sessão.</div></>
}

export default App
