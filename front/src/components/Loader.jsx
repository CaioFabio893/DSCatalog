/**
 * Indicador de carregamento.
 */
export default function Loader({ text = 'Carregando...' }) {
  return (
    <div className="text-center mt-4 mb-4">
      <div className="spinner" style={{ margin: '0 auto 12px' }} />
      <p className="text-muted" style={{ fontSize: 14 }}>{text}</p>
      <style>{`
        .spinner {
          width: 34px;
          height: 34px;
          border: 3px solid var(--gray-200);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
