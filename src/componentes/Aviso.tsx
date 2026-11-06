interface Props {
  mensagem: string
  erro: string
  onFechar: () => void
}

export function Aviso({ mensagem, erro, onFechar }: Props) {
  if (!mensagem && !erro) return null
  return (
    <div className={`notice ${erro ? 'error' : ''}`}>
      <span>{erro ? '!' : '✓'}</span>
      {erro || mensagem}
      <button onClick={onFechar}>×</button>
    </div>
  )
}
