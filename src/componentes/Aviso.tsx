interface Props {
  mensagem: string
  erro: string
  onFechar: () => void
}

export function Aviso({ mensagem, erro, onFechar }: Props) {
  if (!mensagem && !erro) return null
  return (
    <div className={erro ? 'aviso erro' : 'aviso'} role={erro ? 'alert' : 'status'}>
      <span>{erro || mensagem}</span>
      <button onClick={onFechar} aria-label="Fechar aviso">
        Fechar
      </button>
    </div>
  )
}
