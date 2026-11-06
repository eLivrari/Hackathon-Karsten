import type { ReactNode } from 'react'
import { pontosNaCostura } from '../dominio/calculo'
import type { FichaPO } from '../dominio/tipos'
import { decimal, minutos } from '../formato'
import { ResumoTempos } from '../componentes/ResumoTempos'

interface Props {
  ficha: FichaPO
  onEditar: () => void
  onAnalisar: () => void
}

export function TelaFicha({ ficha, onEditar, onAnalisar }: Props) {
  return (
    <div className="duas-colunas">
      <div>
        <FolhaPO ficha={ficha} />
        <div className="acoes">
          <button className="botao" onClick={onEditar}>
            Voltar para a operação
          </button>
        </div>
      </div>

      <aside className="lateral">
        <ResumoTempos ficha={ficha} />
        <p className="nota">
          Tempo fixo = perímetro × tempo por metro da máquina. Tempo manual = soma dos elementos MTM × frequência.
        </p>
        <button className="link" onClick={onAnalisar}>
          Comparar com as outras máquinas
        </button>
      </aside>
    </div>
  )
}

// Monta a ficha no mesmo desenho da planilha de PO: cabeçalho em células e a tabela de elementos
function FolhaPO({ ficha }: { ficha: FichaPO }) {
  const { demanda, rpm, maquina } = ficha

  return (
    <section className="folha">
      <div className="folha-titulo">
        <div>
          <h2>{demanda.titulo || 'PO sem título'}</h2>
          <p>{demanda.operacao || 'Operação sem descrição'}</p>
        </div>
        <span>Rev. {demanda.revisao || '00'}</span>
      </div>

      <div className="celulas">
        <Celula rotulo="Família">{demanda.familia || '—'}</Celula>
        <Celula rotulo="Tamanho">{demanda.tamanho || '—'}</Celula>
        <Celula rotulo="Medidas">{demanda.medidas || '—'}</Celula>
        <Celula rotulo="Perímetro">{decimal(demanda.perimetro, 2)} m</Celula>
        <Celula rotulo="Máquina">{maquina ? `${maquina.tipo} — ${maquina.modelo}` : 'Não cadastrada'}</Celula>
        <Celula rotulo="Código">{demanda.codigoMaquina}</Celula>
        <Celula rotulo="RPM padrão">{rpm.padrao.toLocaleString('pt-BR')}</Celula>
        <Celula rotulo="Faixa de RPM">
          {rpm.inferior.toLocaleString('pt-BR')} – {rpm.superior.toLocaleString('pt-BR')}
        </Celula>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Elemento</th>
            <th className="direita">Freq.</th>
            <th className="direita">Tempo (min)</th>
          </tr>
        </thead>
        <tbody>
          {ficha.linhas.map((linha, i) => (
            <tr key={`${linha.codigo}-${i}`}>
              <td className="num">{linha.origem === 'fixo' ? 'Fixo' : linha.codigo}</td>
              <td>
                {linha.descricao}
                {!linha.encontrado && <span className="falta">não cadastrado</span>}
              </td>
              <td className="direita num">{linha.frequencia.toLocaleString('pt-BR')}</td>
              <td className="direita num">{minutos(linha.tempo)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Tempo padrão da operação</td>
            <td className="direita num">{minutos(ficha.tempoTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="folha-rodape num">
        <span>{pontosNaCostura(demanda).toLocaleString('pt-BR')} pontos na costura</span>
        <span>{decimal(ficha.pecasPorHora, 1)} peças/h</span>
      </div>

      {ficha.avisos.length > 0 && (
        <div className="alerta">
          <b>Confira os cadastros</b>
          <ul>
            {ficha.avisos.map((aviso) => (
              <li key={aviso}>{aviso}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function Celula({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return (
    <div className="celula">
      <span>{rotulo}</span>
      <b>{children}</b>
    </div>
  )
}
