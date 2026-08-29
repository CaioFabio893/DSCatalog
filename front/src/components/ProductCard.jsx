const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function ProductCard({ product }) {
  return (
    <div
      className="card"
      style={{
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div
        style={{
          height: 180,
          background: '#eef2f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {product.imgUrl ? (
          <img
            src={product.imgUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <span className="text-muted">Sem imagem</span>
        )}
      </div>

      <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 16, marginBottom: 6 }}>{product.name}</h3>
        <p className="text-muted" style={{ fontSize: 13, flex: 1 }}>
          {product.description && product.description.length > 140
            ? product.description.slice(0, 140) + '...'
            : product.description}
        </p>
        <div
          style={{
            marginTop: 14,
            fontWeight: 800,
            fontSize: 18,
            color: 'var(--primary)',
          }}
        >
          {formatter.format(product.price)}
        </div>
      </div>
    </div>
  );
}
