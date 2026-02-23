function InventoryItem({ item, role, onBorrow }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      padding: "1rem",
      marginBottom: "1rem",
      background: "white"
    }}>
      <h3>{item.name}</h3>
      <p>Catégorie : {item.category}</p>
      <p>Disponible : {item.quantity}</p>
      <p>Emplacement : {item.location}</p>

      {role === "student" && item.quantity > 0 && (
        <button onClick={() => onBorrow(item.id)}>
          Demander
        </button>
      )}

      {role === "teacher" && (
        <button>Modifier</button>
      )}
    </div>
  );
}

export default InventoryItem;