interface Props {
  titulo: string
  salvo: boolean
}

export function BarraSuperior({ titulo, salvo }: Props) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        Auto-T&amp;M <span>/</span> <b>{titulo}</b>
      </div>
      <div className="top-actions">
        {salvo ? (
          <span className="saved" title="Os dados ficam guardados neste navegador e voltam ao recarregar a página">
            <i /> Alterações salvas neste navegador
          </span>
        ) : (
          <span className="saved not-saved" title="O navegador bloqueou o armazenamento local (aba anônima?)">
            <i /> Não foi possível salvar neste navegador
          </span>
        )}
        <button className="help-button" title="Ajuda">
          ?
        </button>
      </div>
    </header>
  )
}
