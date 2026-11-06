interface Props {
  titulo: string
  descricao: string
  tituloPO: string
  revisao: string
  onExportar?: () => void
}

export function CabecalhoPagina({ titulo, descricao, tituloPO, revisao, onExportar }: Props) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          KARSTEN <span>·</span> TEMPOS E MÉTODOS
        </div>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
      <div className="heading-actions">
        <span className="revision-tag">
          {tituloPO || 'PO-NOVA'} <b>REV. {revisao || '00'}</b>
        </span>
        {onExportar && (
          <button className="button primary" onClick={onExportar}>
            <span>↓</span> Exportar Excel
          </button>
        )}
      </div>
    </div>
  )
}
