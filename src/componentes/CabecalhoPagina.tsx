interface Props {
  titulo: string
  descricao: string
  tituloPO: string
  revisao: string
  onExportar?: () => void
}

export function CabecalhoPagina({ titulo, descricao, tituloPO, revisao, onExportar }: Props) {
  return (
    <div className="cabecalho">
      <div>
        <h1>{titulo}</h1>
        <p>{descricao}</p>
      </div>
      <div className="cabecalho-acoes">
        <span className="po-atual">
          {tituloPO || 'PO sem título'} · rev. {revisao || '00'}
        </span>
        {onExportar && (
          <button className="botao primario" onClick={onExportar}>
            Exportar Excel
          </button>
        )}
      </div>
    </div>
  )
}
