import { useState, useEffect } from "react";

function InventoryItem({ item, role, onBorrow, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });

  // keep form in sync with props when item changes
  useEffect(() => {
    setForm({ ...item });
  }, [item]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const save = () => {
    // quantity should be a number
    const updated = { ...form, quantity: Number(form.quantity) };
    onUpdate && onUpdate(updated);
    setEditing(false);
  };

  const cancel = () => {
    setForm({ ...item });
    setEditing(false);
  };

  return (
    <div className="inventory-item">
      {editing ? (
        <div>
          <div>
            <label>
              Nom: <input value={form.name} onChange={handleChange("name")} />
            </label>
          </div>
          <div>
            <label>
              Catégorie: <input value={form.category} onChange={handleChange("category")} />
            </label>
          </div>
          <div>
            <label>
              Quantité: <input type="number" value={form.quantity} onChange={handleChange("quantity")} />
            </label>
          </div>
          <div>
            <label>
              Emplacement: <input value={form.location} onChange={handleChange("location")} />
            </label>
          </div>
          <button onClick={save}>Enregistrer</button>{" "}
          <button onClick={cancel}>Annuler</button>
        </div>
      ) : (
        <>
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
            <button onClick={() => setEditing(true)}>Modifier</button>
          )}
        </>
      )}
    </div>
  );
}

export default InventoryItem;