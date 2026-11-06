import { MENU, type Tela } from '../navegacao'

interface Props {
  tela: Tela
  onTrocarTela: (tela: Tela) => void
}

export function BarraLateral({ tela, onTrocarTela }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <span>K</span>
          <i />
        </div>
        <div>
          <b>karsten</b>
          <small>ENGENHARIA · T&M</small>
        </div>
      </div>

      <div className="side-caption">ESPAÇO DE TRABALHO</div>
      <div className="workspace">
        <span className="workspace-icon">⌂</span>
        <span>
          <b>Auto-T&amp;M</b>
          <small>Projeto de tempos e métodos</small>
        </span>
        <span className="chevron">⌄</span>
      </div>

      <div className="side-caption menu-caption">MENU PRINCIPAL</div>
      <nav>
        {MENU.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${tela === item.id ? 'active' : ''}`}
            onClick={() => onTrocarTela(item.id)}
          >
            <span className="nav-icon">{item.icone}</span>
            <span>{item.label}</span>
            <span className="nav-number">{item.numero}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="status-dot" />
        <span>Motor de cálculo ativo</span>
        <span className="version">v1.0</span>
      </div>
      <div className="user-card">
        <div className="avatar">TM</div>
        <div>
          <b>Engenharia</b>
          <small>Tempos &amp; Métodos</small>
        </div>
        <span className="more">···</span>
      </div>
    </aside>
  )
}
