import { useState, useEffect } from "react";

function InventoryItem({ item, role, onBorrow, onUpdate, onDelete, categories = [] }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...item });
  const [unlimited, setUnlimited] = useState(item.quantity == null);
  const [isCustomCategory, setIsCustomCategory] = useState(
    Boolean(item.category) && !categories.includes(item.category)
  );

  // keep form in sync with props when item changes
  useEffect(() => {
    setForm({ ...item });
    setUnlimited(item.quantity == null);
    setIsCustomCategory(Boolean(item.category) && !categories.includes(item.category));
  }, [item, categories]);

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
        <div className="inventory-edit-form">
          <div className="inventory-form-row">
            <label>
              Nom: <input value={form.name} onChange={handleChange("name")} />
            </label>
          </div>
          <div className="inventory-form-row">
            <label>
              Référence: <input value={form.reference || ""} onChange={handleChange("reference")} placeholder="Ex: S140" />
            </label>
          </div>
          <div className="inventory-form-row">
            <label>
              Catégorie:
              <select
                value={isCustomCategory ? "__custom__" : (form.category || "")}
                onChange={(e) => {
                  const selected = e.target.value;
                  if (selected === "__custom__") {
                    setIsCustomCategory(true);
                    setForm(prev => ({ ...prev, category: "" }));
                    return;
                  }
                  setIsCustomCategory(false);
                  setForm(prev => ({ ...prev, category: selected }));
                }}
              >
                <option value="">Choisir une catégorie</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="__custom__">Nouvelle catégorie...</option>
              </select>
            </label>
          </div>
          {isCustomCategory && (
            <div className="inventory-form-row">
              <label>
                Nouvelle catégorie: <input value={form.category} onChange={handleChange("category")} />
              </label>
            </div>
          )}
          <div className="inventory-form-row">
            <label>
              Quantité: 
              <input
                type="number"
                value={form.quantity ?? ""}
                disabled={unlimited}
                onChange={handleChange("quantity")}
              />
            </label>
            <div className="inventory-checkbox-under">
              <label className="inventory-inline-checkbox">
                Quantité illimitée
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
                
              </label>
            </div>
          </div>
          <div className="inventory-form-row">
            <label>
              Emplacement: <input value={form.location} onChange={handleChange("location")} />
            </label>
          </div>
          <div className="inventory-form-row">
            <label>
              Image (URL) : <input value={form.image || ""} onChange={handleChange("image")} placeholder="https://..." />
            </label>
          </div>
          <div className="inventory-form-actions">
            <button onClick={save}>Enregistrer</button>
            <button className="secondary" onClick={cancel}>Annuler</button>
          </div>
        </div>
      ) : (
        <div className="inventory-item-content">
          {role === "teacher" && (
            <div className="inventory-item-top-actions">
              <button className="inventory-item-edit-btn" onClick={() => setEditing(true)}>Modifier</button>
              <button className="inventory-item-delete-btn" onClick={() => onDelete && onDelete(item.id)}>Supprimer</button>
            </div>
          )}

          {item.image && (
            <div className="inventory-item-image">
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          <div className="inventory-item-details">
            <h3>{item.name}</h3>
            {item.reference && <div className="inventory-item-reference">{item.reference}</div>}
            <p>Catégorie : {item.category}</p>
            <p>Disponible : {item.quantity == null ? "oui" : item.quantity}</p>
            <p>Emplacement : {item.location}</p>

            {role === "student" && item.quantity > 0 && (
              <button onClick={() => onBorrow(item.id)}>
                Demander
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryItem;