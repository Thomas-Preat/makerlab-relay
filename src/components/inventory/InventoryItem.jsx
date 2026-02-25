import { useState, useEffect } from "react";

function InventoryItem({ item, role, onBorrow, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });
  const [unlimited, setUnlimited] = useState(item.quantity == null);

  // keep form in sync with props when item changes
  useEffect(() => {
    setForm({ ...item });
    setUnlimited(item.quantity == null);
  }, [item]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (field === "quantity") setUnlimited(false);
  };

  const save = () => {
    let updatedQuantity;
    if (unlimited) {
      updatedQuantity = null;
    } else {
      const qty = Number(form.quantity);
      if (qty < 0) {
        alert("La quantité ne peut pas être négative");
        return;
      }
      updatedQuantity = qty;
    }
    const updated = { ...form, quantity: updatedQuantity };
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
              Quantité: 
              <input
                type="number"
                value={form.quantity ?? ""}
                disabled={unlimited}
                onChange={handleChange("quantity")}
              />
            </label>
            <label style={{ marginLeft: "1rem" }}>
              <input
                type="checkbox"
                checked={unlimited}
                onChange={e => {
                  setUnlimited(e.target.checked);
                  if (e.target.checked) {
                    setForm(prev => ({ ...prev, quantity: null }));
                  }
                }}
              />
              Quantité illimitée
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
          <p>Disponible : {item.quantity == null ? "oui" : item.quantity}</p>
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