import { MENU, type Tela } from '../navegacao'
import type { Tema } from '../persistencia/tema'

interface Props {
  tela: Tela
  salvo: boolean
  tema: Tema
  onTrocarTela: (tela: Tela) => void
  onAlternarTema: () => void
}

export function BarraTopo({ tela, salvo, tema, onTrocarTela, onAlternarTema }: Props) {
  return (
    <header className="topo">
      <div className="topo-marca">
        <b>Karsten</b>
        <span>Auto-T&amp;M</span>
      </div>

      <nav className="abas">
        {MENU.map((item) => (
          <button
            key={item.id}
            className={tela === item.id ? 'aba ativa' : 'aba'}
            aria-current={tela === item.id ? 'page' : undefined}
            onClick={() => onTrocarTela(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="topo-direita">
        {salvo ? (
          <span className="salvo" title="Os dados ficam neste navegador e voltam ao recarregar a página">
            Salvo no navegador
          </span>
        ) : (
          <span className="salvo falhou" title="O navegador bloqueou o armazenamento local (aba anônima?)">
            Não foi possível salvar
          </span>
        )}
        <button className="botao-tema" onClick={onAlternarTema}>
          {tema === 'claro' ? 'Modo escuro' : 'Modo claro'}
        </button>
      </div>
    </header>
  )
}
